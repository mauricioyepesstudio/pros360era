import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    let query = supabase
      .from("crm_conversations")
      .select(
        `*,
        crm_contacts(name, email),
        crm_messages(count)`
      )
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (channel) query = query.eq("channel", channel);

    const { data, count, error } = await query.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/crm/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { contactId, channel, channelId, subject } = body;

    if (!contactId || !channel) {
      return NextResponse.json(
        { error: "contactId and channel are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("crm_conversations")
      .insert({
        user_id: user.id,
        contact_id: contactId,
        channel,
        channel_id: channelId,
        subject,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/crm/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
