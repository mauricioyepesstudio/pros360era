import { createHash } from "node:crypto";
/** Deterministic onboarding_responses id for a professional's planner row (one per user). */
export function professionalPlannerId(userId: string): string {
  const h = createHash("sha256").update(`evolusa:professional-planner-v1:${userId}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-8${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
