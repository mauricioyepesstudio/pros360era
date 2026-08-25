import type { RegulatoryPolicy } from "@/data/compliance/regulatory-policy";
import type { ProfessionalProfilePublic } from "@/data/professional/types";
import type { OpportunityMemberContext } from "@/data/opportunities/types";

/**
 * Milestone 04A hardening note: same status as eligibility.ts — this is the
 * design reference and test target, not the authoritative scorer.
 * create_qualified_opportunity (SECURITY DEFINER, in 0007) computes
 * organic_match_score directly in SQL using the identical weighted terms;
 * the two must be kept in sync by hand.
 */

/**
 * Every reason maps to a named, user-facing string — never a bare number.
 * NEED_CATEGORY_MATCH/SERVES_YOUR_STATE are always present for a professional
 * this function is called on (eligibility already guaranteed both), included
 * here anyway so the full "why" list is self-contained and doesn't require
 * the caller to separately surface eligibility reasons to explain the score.
 */
export const matchReasons = [
  "NEED_CATEGORY_MATCH",
  "SERVES_YOUR_STATE",
  "SAME_CITY",
  "SUPPORTS_VIRTUAL",
  "SUPPORTS_IN_PERSON",
  "ACCEPTING_CLIENTS",
  "IDENTITY_VERIFIED",
] as const;
export type MatchReason = (typeof matchReasons)[number];

export type MatchResult = { organicScore: number; matchReasons: readonly MatchReason[] };

/**
 * Only ever called on a professional evaluateProfessionalEligibility already
 * returned eligible: true for — this function has no gate logic of its own
 * and no payment/sponsorship parameter exists in its signature at all, so
 * there is no argument through which money could enter the score (see
 * docs/EVOLUSA-INTELLIGENCE-MATCH.md's "Paid placement firewall").
 *
 * Same-city bonus: member.city is only ever non-null once a real source for
 * it exists (see data/opportunities/types.ts — nothing populates it in V1's
 * actual create flow today), so this term correctly never fires yet rather
 * than comparing against a fabricated value.
 *
 * Identity-verification bonus: gated on regulatoryPolicy actually requiring
 * verification, not given unconditionally. Documented reasoning (per this
 * milestone's explicit instruction not to award it silently): a category
 * whose compliance layer hasn't decided trust matters shouldn't use
 * verification as an unearned ranking dial either — that would be the same
 * kind of purchasable-looking quality signal the sponsorship firewall exists
 * to prevent, just via a different lever. For MARKETING/FL specifically,
 * verificationRequirement is null, so this bonus never fires for BUSINESS_
 * MARKETING professionals today — Daniela Torres (identity_verified = false)
 * is scored identically to a hypothetically-verified competitor under this
 * policy, not penalized relative to one.
 */
export function calculateOrganicMatch({
  member,
  professional,
  regulatoryPolicy,
}: {
  member: OpportunityMemberContext;
  professional: ProfessionalProfilePublic;
  regulatoryPolicy: RegulatoryPolicy | undefined;
}): MatchResult {
  const reasons: MatchReason[] = ["NEED_CATEGORY_MATCH", "SERVES_YOUR_STATE"];
  let organicScore = 2;

  if (member.city && professional.city && member.city === professional.city) {
    reasons.push("SAME_CITY");
    organicScore += 2;
  }

  if (professional.consultationMode === "VIRTUAL" || professional.consultationMode === "BOTH") {
    reasons.push("SUPPORTS_VIRTUAL");
  }
  if (professional.consultationMode === "IN_PERSON" || professional.consultationMode === "BOTH") {
    reasons.push("SUPPORTS_IN_PERSON");
  }

  reasons.push("ACCEPTING_CLIENTS");
  organicScore += 1;

  if (regulatoryPolicy?.verificationRequirement && professional.identityVerified) {
    reasons.push("IDENTITY_VERIFIED");
    organicScore += 1;
  }

  return { organicScore, matchReasons: reasons };
}
