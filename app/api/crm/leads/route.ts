import { NextRequest, NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
import { leadInput, listInput, nullable } from "@/lib/crm/validation";

const columns = "id,name,email,phone,whatsapp,source,source_url,status,qualification_score,notes,created_at,updated_at";

export async function GET(request: NextRequest) {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  const parsed = listInput.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los filtros de búsqueda." }, { status: 400 });
  const filters = parsed.data;
  try {
    let query = access.supabase.from("crm_leads").select(columns, { count: "exact" }).eq("user_id", access.user.id).order("created_at", { ascending: false });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.source) query = query.eq("source", filters.source);
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
  const parsed = leadInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos del contacto." }, { status: 400 });
  const body = parsed.data;
  try {
    // user_id and protected defaults come from PostgreSQL, never the submitted body.
    const { data, error } = await access.supabase.from("crm_leads").insert({ source: body.source, source_url: nullable(body.sourceUrl), name: nullable(body.name), email: nullable(body.email), phone: nullable(body.phone), whatsapp: nullable(body.whatsapp), notes: nullable(body.notes) }).select(columns).single();
    if (error?.code === "23505") return NextResponse.json({ error: "Ya tienes un registro con ese correo." }, { status: 409 });
    if (error || !data) return NextResponse.json({ error: "No pudimos guardar los datos. Intenta de nuevo." }, { status: 503 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No pudimos guardar los datos. Intenta de nuevo." }, { status: 503 });
  }
}
