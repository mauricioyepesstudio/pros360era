import { NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
import { leadId } from "@/lib/crm/followup";
import { pilotEnabled } from "@/lib/inquiries/validation";

/**
 * The same CRM tenant's approved professional can view contextual requests.
 * Never disclose the requester UUID or raw consent record through this API.
 */
export async function GET(_request: Request, {params}: {params:Promise<{id:string}>}) {
  if(!pilotEnabled()) return NextResponse.json({error:"No disponible."},{status:404});
  const access=await getCRMAccess();
  if(access.response) return access.response;
  const {id}=await params;
  if(!leadId.safeParse(id).success) return NextResponse.json({error:"Prospecto no encontrado."},{status:404});
  const {data,error}=await access.supabase
    .from("crm_profile_inquiries")
    .select("id,service,summary,consent_at,notification_status,created_at")
    .eq("lead_id",id)
    .eq("professional_user_id",access.user.id)
    .order("created_at",{ascending:false}).limit(20);
  if(error) return NextResponse.json({error:"No se pudieron consultar las solicitudes."},{status:503});
  return NextResponse.json({data:data??[]});
}
