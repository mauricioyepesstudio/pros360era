# EVOLUSA — Regulatory Policy

Architecture only — no migration applied, nothing implemented, no attempt to encode all U.S. law. This defines the **extensible contract**; only explicitly reviewed rules are ever populated, one row at a time, by a human — never inferred or auto-generated.

## Milestone 04A — implemented as code (proposed migration, not applied)

`data/compliance/regulatory-policy.ts` is real, live TypeScript now (not just this doc's prose) — `RegulatoryPolicy` type and `getRegulatoryPolicy()`, with exactly the one reviewed row below. `lib/opportunities/eligibility.ts` consults it directly: a `regulatoryPolicy === undefined` result blocks eligibility (`REGULATORY_BLOCK`) unconditionally, and `verificationRequirement` (currently `null` for the one live row) is what determines whether `professional_verifications`/`identity_verified` becomes a hard eligibility gate — for `MARKETING`/`FL` it does not, which is precisely why Daniela Torres (unverified) stays eligible. No database table backs this yet — `supabase/migrations/0007_evolusa_opportunity_engine_v1.sql` (proposed, not applied) references the resolved `professional_category`/policy outcome only through values already computed in TypeScript, never a `regulatory_policies` table.

## The contract

`data/compliance/claims.ts`'s existing `serviceCompliance` is category-only. Regulatory Policy extends it with a **jurisdiction** axis and several restriction lists that don't exist yet, while reusing everything `serviceCompliance` already got right (the disclaimer registry, the regulated/enabled-by-default distinction):

```ts
type RegulatoryPolicy = {
  category: ServiceCategory;                          // reuses data/compliance/claims.ts
  jurisdiction: string;                                 // state code, or "US" for federally-governed matters (e.g., immigration status itself)
  regulated: boolean;                                    // mirrors serviceCompliance.requiresVerification, now jurisdiction-scoped
  allowedInformationalGuidance: boolean;                 // can EvolUSAia even discuss this topic educationally in this jurisdiction
  professionalCredentialRequirement: string | null;      // human-readable description ("state bar license"), not a live check
  verificationRequirement: VerificationTypeId | null;    // ties into the existing data/professional/verification-types.ts catalog
  routingRestrictions: readonly string[];                // e.g. "no automated routing without human review"
  solicitationRestrictions: readonly string[];           // e.g. bar-rule constraints on unsolicited legal-service marketing
  monetizationRestrictions: readonly string[];           // e.g. "no per-lead fee"
  requiredDisclosureIds: readonly string[];              // reuses the existing disclaimers registry, never a new one
  humanEscalationRequired: boolean;
};

function getRegulatoryPolicy(category: ServiceCategory, jurisdiction: string): RegulatoryPolicy | undefined;
```

`getRegulatoryPolicy` is consulted from two places, never bypassed: the eligibility contract (a regulated need can only route to a professional who satisfies `verificationRequirement`, and only if `routingRestrictions` permit routing at all) and the monetization guardrail (below). No feature is allowed to hardcode a category compliance check independently of this function — that duplication is exactly how a regulated category would end up under-protected in one code path and over-protected in another.

**V1 population: one row.** `{ category: "MARKETING", jurisdiction: "FL", regulated: false, ... }`, copied directly from `serviceCompliance`'s existing `MARKETING` entry. Every other category/jurisdiction pair returns `undefined` (not "unregulated" — `undefined` from this function must be treated as "no reviewed policy exists, do not route" wherever it's consulted, the safe-by-default direction).

## Monetization guardrails

```ts
type CommercialModel = "SUBSCRIPTION" | "SPONSORED_PLACEMENT" | "OPPORTUNITY_FEE" | "BOOKING_FEE" | "OTHER";

function commercialModelPolicy(category: ServiceCategory, jurisdiction: string): readonly CommercialModel[];
```

Conceptually supported, **none enabled yet**:

| Category group | Safe today (design-level) | Needs real legal review before ever proposing |
| --- | --- | --- |
| `SERVICE_BUSINESS` (Marketing, Bookkeeping, Notary, Business Operations, Education) | `SUBSCRIPTION`, `SPONSORED_PLACEMENT`, `BOOKING_FEE`, `OTHER` (CRM/tooling) | `OPPORTUNITY_FEE` — even here, needs a decision on *who* it's charged to and how it's disclosed before building it |
| `REGULATED` (Legal, Immigration, Tax, Insurance, Notary-where-regulated) | `SUBSCRIPTION`, `OTHER` (CRM/tooling) | `OPPORTUNITY_FEE`/`BOOKING_FEE` — several state bars restrict fee-sharing with non-lawyers; this is the same unresolved risk MVP-V2 already flagged, not re-litigated as resolved here. `SPONSORED_PLACEMENT` for a regulated category specifically needs its own review (a paid-visibility fee is closer to advertising than referral fee, but "closer to" is not a legal determination) |

**No universal lead-price assumption. No universal referral-fee model.** A flat SaaS-style subscription is the only commercial model that's safe to *assume* works across every category without a category-specific legal pass — everything else is evaluated per `(category, jurisdiction)`, never applied platform-wide by default.

## TRUST IS NEVER FOR SALE

The one rule every other guardrail in this doc, the Intelligence doc, and the Lead/Opportunity Engine doc exists to protect: **no commercial model, in any category or jurisdiction, may ever increase `organicScore`, change `isEligible`'s output, or influence `identity_verified` or any future verification type.** `commercialModelPolicy` governs what a professional or EVOLUSA may charge — it has no path into the scoring or eligibility functions, by construction (their signatures don't accept a billing parameter). Sponsorship, where enabled, buys a labeled, separate visibility slot inside the already-eligible set and nothing else.

## Legal/immigration separability

`LEGAL`/`IMMIGRATION` are architecturally separable from ordinary commercial categories at every layer already designed this milestone, not just here: `Need.regulated`/`jurisdictionSensitive` flags (Intelligence doc), the `MODERATE` risk floor from `serviceCompliance` (EvolUSAia doc), the `humanEscalationRequired`/`verificationRequirement` gate inside `isEligible` (Intelligence doc), and now this doc's stricter monetization column. There is no single place where relaxing a rule for `LEGAL`/`IMMIGRATION` would have to be remembered manually — each layer independently defaults to the more restrictive posture for these categories.
