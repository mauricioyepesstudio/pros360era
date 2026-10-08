import { createSupabaseServerClient } from "@/lib/supabase/server";
import { professionalScheduleAllowed,professionalScheduleVersion,parseProfessionalSchedule,parseBookingUrl } from "./validation";
import { professionalScheduleId } from "./identity";
async function scheduleOwner(){
 const db=await createSupabaseServerClient();if(!db)return null;
 const {data:{user},error:authError}=await db.auth.getUser();if(!user || authError)return null;
 const [{data:profile,error:roleError},{data:professional,error:professionalError}]=await Promise.all([
  db.from("profiles").select("role").eq("id",user.id).maybeSingle(),
  db.from("professional_profiles").select("id,booking_url").eq("user_id",user.id).maybeSingle()
 ]);
 if(roleError || professionalError || !professionalScheduleAllowed(profile?.role,Boolean(professional)))return null;
 return {db,user,professional:professional!};
}
export async function getMyProfessionalSchedule(){
 const owner=await scheduleOwner();if(!owner)return {available:false,schedule:null,bookingUrl:null};
 const {data,error}=await owner.db.from("onboarding_responses").select("answers").eq("id",professionalScheduleId(owner.user.id)).eq("user_id",owner.user.id).eq("roadmap_version",professionalScheduleVersion).maybeSingle();
 return {available:!error,schedule:parseProfessionalSchedule(data?.answers),bookingUrl:owner.professional.booking_url as string|null};
}
export async function saveMyProfessionalSchedule(input:unknown){
 const schedule=parseProfessionalSchedule(input);if(!schedule)return {saved:false,message:"Revisa la zona horaria y las franjas. Activa al menos un día o pausa la disponibilidad."};
 const owner=await scheduleOwner();if(!owner)return {saved:false,message:"Necesitas acceso profesional y un perfil propio para guardar tu agenda."};
 const {data,error}=await owner.db.from("onboarding_responses").upsert({id:professionalScheduleId(owner.user.id),user_id:owner.user.id,answers:schedule,selected_needs:[],roadmap_version:professionalScheduleVersion},{onConflict:"id"}).select("answers").single();
 return error || !parseProfessionalSchedule(data?.answers)?{saved:false,message:"No pudimos guardar. Tus horarios siguen en el formulario."}:{saved:true,message:schedule.status==="PAUSED"?"Disponibilidad pausada y configuración guardada.":"Preferencias de disponibilidad guardadas. No se crearon reservas."};
}
export async function saveMyBookingUrl(input:unknown){
 const parsed=parseBookingUrl(input);if(!parsed.valid)return {saved:false,message:"Usa un enlace HTTPS completo, sin contraseña, o déjalo vacío para quitarlo."};
 const owner=await scheduleOwner();if(!owner)return {saved:false,message:"Necesitas acceso profesional y un perfil propio."};
 const {data,error}=await owner.db.from("professional_profiles").update({booking_url:parsed.url}).eq("user_id",owner.user.id).select("booking_url").maybeSingle();
 return error || !data?{saved:false,message:"No pudimos guardar el enlace. Inténtalo de nuevo."}:{saved:true,message:parsed.url?"Enlace de reservas guardado. Abre el enlace para comprobar la configuración del proveedor.":"Enlace de reservas eliminado."};
}
