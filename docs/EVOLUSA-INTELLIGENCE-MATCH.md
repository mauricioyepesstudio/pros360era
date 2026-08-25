# EVOLUSA — Intelligence & Match

Architecture only — no migration applied, nothing implemented. This is Milestone 04's intelligence layer: how a user's need becomes a ranked, explainable set of eligible professionals. It builds directly on, and does not duplicate, three already-designed pieces:

- The `LeadIntent`/`IntentReadiness`/`isEligible`/Match-V1-formula/`QualifiedOpportunity` contracts already designed in [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#demand-engine--milestone-04-addendum-architecture-only-not-implemented) — this doc refines the intent side of that contract (the Need catalog sits above it) rather than replacing it.
- The trust-layer/escalation model in [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md) — `PROFESSIONAL_ESCALATION` is still the only thing that ever produces intent.
- Opportunity lifecycle, consent, trust/anti-abuse, and the final data-model decision live in [EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md](./EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md), not here.

## Milestone 04A — implemented as code (proposed migration, not applied)

The Need/Eligibility/Match contracts below are no longer only prose — `data/needs/catalog.ts` (2 entries: `BRANDING`, `WEBSITE`, both mapping to `BUSINESS_MARKETING`), `lib/opportunities/eligibility.ts` (`evaluateProfessionalEligibility`), and `lib/opportunities/match.ts` (`calculateOrganicMatch`) are real, tested, pure TypeScript matching this doc's design exactly — see `tests/opportunity-eligibility.test.ts`/`tests/opportunity-match.test.ts`. One refinement made while implementing: `EligibilityReason` also includes `CONSULTATION_MODE_MISMATCH` (this doc/the 04A instruction only named the positive `CONSULTATION_MODE_MATCH`) so an exclusion-by-mode always has a reason code, matching every other exclusion. The identity-verification match bonus is gated on `RegulatoryPolicy.verificationRequirement` actually being set — never given unconditionally — documented in `match.ts` itself: a category whose compliance layer hasn't decided trust matters shouldn't use verification as an unearned ranking dial. Full data/RLS design lives in [EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md](./EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md)'s own 04A section and `supabase/migrations/0007_evolusa_opportunity_engine_v1.sql` (proposed, not applied).

## A. Need contract

**Need is more granular than `ServiceCategory`, and sits above it.** The previous milestone used `ServiceCategory` directly as the intent signal; that's too coarse to safely separate, for example, "what is asylum?" (educational) from "should I file for asylum?" (individualized, high-risk) — both are `IMMIGRATION` category, very different risk/regulatory profiles. A `Need` is a code-catalog entry that resolves *down* to a `ServiceCategory` (for compliance/eligibility lookups) and *optionally* to zero or more live `professionalCategoryIds` — declaring a `Need` never claims live supply exists.

```ts
type Need = {
  id: string;                                             // e.g. "BRANDING"
  label: string;                                          // Spanish, user-facing
  description: string;
  roadmapCategory: RoadmapCategory;                       // reuses data/account/types.ts — links back to the existing Roadmap
  serviceCategory: ServiceCategory;                        // reuses data/compliance/claims.ts — resolves compliance/regulatory rules
  possibleProfessionalCategories: readonly ProfessionalCategoryId[]; // may be empty — empty means "recognized need, no live supply yet," never fabricated
  regulated: boolean;                                       // mirrors serviceCompliance.requiresVerification for this need's category
  jurisdictionSensitive: boolean;                           // true => must resolve a specific state before any professional escalation
  urgencyFloor: "STANDARD" | "URGENT" | null;               // some needs always floor at URGENT triage regardless of phrasing
};
```

**Smallest V1 catalog: two entries**, both mapping to the one live professional category:

| id | serviceCategory | possibleProfessionalCategories | regulated | jurisdictionSensitive |
| --- | --- | --- | --- | --- |
| `BRANDING` | `MARKETING` | `["BUSINESS_MARKETING"]` | false | false |
| `WEBSITE` | `MARKETING` | `["BUSINESS_MARKETING"]` | false | false |

The candidate list in the milestone brief (`START_BUSINESS`, `TAX_HELP`, `BOOKKEEPING`, `BUSINESS_INSURANCE`, `NOTARY`, `IMMIGRATION_INFORMATION`, `IMMIGRATION_LEGAL_HELP`) is **not** instantiated now — the shape above is deliberately built to hold them (that's *why* `regulated`/`jurisdictionSensitive`/`urgencyFloor` exist even though every V1 row has them at their least-restrictive value), but adding the entries themselves is a content decision for whenever a matching professional category is actually being built, not before. A `Need` with `possibleProfessionalCategories: []` is a legitimate future state (a recognized need EVOLUSA can talk about but not yet route) — it must never be used to imply supply.

Free-form AI classification is never authoritative: EvolUSAia may only ever set `LeadIntent.needId` to one of the closed catalog ids above — never a model-generated string. An unmatched user question stays in guidance-only territory (no `PROFESSIONAL_ESCALATION` block, no intent record).

`LeadIntent` (from the Network doc) is refined by this: `category: ServiceCategory` is replaced with `needId: string`, and `category` becomes a **derived** lookup (`getNeed(needId).serviceCategory`) rather than a field collected or set independently.

## B. Intent contract

Unchanged from the prior design — restated here since this milestone asked for it explicitly: `EXPLORING | CONSIDERING | READY_TO_ACT`, advancing only on two explicit, deterministic signals (escalation tier reaching `VERIFIED_PROFESSIONAL`+, and an explicit "find a professional" click), never on message count, session length, or return frequency. See the Network doc's "Intent readiness" table for the full signal boundary — not repeated here.

One addition this milestone: **diagnostic completion and roadmap activity are contextual inputs to the *Need* detection, not to intent readiness.** A completed diagnostic tells EvolUSAia which needs are *plausible* for this user (feeds the context allowlist already designed); it does not, by itself, move anyone toward `READY_TO_ACT` — conflating "we know a lot about this user" with "this user wants to act now" is exactly the activity-vs-intent confusion this contract exists to prevent.

## C. Eligibility contract

Unchanged mechanism from the Network doc's `isEligible(lead, professional)`, with one addition this milestone requires: **a regulatory-policy gate sits above eligibility and can only narrow it further, never widen it.**

```ts
function isEligible(lead: LeadIntent, pro: ProfessionalProfile): { eligible: boolean; reasons: ReasonCode[] } {
  const reasons: ReasonCode[] = [];
  if (pro.category !== need(lead.needId).serviceCategoryDefaultProfessionalCategory) reasons.push("CATEGORY_MISMATCH");
  if (!pro.isApproved) reasons.push("NOT_APPROVED");
  if (!pro.isAcceptingClients) reasons.push("NOT_ACCEPTING_CLIENTS");
  if (pro.state !== lead.geo.state) reasons.push("OUTSIDE_JURISDICTION");
  if (!pro.languages.includes(lead.language)) reasons.push("LANGUAGE_MISMATCH");
  if (!isConsultationModeCompatible(pro.consultationMode, lead.consultationMode)) reasons.push("CONSULTATION_MODE_MISMATCH");
  const policy = getRegulatoryPolicy(need(lead.needId).serviceCategory, lead.geo.state);
  if (policy?.regulated && policy.verificationRequirement && !pro.hasVerification(policy.verificationRequirement)) reasons.push("VERIFICATION_REQUIRED");
  return { eligible: reasons.length === 0, reasons };
}
```

Reason codes are a **closed enum** (`CATEGORY_MISMATCH | NOT_APPROVED | NOT_ACCEPTING_CLIENTS | OUTSIDE_JURISDICTION | LANGUAGE_MISMATCH | CONSULTATION_MODE_MISMATCH | VERIFICATION_REQUIRED`), never free text — this is what makes "no professional available" honest and explainable rather than a generic failure. Eligibility and ranking stay strictly separate function calls; nothing about `isEligible`'s inputs or output can be influenced by payment, self-reported data, or score.

## D. Match contract

Unchanged formula from the Network doc (base + city match + `identity_verified` bonus + language overlap), computed only over the eligible set, no ML, no payment input. Restating the required separation explicitly, since this milestone named it as five distinct concepts:

| Concept | What it is | Who can influence it |
| --- | --- | --- |
| `eligibility.eligible` / `reasons` | Hard gate, boolean + reason codes | Professional's own real profile state, `getRegulatoryPolicy` — never payment |
| `organicScore` | Deterministic weighted sum over the eligible set | Professional's own real profile state — never payment, never self-reported performance claims |
| `verificationState` | `identity_verified` (and future types) | Operator only, via the existing Milestone 03 mechanism — never the professional, never payment |
| `professionalPerformance` | Response rate/time, completion rate (Outcome Engine, below) | Real observed outcomes only — not built until real data exists, never fabricated |
| `sponsorship` | A separate boolean + placement slot | Payment — and payment touches *only* this row |

User-facing explanation stays a named-reason list (`match_reasons`, unchanged) — e.g. *"Recomendado porque este profesional atiende tu zona, habla español, maneja este tipo de necesidad y está aceptando clientes."* Scoring weights themselves are not exposed publicly (the reasons are; the numeric weights aren't) — there's no compelling reason to publish the exact point values, and doing so would invite gaming for no user benefit.

## E. Geolocation strategy

Five distinct concepts, deliberately not collapsed into one "location":

| Concept | V1 source | Notes |
| --- | --- | --- |
| **User location** | `profiles.state` (exists), optional voluntary `city`/`postalCode` | Never precise GPS by default |
| **Service location** | `lead.geo` at the moment of the request (usually = user location, but not definitionally the same) | What matters for *this* need — e.g. a virtual consultation has no meaningful "service location" beyond jurisdiction |
| **Professional location** | `professional_profiles.state`/`city` (exists) | Where they're physically based |
| **Professional service area** | `professional_profiles.state`/`city` + `consultation_mode` (all exist) — see the Network doc's rejection of lat/lng+radius | Where they're *willing/able* to serve, not necessarily where they're based |
| **Legal jurisdiction** | `getRegulatoryPolicy(category, state)` | Governs *eligibility to serve*, independent of geographic distance — a virtual-only professional licensed in FL can serve a Miami-based user regardless of the professional's own city |

**"Closest professional wins" is explicitly rejected as a default.** Distance is not a scoring signal in V1 at all (only exact city match is, as a bonus) — jurisdiction eligibility and language/mode fit dominate, matching the brief's own Miami/Spanish/virtual/jurisdiction example precisely: a user's proximity to a professional says nothing about whether that professional is legally able to serve them.

## F. Event taxonomy

Most of the candidate 20 events are **not** separate log rows — they're already state transitions on an owned entity (`opportunities`, `appointments`, `appointment_outcomes` — see Lead/Opportunity Engine doc) and get double-booked as both a state machine and an event log if duplicated. `platform_events` exists only for **view/engagement telemetry with no other natural home**:

```ts
type PlatformEventName = "roadmap_item_viewed" | "professional_profile_viewed" | "match_viewed";

type PlatformEvent = {
  id: string;
  name: PlatformEventName;
  actorType: "MEMBER";                    // V1: member-originated only; professional/system events deferred
  actorId: string;                        // auth.uid() — never null in V1 (no anonymous event capture)
  occurredAt: string;
  metadata: PlatformEventMetadata;        // discriminated union keyed by `name`, below — never an open bag
};

type PlatformEventMetadata =
  | { name: "roadmap_item_viewed"; catalogItemId: string }
  | { name: "professional_profile_viewed"; professionalSlug: string }
  | { name: "match_viewed"; opportunityId: string };
```

Everything else in the candidate list (`opportunity_created`, `opportunity_routed`, `professional_accepted`, `member_contacted`, `appointment_scheduled`, `appointment_completed`, `service_engaged`, etc.) is read from the state + timestamp fields of the entity it already belongs to — never re-logged. **Metadata privacy rule**: the type system itself forbids a fifth event name or an extra field — there is no code path that lets free text, message content, or an arbitrary key end up in `metadata`.

## G. Outcome engine

Three tiers, never averaged together into one "conversion rate":

| Tier | Examples | What it actually proves |
| --- | --- | --- |
| **Behavior signals** | `match_viewed`, `match_selected`, `professional_profile_viewed` | Engagement — cheap, high-volume, not proof of value |
| **Commercial outcomes** | `professional_accepted`, `member_contacted`, `appointment_scheduled`/`appointment_completed` | The connection mechanism worked |
| **User-success outcomes** | `service_engaged`, `roadmap_step_completed`, (future) `need_resolved` | EVOLUSA's actual mission succeeded, not just that a transaction happened |

Funnel stages are reported distinctly (`match → contact`, `contact → appointment`, `appointment → engagement`, `engagement → completion`), each its own rate — collapsing them into a single number would hide exactly where the loop breaks. Future quality scoring (Lead/Opportunity Engine doc) should weight **user-success**-tier outcomes above commercial-tier ones — a professional with a healthy commercial funnel but no `roadmap_step_completed` follow-through isn't actually delivering the outcome EVOLUSA exists to produce. No predictive ML — this section only defines trustworthy inputs a future model would need, not a model.

## H. Supply/demand intelligence

Unchanged conceptually from the prior addendum, now grouped by the finer-grained `needId` in addition to category/geo — "Broward County wants `IMMIGRATION_INFORMATION`" and "...wants `IMMIGRATION_LEGAL_HELP`" are genuinely different recruiting signals even though both roll up to the same `ServiceCategory`. The one structural requirement (unchanged): `matchedProfessionalCount` must be recorded on every opportunity at match time, including `0` — everything else is read-only reporting over that field whenever it's actually built. No demand is fabricated; nothing here is implemented.

## I. EvolUSAia boundary (restated, unchanged in substance)

Full design lives in [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md). The pipeline this milestone adds context to: **AI answer → source/confidence check → regulated-topic detection (via `Need.regulated` + `getRegulatoryPolicy`) → safe informational response → escalation when the deterministic rule requires it.** The one rule worth restating precisely because this milestone is explicitly about routing money-adjacent decisions: **AI confidence never determines whether professional escalation is safe — regulatory policy and the deterministic risk/escalation ruleset both take precedence over any model-reported confidence score, unconditionally.**
