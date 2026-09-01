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
 * V1/V2: reviewed rows only, copied from serviceCompliance's existing
 * non-regulated entries. verificationRequirement is explicitly null for
 * both MARKETING/FL and BUSINESS_OPERATIONS/FL — an unverified-but-approved
 * professional stays fully eligible for either. This is a deliberate
 * choice, not an oversight: see lib/opportunities/match.ts for why
 * identity_verified only ever becomes a scoring bonus when a policy row
 * actually calls for it.
 *
 * BUSINESS_OPERATIONS/FL added 2026-08-31 alongside migration 0011 — same
 * shape as MARKETING/FL since serviceCompliance rates both
 * `requiresVerification: false`/`enabledByDefault: true`.
 *
 * NOTARY/FL added 2026-09-01 alongside migration 0013 (AUTHORED, NOT YET
 * APPLIED) — the first row in this table with regulated: true and a
 * non-null verificationRequirement. Florida notaries public are
 * commissioned under Florida Statutes Chapter 117; a notarization performed
 * by someone without a valid, current commission can be legally void, and
 * "notario fraud" (someone holding themselves out as authorized to notarize
 * or represent, without a valid commission) is a documented fraud pattern
 * specifically targeting this platform's community. verificationRequirement
 * points at NOTARY_COMMISSION_VERIFIED (data/professional/
 * verification-types.ts), a category-specific type — never the generic
 * IDENTITY_VERIFIED type BUSINESS_MARKETING/BUSINESS_OPERATIONS don't even
 * require. professionalCredentialRequirement is descriptive text only (not
 * itself enforced by code) — the ACTUAL enforcement is the hard SQL gate
 * inside create_qualified_opportunity/consent_and_route_opportunity
 * (migration 0013), which blocks an unverified NOTARY professional from
 * ever being matched or routed, not merely scored lower. Keep this table in
 * sync with 0013's allowlist: a category/state pair must never be routable
 * in SQL without a matching row here, and vice versa.
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
  {
    category: "BUSINESS_OPERATIONS",
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
  {
    category: "NOTARY",
    jurisdiction: "FL",
    regulated: true,
    // EVOLUSA may still explain, generally, what a notarization is and when
    // one is typically needed — that is general education, not advice about
    // a specific document or transaction, which stays out of scope here as
    // for every other regulated category.
    allowedInformationalGuidance: true,
    professionalCredentialRequirement: "Active Florida notary public commission (Florida Statutes Chapter 117).",
    verificationRequirement: "NOTARY_COMMISSION_VERIFIED",
    routingRestrictions: [],
    solicitationRestrictions: [],
    monetizationRestrictions: [],
    requiredDisclaimerIds: ["regulated-services"],
    // Regulated categories get a human escalation path by default in this
    // table going forward — the first REGULATED row is exactly the case
    // this field exists for; the two prior unregulated rows correctly have
    // it false.
    humanEscalationRequired: true,
  },
] as const satisfies readonly RegulatoryPolicy[];

export function getRegulatoryPolicy(category: ServiceCategory, jurisdiction: string): RegulatoryPolicy | undefined {
  return regulatoryPolicies.find((policy) => policy.category === category && policy.jurisdiction === jurisdiction);
}
