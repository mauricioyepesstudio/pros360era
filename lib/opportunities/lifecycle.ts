// Relative, not "@/", for this one value import: this module is imported
// directly by tests/opportunity-lifecycle.test.ts, which runs under plain
// `node --test` (no bundler, no path-alias resolution) — Node's native
// TypeScript stripping erases `import type` entirely before resolution
// (so the "@/" type-only imports below are fine), but a real value import
// still has to resolve as an actual module specifier. See
// tests/opportunity-lifecycle.test.ts's own relative imports for the same
// reason.
import { declineReasonsByActor } from "../../data/opportunities/types.ts";
import type { DeclinedBy, EffectiveOpportunityStatus, OpportunityStatus } from "@/data/opportunities/types";

/**
 * Milestone 04B hardening note (same status as eligibility.ts/match.ts):
 * this is the design reference and test target — the authoritative
 * enforcement is the identical expression inside the SQL functions in
 * 0008_evolusa_opportunity_lifecycle_v1.sql. Kept in sync by hand.
 *
 * Never mutates anything — a read stays a read. `status` is only ever
 * displayed as EXPIRED here; the stored column is never written to it.
 */
export function getEffectiveStatus(status: OpportunityStatus, expiresAt: string | null): EffectiveOpportunityStatus {
  if (status === "ROUTED" && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return "EXPIRED";
  }
  return status;
}

export function isValidDeclineReason(declinedBy: DeclinedBy, reason: string): boolean {
  return (declineReasonsByActor[declinedBy] as readonly string[]).includes(reason);
}
