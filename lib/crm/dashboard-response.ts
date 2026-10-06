export interface DashboardData {
  totalLeads: number;
  leadsThisMonth: number;
  leadsBySource: Record<string, number>;
  conversationsByChannel: Record<string, number>;
  openConversations: number;
  tasksOverdue: number;
  tasksToday: number;
  opportunitiesInPipeline: number;
  pipelineValue: number;
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
  const metrics = ["totalLeads", "leadsThisMonth", "openConversations", "tasksOverdue", "tasksToday", "opportunitiesInPipeline", "pipelineValue", "conversionRate"];
  if (metrics.some((key) => typeof row[key] !== "number" || !Number.isFinite(row[key]))) return null;
  for (const key of ["leadsBySource", "conversationsByChannel"]) {
    const counts = row[key];
    if (!counts || typeof counts !== "object" || Array.isArray(counts) || Object.values(counts).some((count) => typeof count !== "number" || !Number.isFinite(count))) return null;
  }
  return value as DashboardData;
}
