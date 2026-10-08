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
