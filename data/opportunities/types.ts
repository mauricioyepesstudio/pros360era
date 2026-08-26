import type { ConsultationMode } from "@/data/professional/types";

export const intentReadinessValues = ["EXPLORING", "CONSIDERING", "READY_TO_ACT"] as const;
export type IntentReadiness = (typeof intentReadinessValues)[number];

/**
 * Reduced from the candidate 11-state lifecycle, then reduced again to 6 in
 * the Milestone 04A security-hardening pass: MATCHED was dropped earlier
 * (a row is never created without a match already attached, so CREATED
 * already implies it) and CONSENTED is dropped here — it's not just
 * unused, it's provably unreachable: create_qualified_opportunity only
 * ever writes 'CREATED', and consent_and_route_opportunity (the only other
 * writer) transitions CREATED -> ROUTED in one atomic statement, with the
 * consent_receipts row itself as the durable proof consent happened.
 * Keeping a status value no code path can ever produce is exactly the kind
 * of unreachable state YAGNI exists to catch. Every remaining state has a
 * real, if not yet all built, writer — see 0007's state-writer comments.
 */
export const opportunityStatuses = ["CREATED", "ROUTED", "CONTACTED", "COMPLETED", "DECLINED", "EXPIRED"] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

/**
 * Milestone 04B: EXPIRED stays in this union as a dormant, never-persisted
 * value — no RPC writes it and no migration mutates a row's stored status
 * to it. It exists only so getEffectiveStatus() (lib/opportunities/
 * lifecycle.ts) can return it as a display-time derivation from
 * `status === 'ROUTED' && expiresAt <= now()`, per the explicit "a read
 * should remain a read" decision — see docs/EVOLUSA-OPPORTUNITY-LIFECYCLE.md.
 */
export type EffectiveOpportunityStatus = OpportunityStatus;

export const declinedByValues = ["MEMBER", "PROFESSIONAL"] as const;
export type DeclinedBy = (typeof declinedByValues)[number];

/**
 * Actor-scoped, not one shared ambiguous enum — a professional and a member
 * decline for structurally different reasons, and mixing them into one flat
 * list would let either party pick a reason that doesn't describe their own
 * situation (e.g., a professional selecting "no longer needed," a member's
 * reason). Enforced both here (TypeScript) and in the database CHECK
 * constraint + decline_opportunity's own validation — the same
 * defense-in-depth layering already used everywhere else in this project.
 * OTHER exists per actor so analytics can still distinguish "professional
 * had some other reason" from "member had some other reason" without a
 * freeform text field.
 */
export const declineReasonsByActor = {
  PROFESSIONAL: ["AT_CAPACITY", "OUTSIDE_SCOPE", "UNREACHABLE", "OTHER"],
  MEMBER: ["FOUND_HELP_ELSEWHERE", "NO_LONGER_NEEDED", "NOT_A_FIT", "OTHER"],
} as const satisfies Record<DeclinedBy, readonly string[]>;

export type ProfessionalDeclineReason = (typeof declineReasonsByActor)["PROFESSIONAL"][number];
export type MemberDeclineReason = (typeof declineReasonsByActor)["MEMBER"][number];
export type DeclineReason = ProfessionalDeclineReason | MemberDeclineReason;

/**
 * What a ConsentReceipt records permission FOR — never the values
 * themselves. CONTACT_PHONE was removed in the Milestone 04A hardening
 * pass: nothing in the current schema collects a phone number anywhere
 * (not on profiles, not on professional_profiles, not captured at request
 * time) — including it "for future compatibility" would let a member
 * consent to sharing data EVOLUSA cannot actually produce. Add it back
 * only alongside a real column that can populate it.
 */
export const consentDataCategories = ["NAME", "CONTACT_EMAIL", "CITY", "STATE", "NEED_SUMMARY"] as const;
export type ConsentDataCategory = (typeof consentDataCategories)[number];

/**
 * Server-assembled context for a single opportunity request — deliberately
 * not "the member's profile." state/preferredLanguage come from the
 * existing profiles table; city and preferredConsultationMode are captured
 * at request time because no such column exists on profiles today (see
 * lib/opportunities/eligibility.ts's header comment for why city is never
 * fabricated from a nonexistent source).
 */
export type OpportunityMemberContext = {
  state: string | null;
  preferredLanguage: "es" | "en";
  city: string | null;
  preferredConsultationMode: ConsultationMode;
};

export type Opportunity = {
  id: string;
  memberId: string;
  needId: string;
  /**
   * Resolved from needId server-side, inside create_qualified_opportunity —
   * never a client input, to any RPC, at any step. Stored (not re-derived
   * at read time) so consent_and_route_opportunity's re-validation can
   * check it directly. See supabase/migrations/0007_evolusa_opportunity_engine_v1.sql.
   */
  professionalCategory: string;
  state: string | null;
  city: string | null;
  preferredConsultationMode: ConsultationMode;
  readiness: IntentReadiness;
  status: OpportunityStatus;
  matchedProfessionalProfileId: string | null;
  organicMatchScore: number | null;
  createdAt: string;
  routedAt: string | null;
  /** Set once, at ROUTED time, to routedAt + 7 days. Never recomputed, never extended — see docs/EVOLUSA-OPPORTUNITY-LIFECYCLE.md's Expiration section. */
  expiresAt: string | null;
  contactedAt: string | null;
  completedAt: string | null;
  declinedAt: string | null;
  declinedBy: DeclinedBy | null;
  declineReason: DeclineReason | null;
};

/**
 * Milestone 04C: the member's own /conexiones read — the raw Opportunity
 * row plus the data categories they themselves consented to at ROUTED time
 * (from consent_receipts, which the member already has RLS read access to
 * via "select_own_consent_receipts", 0007). Shown back to the member as
 * "lo que autorizaste compartir" — never gated further, since it's the
 * member's own consent record about their own data.
 */
export type MemberOpportunityView = Opportunity & {
  consentedDataCategories: readonly ConsentDataCategory[];
};

/**
 * Milestone 04C: the shape a professional actually reads, mapped from
 * get_my_routed_opportunities()'s output columns (0008). Distinct from
 * Opportunity — this is a redacted, consent-gated projection, never the raw
 * table row, and several fields (needId, memberName, contactEmail, city,
 * state) are nullable specifically because they're null whenever the
 * corresponding ConsentDataCategory wasn't granted, not because the data is
 * missing.
 */
export type ProfessionalOpportunityView = {
  opportunityId: string;
  needId: string | null;
  status: OpportunityStatus;
  effectiveStatus: EffectiveOpportunityStatus;
  readiness: IntentReadiness;
  city: string | null;
  state: string | null;
  memberName: string | null;
  contactEmail: string | null;
  consentedDataCategories: readonly ConsentDataCategory[];
  createdAt: string;
  routedAt: string | null;
  expiresAt: string | null;
  contactedAt: string | null;
  completedAt: string | null;
  declinedAt: string | null;
  declinedBy: DeclinedBy | null;
  declineReason: DeclineReason | null;
};

export type ConsentReceipt = {
  id: string;
  opportunityId: string;
  memberId: string;
  professionalProfileId: string;
  purpose: string;
  dataCategories: readonly ConsentDataCategory[];
  policyVersion: string;
  consentedAt: string;
};
