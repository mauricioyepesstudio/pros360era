import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/crm/contacts - List contacts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query_text = searchParams.get("q");
    const lifecycleStage = searchParams.get("lifecycleStage");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    let query = supabase
      .from("crm_contacts")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (query_text) {
      query = query.or(
        `name.ilike.%${query_text}%,email.ilike.%${query_text}%,phone.ilike.%${query_text}%`
      );
    }

    if (lifecycleStage) query = query.eq("lifecycle_stage", lifecycleStage);

    const { data, count, error } = await query.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (error) throw error;

    // Fetch tags for each contact
    if (data && data.length > 0) {
      const contactIds = data.map((c) => c.id);
      const { data: tagsData } = await supabase
        .from("crm_contact_tags")
        .select("contact_id, crm_tags(id, name, color)")
        .in("contact_id", contactIds);

      const tagsByContact = new Map<string, unknown[]>();
      tagsData?.forEach((item: { contact_id: string; crm_tags: unknown }) => {
        const tags = tagsByContact.get(item.contact_id) ?? [];
        tags.push(item.crm_tags);
        tagsByContact.set(item.contact_id, tags);
      });

      data.forEach((contact: { id: string; tags?: unknown[] }) => {
        contact.tags = tagsByContact.get(contact.id) || [];
      });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/crm/contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/crm/contacts - Create contact
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, whatsapp, companyName, jobTitle } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("crm_contacts")
      .insert({
        user_id: user.id,
        name,
        email,
        phone,
        whatsapp,
        company_name: companyName,
        job_title: jobTitle,
        contact_type: "prospect",
        lifecycle_stage: "lead",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/crm/contacts error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
