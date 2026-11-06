import {createSupabaseServerClient} from "@/lib/supabase/server";
import {professionalBusinessId} from "./identity";
import {businessOwnerAllowed,parseProfessionalBusiness,professionalBusinessVersion} from "./validation";
async function owner(){
 const db=await createSupabaseServerClient();if(!db)return null;
 const {data:{user},error}=await db.auth.getUser();if(error||!user)return null;
 const [role,profile]=await Promise.all([db.from("profiles").select("role").eq("id",user.id).maybeSingle(),db.from("professional_profiles").select("id").eq("user_id",user.id).maybeSingle()]);
 if(role.error||profile.error||!businessOwnerAllowed(role.data?.role,Boolean(profile.data)))return null;
 return {db,user};
}
export async function getMyProfessionalBusiness(){
 const context=await owner();if(!context)return {available:false,business:null};
 const {data,error}=await context.db.from("onboarding_responses").select("answers").eq("id",professionalBusinessId(context.user.id)).eq("user_id",context.user.id).eq("roadmap_version",professionalBusinessVersion).maybeSingle();
 const business=parseProfessionalBusiness(data?.answers);
 return {available:!error&&(!data||Boolean(business)),business};
}
export async function saveMyProfessionalBusiness(input:unknown){
 const business=parseProfessionalBusiness(input);if(!business)return {saved:false,message:"Completa la actividad, el negocio, el público, los servicios, la oferta y la zona con los límites indicados."};
 const context=await owner();if(!context)return {saved:false,message:"Necesitas tu sesión profesional y un perfil propio para guardar."};
 const {data,error}=await context.db.from("onboarding_responses").upsert({id:professionalBusinessId(context.user.id),user_id:context.user.id,answers:business,selected_needs:[],roadmap_version:professionalBusinessVersion},{onConflict:"id"}).select("answers,user_id").single();
 const stored=parseProfessionalBusiness(data?.answers);
 return error||data?.user_id!==context.user.id||JSON.stringify(stored)!==JSON.stringify(business)?{saved:false,message:"No pudimos confirmar el guardado. Tus respuestas siguen en el formulario."}:{saved:true,message:"Tu negocio quedó guardado. Revisa las nuevas propuestas en el planner; se mantienen como ideas hasta que las apruebes."};
}
