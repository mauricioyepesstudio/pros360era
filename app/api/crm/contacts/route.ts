import { NextRequest, NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
import { contactInput, listInput, nullable } from "@/lib/crm/validation";

const columns = "id,name,email,phone,whatsapp,company_name,job_title,contact_type,lifecycle_stage,opted_in_email,opted_in_whatsapp,opted_in_sms,created_at,updated_at";

export async function GET(request: NextRequest) {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  const parsed = listInput.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los filtros de búsqueda." }, { status: 400 });
  const filters = parsed.data;
  try {
    let query = access.supabase.from("crm_contacts").select(columns, { count: "exact" }).eq("user_id", access.user.id).order("created_at", { ascending: false });
    if (filters.lifecycleStage) query = query.eq("lifecycle_stage", filters.lifecycleStage);
    if (filters.q) query = query.ilike("name", `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`);
    const { data, count, error } = await query.range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1);
    if (error) return NextResponse.json({ error: "No pudimos cargar tus datos. Intenta de nuevo." }, { status: 503 });
    return NextResponse.json({ data: data ?? [], total: count ?? 0, page: filters.page, pageSize: filters.pageSize });
  } catch {
    return NextResponse.json({ error: "No pudimos cargar tus datos. Intenta de nuevo." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  const parsed = contactInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos del contacto." }, { status: 400 });
  const body = parsed.data;
  try {
    // user_id and protected defaults come from PostgreSQL, never the submitted body.
    const { data, error } = await access.supabase.from("crm_contacts").insert({ name: body.name, email: nullable(body.email), phone: nullable(body.phone), whatsapp: nullable(body.whatsapp), company_name: nullable(body.companyName), job_title: nullable(body.jobTitle) }).select(columns).single();
    if (error?.code === "23505") return NextResponse.json({ error: "Ya tienes un registro con ese correo." }, { status: 409 });
    if (error || !data) return NextResponse.json({ error: "No pudimos guardar los datos. Intenta de nuevo." }, { status: 503 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No pudimos guardar los datos. Intenta de nuevo." }, { status: 503 });
  }
}
