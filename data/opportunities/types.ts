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
