import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { initialCallVersion } from "@/lib/initial-call/validation";
import { parseCanonicalInitialCallRow } from "@/lib/initial-call/identity";
export async function GET() {
 const db = await createSupabaseServerClient();
 if(!db) return NextResponse.json({error:"El servicio no está disponible."},{status:503});
 const {data:{user},error:authError}=await db.auth.getUser();
 if(!user || authError) return NextResponse.json({error:"Inicia sesión."},{status:401});
 const {data:profile,error:roleError}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(roleError) return NextResponse.json({error:"No pudimos verificar el acceso."},{status:503});
 if(profile?.role!=="ADMIN") return NextResponse.json({error:"Acceso solo para administración."},{status:403});
 const service=createSupabaseServiceRoleClient();
 if(!service) return NextResponse.json({error:"La bandeja no está configurada."},{status:503});
 const {data,error}=await service.from("onboarding_responses").select("id,user_id,answers,created_at").eq("roadmap_version",initialCallVersion).eq("answers->>status","REQUESTED").order("created_at",{ascending:false}).limit(100);
 if(error) return NextResponse.json({error:"No pudimos consultar las solicitudes."},{status:503});
 const canonical = (data ?? []).flatMap(row => { const request=parseCanonicalInitialCallRow(row); return request?.status === "REQUESTED" ? [{row, request}] : []; });
 const requests = [];
 // Bound Auth lookup concurrency; never fan out 100 requests at once.
 for(let offset=0; offset<canonical.length; offset+=5) {
  const contacts=await Promise.all(canonical.slice(offset,offset+5).map(async ({row,request})=>{
   const {data:account,error:accountError}=await service.auth.admin.getUserById(row.user_id);
   return {error:accountError, request:{id:row.id,...request,email:account.user?.email ?? null,createdAt:row.created_at}};
  }));
  if(contacts.some(c=>c.error)) return NextResponse.json({error:"No pudimos resolver el contacto. Reintenta."},{status:503});
  requests.push(...contacts.map(c=>c.request));
 }
 return NextResponse.json({requests,limit:100},{headers:{"Cache-Control":"private, no-store"}});
}
