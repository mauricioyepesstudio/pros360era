import { NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
import { requireCRMQuery } from "@/lib/crm/dashboard-response";

export async function GET() {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  try {
    const query = () => access.supabase.from("crm_leads").select("source,status,created_at", { count: "exact", head: true }).eq("user_id", access.user.id);
    const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
    const [total, month, converted] = await Promise.all([
      requireCRMQuery(query()), requireCRMQuery(query().gte("created_at", start.toISOString())), requireCRMQuery(query().eq("status", "converted")),
    ]);
    const sources: Record<string, number> = {};
    for (const source of ["website", "whatsapp", "instagram", "facebook", "email", "referral", "other"]) {
      const { count } = await requireCRMQuery(query().eq("source", source));
      if (count) sources[source] = count;
    }
    return NextResponse.json({ totalLeads: total.count ?? 0, leadsThisMonth: month.count ?? 0, leadsBySource: sources, conversionRate: total.count ? ((converted.count ?? 0) / total.count) * 100 : 0,
      conversationsByChannel: null, openConversations: null, tasksOverdue: null, tasksToday: null, opportunitiesInPipeline: null, pipelineValue: null });
  } catch {
    return NextResponse.json({ error: "CRM no disponible temporalmente. Intenta de nuevo." }, { status: 503 });
  }
}
