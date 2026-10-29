import { z } from "zod";
import {persistArmDraft} from "@/lib/crm/arm";
import {getMyProfessionalProfile} from "@/lib/professional/self-profile";
import {getMyProfessionalBusiness} from "@/lib/professional-business/persistence";
import { NextRequest, NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
import { followupInput, leadDetailColumns, leadId } from "@/lib/crm/followup";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: NextRequest, context: Context) {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  const { id } = await context.params;
  if (!leadId.safeParse(id).success) return NextResponse.json({ error: "Prospecto no encontrado." }, { status: 404 });
  const { data, error } = await access.supabase.from("crm_leads").select(leadDetailColumns).eq("id", id).eq("user_id", access.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "No pudimos cargar el prospecto." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Prospecto no encontrado." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, context: Context) {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  const { id } = await context.params;
  if (!leadId.safeParse(id).success) return NextResponse.json({ error: "Prospecto no encontrado." }, { status: 404 });
  const parsed = followupInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa el estado y las notas." }, { status: 400 });
  const { status, notes, expectedUpdatedAt } = parsed.data;
  const { data, error } = await access.supabase.from("crm_leads").update({ status, notes: notes || null }).eq("id", id).eq("user_id", access.user.id).eq("updated_at", expectedUpdatedAt).select(leadDetailColumns).maybeSingle();
  if (error) return NextResponse.json({ error: "No pudimos guardar el seguimiento." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "El prospecto cambió o ya no está disponible. Recarga antes de guardar." }, { status: 409 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: Context) {
 const access=await getCRMAccess();if(access.response)return access.response;
 const {id}=await context.params;
 if(!leadId.safeParse(id).success)return NextResponse.json({error:"Prospecto no encontrado."},{status:404});
 const input=z.object({expectedUpdatedAt:z.iso.datetime({offset:true})}).strict().safeParse(await request.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:"Recarga el prospecto antes de preparar la accion."},{status:400});
 try{
 const result=await persistArmDraft({ownerId:access.user.id,leadId:id,expectedUpdatedAt:input.data.expectedUpdatedAt},{
  readLead:async(lead,owner)=>{const {data,error}=await access.supabase.from("crm_leads").select("id,user_id,status,notes,updated_at,name,email,phone,whatsapp,source,source_url,created_at").eq("id",lead).eq("user_id",owner).maybeSingle();if(error)throw error;return data;},
  readProfile:async()=>{const [profile,business]=await Promise.all([getMyProfessionalProfile(),getMyProfessionalBusiness()]);if(!profile||!business.available||!business.business)return null;return {displayName:profile.displayName,category:profile.category,businessName:business.business.businessName,services:business.business.services};},
  save:async(lead,owner,notes)=>{const {data,error}=await access.supabase.from("crm_leads").update({notes}).eq("id",lead.id).eq("user_id",owner).eq("updated_at",lead.updated_at).select("id,user_id,status,notes,updated_at,name,email,phone,whatsapp,source,source_url,created_at").maybeSingle();if(error)throw error;return data;}
 });
 const {status,...body}=result;return NextResponse.json(body,{status});
 }catch{return NextResponse.json({error:"No pudimos preparar el seguimiento. No se enviaron mensajes."},{status:503});}
}
