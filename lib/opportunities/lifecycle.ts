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

/**
 * Milestone 04C: what the UI is allowed to offer, derived purely from
 * effective status — never a second source of authorization. The RPC/RLS
 * layer in 0008 remains the only real enforcement; these lists exist so a
 * button is never rendered for an action the backend would reject anyway
 * (e.g. no CONFIRM_COMPLETION ever appears for a professional, structurally,
 * matching that there is no mark_opportunity_completed RPC at all).
 */
export const memberActionValues = ["CONFIRM_COMPLETION", "DECLINE", "START_NEW_SEARCH"] as const;
export type MemberAction = (typeof memberActionValues)[number];

export function getMemberActions(effectiveStatus: EffectiveOpportunityStatus): readonly MemberAction[] {
  switch (effectiveStatus) {
    case "ROUTED":
      return ["DECLINE"];
    case "CONTACTED":
      return ["CONFIRM_COMPLETION", "DECLINE"];
    case "DECLINED":
    case "EXPIRED":
      return ["START_NEW_SEARCH"];
    case "COMPLETED":
    case "CREATED":
    default:
      return [];
  }
}

export const professionalActionValues = ["MARK_CONTACTED", "DECLINE"] as const;
export type ProfessionalAction = (typeof professionalActionValues)[number];

/**
 * ROUTED-but-effectively-expired intentionally returns no actions: marking
 * contacted would be rejected by mark_opportunity_contacted's own expiry
 * check, and declining a lead that already died quietly adds no real value
 * — the opportunity simply becomes a read-only "expired" row for the
 * professional, same as a genuine terminal state.
 */
export function getProfessionalActions(effectiveStatus: EffectiveOpportunityStatus): readonly ProfessionalAction[] {
  switch (effectiveStatus) {
    case "ROUTED":
      return ["MARK_CONTACTED", "DECLINE"];
    case "CONTACTED":
      return ["DECLINE"];
    case "COMPLETED":
    case "DECLINED":
    case "EXPIRED":
    case "CREATED":
    default:
      return [];
  }
}

/**
 * Display-only day-count, derived the same way getEffectiveStatus is —
 * never recomputes or writes expires_at. Returns null whenever expiration
 * framing doesn't apply (not ROUTED, or no expires_at at all): once
 * CONTACTED, 0008 deliberately stops time-boxing the opportunity, so
 * showing a countdown past that point would imply a deadline that no
 * longer exists.
 */
export function getExpirationLabel(status: OpportunityStatus, expiresAt: string | null, now: number = Date.now()): string | null {
  if (status !== "ROUTED" || !expiresAt) return null;

  const msRemaining = new Date(expiresAt).getTime() - now;
  if (msRemaining <= 0) return "Expiró";

  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  return daysRemaining === 1 ? "Expira en 1 día" : `Expira en ${daysRemaining} días`;
}
