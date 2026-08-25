import type { ServiceCategory } from "./claims";
import type { VerificationTypeId } from "@/data/professional/verification-types";

/**
 * Extends the existing serviceCompliance table (category-only) with a
 * jurisdiction axis and the routing/solicitation/monetization restriction
 * lists it doesn't carry. Never encodes broader law — only explicitly
 * reviewed (category, jurisdiction) pairs exist here; every other pair is
 * simply absent from the array. getRegulatoryPolicy returning undefined
 * must be read as "no reviewed policy — do not route," never as
 * "unregulated." See docs/EVOLUSA-REGULATORY-POLICY.md for the full
 * contract and monetization-guardrail reasoning.
 */
export type RegulatoryPolicy = {
  category: ServiceCategory;
  /** State code for now — "US" is reserved for a future federally-governed policy, not used by any V1 row. */
  jurisdiction: string;
  regulated: boolean;
  allowedInformationalGuidance: boolean;
  professionalCredentialRequirement: string | null;
  /** Ties into the existing verification-types catalog. null means this category/jurisdiction does not require any professional_verifications row to be eligible. */
  verificationRequirement: VerificationTypeId | null;
  routingRestrictions: readonly string[];
  solicitationRestrictions: readonly string[];
  monetizationRestrictions: readonly string[];
  /** Reuses the existing data/compliance/claims.ts disclaimer registry — never a new one. */
  requiredDisclaimerIds: readonly string[];
  humanEscalationRequired: boolean;
};

/**
 * V1: exactly one reviewed row, copied from serviceCompliance's existing
 * MARKETING entry. verificationRequirement is explicitly null — Milestone
 * 03's identity verification is not required for this category, so an
 * unverified-but-approved professional (Daniela Torres) stays fully
 * eligible. This is a deliberate choice, not an oversight: see
 * lib/opportunities/match.ts for why identity_verified only ever becomes a
 * scoring bonus when a policy row actually calls for it.
 */
export const regulatoryPolicies = [
  {
    category: "MARKETING",
    jurisdiction: "FL",
    regulated: false,
    allowedInformationalGuidance: true,
    professionalCredentialRequirement: null,
    verificationRequirement: null,
    routingRestrictions: [],
    solicitationRestrictions: [],
    monetizationRestrictions: [],
    requiredDisclaimerIds: [],
    humanEscalationRequired: false,
  },
] as const satisfies readonly RegulatoryPolicy[];

export function getRegulatoryPolicy(category: ServiceCategory, jurisdiction: string): RegulatoryPolicy | undefined {
  return regulatoryPolicies.find((policy) => policy.category === category && policy.jurisdiction === jurisdiction);
}
