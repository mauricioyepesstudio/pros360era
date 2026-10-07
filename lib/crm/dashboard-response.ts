export interface DashboardData {
  totalLeads: number;
  leadsThisMonth: number;
  leadsBySource: Record<string, number>;
  conversationsByChannel: Record<string, number> | null;
  openConversations: number | null;
  tasksOverdue: number | null;
  tasksToday: number | null;
  opportunitiesInPipeline: number | null;
  pipelineValue: number | null;
  conversionRate: number;
}

export class CRMUnavailableError extends Error {}

/** Preserve real database failures instead of reporting empty metrics. */
export async function requireCRMQuery<T extends { error: unknown }>(query: PromiseLike<T>): Promise<T> {
  const result = await query;
  if (result.error) throw new CRMUnavailableError("CRM query failed");
  return result;
}

export function parseCRMDashboardResponse(value: unknown): DashboardData | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const metrics = ["totalLeads", "leadsThisMonth", "conversionRate"];
  const pending = ["openConversations", "tasksOverdue", "tasksToday", "opportunitiesInPipeline", "pipelineValue"];
  if (pending.some((key) => row[key] !== null && (typeof row[key] !== "number" || !Number.isFinite(row[key])))) return null;
  if (metrics.some((key) => typeof row[key] !== "number" || !Number.isFinite(row[key]))) return null;
  for (const key of ["leadsBySource", "conversationsByChannel"]) {
    const counts = row[key];
    if (key === "conversationsByChannel" && counts === null) continue;
    if (!counts || typeof counts !== "object" || Array.isArray(counts) || Object.values(counts).some((count) => typeof count !== "number" || !Number.isFinite(count))) return null;
  }
  return value as DashboardData;
}
