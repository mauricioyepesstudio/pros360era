import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total leads
    const { count: totalLeads } = await supabase
      .from("crm_leads")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Leads this month
    const { count: leadsThisMonth } = await supabase
      .from("crm_leads")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    // Leads by source
    const { data: leadsBySourceData } = await supabase
      .from("crm_leads")
      .select("source")
      .eq("user_id", user.id);

    const leadsBySource: Record<string, number> = {};
    leadsBySourceData?.forEach((lead: { source: string }) => {
      leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
    });

    // Conversations by channel
    const { data: convByChannelData } = await supabase
      .from("crm_conversations")
      .select("channel")
      .eq("user_id", user.id);

    const convsByChannel: Record<string, number> = {};
    convByChannelData?.forEach((conv: { channel: string }) => {
      convsByChannel[conv.channel] = (convsByChannel[conv.channel] || 0) + 1;
    });

    // Open conversations
    const { count: openConversations } = await supabase
      .from("crm_conversations")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "open");

    // Tasks overdue
    const { count: tasksOverdue } = await supabase
      .from("crm_tasks")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .lt("due_date", new Date().toISOString().split("T")[0])
      .eq("status", "open");

    // Tasks today
    const today = new Date().toISOString().split("T")[0];
    const { count: tasksToday } = await supabase
      .from("crm_tasks")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("due_date", today)
      .eq("status", "open");

    // Opportunities in pipeline
    const { count: opportunitiesInPipeline } = await supabase
      .from("crm_opportunities")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Pipeline value
    const { data: opportunities } = await supabase
      .from("crm_opportunities")
      .select("weighted_value")
      .eq("user_id", user.id)
      .eq("status", "active");

    const pipelineValue = (opportunities || []).reduce(
      (sum: number, opp: { weighted_value: number | null }) => sum + (opp.weighted_value || 0),
      0
    );

    // Conversion rate (converted leads / total leads)
    const { count: convertedLeads } = await supabase
      .from("crm_leads")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "converted");

    const conversionRate = totalLeads ? ((convertedLeads || 0) / totalLeads) * 100 : 0;

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      leadsThisMonth: leadsThisMonth || 0,
      leadsBySource,
      conversationsByChannel: convsByChannel,
      openConversations: openConversations || 0,
      tasksOverdue: tasksOverdue || 0,
      tasksToday: tasksToday || 0,
      opportunitiesInPipeline: opportunitiesInPipeline || 0,
      pipelineValue: parseFloat(pipelineValue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error) {
    console.error("GET /api/crm/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
