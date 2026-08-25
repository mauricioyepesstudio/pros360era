import type { Need } from "@/data/needs/catalog";
import type { RegulatoryPolicy } from "@/data/compliance/regulatory-policy";
import type { ProfessionalProfilePublic } from "@/data/professional/types";
import type { OpportunityMemberContext } from "@/data/opportunities/types";

/**
 * Milestone 04A hardening note: this function is the design reference and
 * test target for the eligibility rules — it is NOT what an authoritative
 * opportunity is created against anymore. create_qualified_opportunity
 * (SECURITY DEFINER, in 0007) re-implements the same gates directly in SQL,
 * because the actual write must never trust a prior client-side or even
 * server-side-but-separate-request TypeScript computation. Keep this
 * function and its SQL mirror in sync by hand when either changes — the
 * tests here validate the design, not the live write path.
 */

/**
 * Every reason the instruction listed, plus CONSULTATION_MODE_MISMATCH —
 * the given list only named the positive CONSULTATION_MODE_MATCH, but an
 * ineligible-by-mode professional needs a reason code too, the same way
 * every other exclusion does (this file never returns `eligible: false`
 * with an empty reasons array). Deliberately no NOT_APPROVED code: the
 * candidate pool this function is meant to run over is always
 * professional_profiles_public rows, which are already is_approved = true
 * by construction (see lib/opportunities/persistence.ts) — the check has
 * nothing left to test.
 */
export const eligibilityReasons = [
  "CATEGORY_MATCH",
  "CATEGORY_MISMATCH",
  "STATE_MATCH",
  "OUTSIDE_SERVICE_AREA",
  "LANGUAGE_MATCH",
  "LANGUAGE_MISMATCH",
  "CONSULTATION_MODE_MATCH",
  "CONSULTATION_MODE_MISMATCH",
  "NOT_ACCEPTING_CLIENTS",
  "VERIFICATION_REQUIRED",
  "REGULATORY_BLOCK",
] as const;
export type EligibilityReason = (typeof eligibilityReasons)[number];

export type EligibilityResult = { eligible: boolean; reasons: readonly EligibilityReason[] };

const blockingReasons: ReadonlySet<EligibilityReason> = new Set([
  "CATEGORY_MISMATCH",
  "OUTSIDE_SERVICE_AREA",
  "LANGUAGE_MISMATCH",
  "CONSULTATION_MODE_MISMATCH",
  "NOT_ACCEPTING_CLIENTS",
  "VERIFICATION_REQUIRED",
  "REGULATORY_BLOCK",
]);

function isConsultationModeCompatible(professional: ProfessionalProfilePublic["consultationMode"], preferred: ProfessionalProfilePublic["consultationMode"]) {
  return professional === "BOTH" || preferred === "BOTH" || professional === preferred;
}

/**
 * Pure, deterministic, no I/O — every fact it evaluates is a real column on
 * professional_profiles_public or a real field the caller assembled, never
 * an invented one (no professional.city vs member.city gate here: city is
 * a match-score bonus only, see lib/opportunities/match.ts — item 4's own
 * instruction is that city is a "stronger requirement/bonus," not a V1
 * gate, and STATE_MATCH/OUTSIDE_SERVICE_AREA already cover jurisdiction).
 *
 * regulatoryPolicy being undefined means "no reviewed policy exists" and
 * always blocks (REGULATORY_BLOCK) — never permissive-by-default, per
 * docs/EVOLUSA-REGULATORY-POLICY.md.
 */
export function evaluateProfessionalEligibility({
  member,
  need,
  professional,
  regulatoryPolicy,
}: {
  member: OpportunityMemberContext;
  need: Need;
  professional: ProfessionalProfilePublic;
  regulatoryPolicy: RegulatoryPolicy | undefined;
}): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  if (need.possibleProfessionalCategories.includes(professional.category)) {
    reasons.push("CATEGORY_MATCH");
  } else {
    reasons.push("CATEGORY_MISMATCH");
  }

  if (member.state && professional.state === member.state) {
    reasons.push("STATE_MATCH");
  } else {
    reasons.push("OUTSIDE_SERVICE_AREA");
  }

  if (professional.languages.includes(member.preferredLanguage)) {
    reasons.push("LANGUAGE_MATCH");
  } else {
    reasons.push("LANGUAGE_MISMATCH");
  }

  if (isConsultationModeCompatible(professional.consultationMode, member.preferredConsultationMode)) {
    reasons.push("CONSULTATION_MODE_MATCH");
  } else {
    reasons.push("CONSULTATION_MODE_MISMATCH");
  }

  if (!professional.isAcceptingClients) {
    reasons.push("NOT_ACCEPTING_CLIENTS");
  }

  if (!regulatoryPolicy) {
    reasons.push("REGULATORY_BLOCK");
  } else if (regulatoryPolicy.regulated && regulatoryPolicy.verificationRequirement === "IDENTITY_VERIFIED" && !professional.identityVerified) {
    reasons.push("VERIFICATION_REQUIRED");
  }

  const eligible = !reasons.some((reason) => blockingReasons.has(reason));
  return { eligible, reasons };
}
