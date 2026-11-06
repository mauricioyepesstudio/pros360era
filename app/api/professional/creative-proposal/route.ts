import {getMyProfessionalBusiness} from "@/lib/professional-business/persistence";
import {loadOwnerBrandReference} from "@/lib/professional-planner/owner-brand-source";
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
 const [role,profile]=await Promise.all([db.from("profiles").select("role").eq("id",user.id).maybeSingle(),db.from("professional_profiles").select("display_name,category,photo_url,social_links,website_url").eq("user_id",user.id).maybeSingle()]);
 if(role.error||profile.error||!["PROFESSIONAL","ADMIN"].includes(role.data?.role)||!profile.data)return null;
 const reference=await loadOwnerBrandReference(user.id,profile.data).catch(()=>null);
 const business=await getMyProfessionalBusiness();
 return {displayName:profile.data.display_name,category:profile.data.category,websiteUrl:profile.data.website_url,business:business.business,reference};
 },
 render:async(owner,concept,format)=>{
 const css=await readFile(path.join(process.cwd(),"app/globals.css"),"utf8");
 return renderPrivateCreative(owner,concept,format,paletteFromCss(css));
 }});
}
