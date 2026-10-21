import {readFile} from "node:fs/promises";
import path from "node:path";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {handlePrivateCreative} from "@/lib/professional-planner/private-creative-handler";
import {paletteFromCss,renderPrivateCreative} from "@/lib/professional-planner/private-creative-render";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 return handlePrivateCreative(request,{
 owner:async()=>{
 const db=await createSupabaseServerClient();if(!db)return null;
 const {data:{user},error}=await db.auth.getUser();if(error||!user)return null;
 const [role,profile]=await Promise.all([db.from("profiles").select("role").eq("id",user.id).maybeSingle(),db.from("professional_profiles").select("display_name,category").eq("user_id",user.id).maybeSingle()]);
 if(role.error||profile.error||!["PROFESSIONAL","ADMIN"].includes(role.data?.role)||!profile.data)return null;
 return {displayName:profile.data.display_name,category:profile.data.category};
 },
 render:async(owner,concept,format)=>{
 const css=await readFile(path.join(process.cwd(),"app/globals.css"),"utf8");
 return renderPrivateCreative(owner,concept,format,paletteFromCss(css));
 }});
}
