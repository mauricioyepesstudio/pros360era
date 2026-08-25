# EVOLUSA — Professional Network

Architecture only. Covers EVOLUSA Network, Verified, Match, Appointments, and Reviews. No table in this document has been created; see [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md) for the full proposed schema this design implies.

## EVOLUSA Verified

### Verification types

`IDENTITY_VERIFIED · BUSINESS_VERIFIED · LICENSE_VERIFIED · BAR_VERIFIED · DOJ_ACCREDITED · INSURANCE_LICENSE_VERIFIED · CPA_VERIFIED · EA_VERIFIED · BACKGROUND_VERIFIED · EVOLUSA_PROFESSIONAL` (a composite badge meaning "meets EVOLUSA's own baseline," independent of any single credential type).

Modeled as a code catalog (`data/professional/verification-types.ts`) describing what evidence each type requires and which issuer/authority is expected — the same "rules in code, state in database" split used everywhere else in this codebase.

### Verification record

One row per `(professional_id, verification_type)` in a `verifications` table:

`verification_type` · `issuer`/`source` · `credential_identifier` (bar number, license number — treated as sensitive, never in a public view) · `jurisdiction` · `status` (`PENDING | VERIFIED | REJECTED | EXPIRED`) · `verified_at` · `expires_at` · `last_checked_at` · `evidence_metadata` (jsonb — references to submitted documents, not the documents themselves) · `review_status`/`reviewed_by` (internal, admin-only).

**Never expose sensitive credential data publicly.** A professional's public profile shows only the verification **badges** (type + status + a human-readable "verified through [date]"), never the raw `credential_identifier` or `evidence_metadata`. This needs a dedicated public-safe view (`professional_verifications_public`), not a public RLS policy on the base table — see the RLS design in [EVOLUSA-TRUST-COMPLIANCE.md](./EVOLUSA-TRUST-COMPLIANCE.md).

### V1 status: LIVE — deliberately minimal subset of the design above

`supabase/migrations/0006_evolusa_verified_v1.sql` is **applied** to the EVOLUSA Supabase project. It implements exactly one narrow slice of the full design above, on purpose (YAGNI) — everything else in this section remains design-only until a regulated category and a real evidence pipeline exist:

- **Only `IDENTITY_VERIFIED`** of the ten types listed above. No `BUSINESS_VERIFIED`/`LICENSE_VERIFIED`/`BAR_VERIFIED`/etc. yet, and no `EVOLUSA_PROFESSIONAL` composite badge.
- **No `credential_identifier`, `issuer`, `jurisdiction`, `evidence_metadata`, or `expires_at`.** The live `professional_verifications` table is narrower than the record shape sketched above: `id`, `professional_profile_id`, `verification_type` (`IDENTITY_VERIFIED` only), `status` (`PENDING | VERIFIED | REJECTED | REVOKED` — no `EXPIRED`), `verified_at`, `internal_notes` (operator audit trail, not evidence storage), `reviewed_by`, `created_at`, `updated_at`.
- **No separate `professional_verifications_public` view.** Instead, `professional_profiles_public` gained one trailing derived column, `identity_verified boolean`, computed via `EXISTS (... status = 'VERIFIED')` against the base table — never a stored/copied badge. This is a simpler mechanism than the dedicated public view sketched above; revisit that design once a second verification type exists and a single boolean stops being sufficient (e.g., once badges need type + status + date shown separately).
- **The professional has zero access to their own verification row** — stricter than a typical owner-scoped RLS policy: no SELECT, no self-view, nothing. They learn their status the same way the public does, through the derived boolean.
- A `verified_status_requires_verified_at` CHECK constraint enforces that `VERIFIED` always carries a timestamp, at the database level, not just by operator discipline.

See `docs/CURRENT-STATE.md`'s Milestone 03 section for the live authorization-test results and advisor findings. The Verified badge UI (placement, label, disclosure copy) was discussed at design level but is not yet implemented in `ProfessionalProfileView`.

## EVOLUSA Match

### Inputs

| User side | Professional side |
| --- | --- |
| stage | verified status |
| need/category | category |
| state/jurisdiction | jurisdiction |
| language | service areas |
| availability | language |
| virtual/in-person preference | availability |
| budget range | consultation mode |
| urgency | price metadata |
| — | capacity |
| — | review quality |
| — | response reliability |

### Explainability requirement

No opaque ranking. Every match ships a checklist of the specific criteria it satisfied, not just a score:

```
97% MATCH

Why:
✓ Florida
✓ Spanish
✓ Verified
✓ Available tomorrow
✓ Works with new entrepreneurs
```

Implementation shape: `match_score` is a **sum of named, weighted boolean/graded criteria** stored alongside the score (`match_reasons: { criterion: string; met: boolean; weight: number }[]` in a `matches.match_reasons jsonb` column) — the percentage is a rendering of that list, never a separately-computed number the list doesn't explain. If a future ML-ranked model is introduced, this checklist becomes the model's required explanation output, not an optional add-on — an unexplainable match is a shipping blocker, not a v2 nice-to-have.

A `matches` row is visible to **both** the member and the matched professional (a genuinely new two-party RLS pattern — see Trust/Compliance doc — every other table in this codebase today is single-owner).

### Demand engine — Milestone 04 addendum (architecture only, not implemented)

EvolUSAia (see [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md)) is the top of this loop: `PROFESSIONAL_ESCALATION` blocks are the only thing that ever produces a lead. Nothing here is collected through a separate lead-capture form.

**Lead intent contract.** The candidate field list was reduced by reusing existing types rather than inventing parallel ones — five of the seven fields below already exist elsewhere in the codebase:

```ts
type IntentReadiness = "EXPLORING" | "CONSIDERING" | "READY_TO_ACT";

type LeadIntent = {
  category: ServiceCategory;                    // reuses data/compliance/claims.ts — replaces need_type + professional_category, which were the same value twice
  stage: StageId;                                // reuses data/journey/types.ts
  geo: GeoContext;                               // below — replaces separate location + jurisdiction fields
  language: UserProfile["preferredLanguage"];    // reuses data/account/types.ts
  urgency: "STANDARD" | "URGENT";                // derived from EvolUSAia's escalationTier, never separately asked
  consultationMode: ConsultationMode;            // reuses data/professional/types.ts
  readiness: IntentReadiness;
};
```

`jurisdiction` isn't a separate field — for V1 (one state, Florida) it's an alias for `geo.state`; it only earns independence once EVOLUSA operates in more than one state. `urgency` is deliberately derived, not collected, because asking "how urgent is this?" invites the same individualized-judgment trap the escalation engine already exists to avoid — `URGENT_HUMAN_REVIEW` tier maps to `URGENT`, everything else to `STANDARD`.

**Intent readiness — three values, advanced only by explicit signals, never by activity volume:**

| State | Advances from... | Never advances from |
| --- | --- | --- |
| `EXPLORING` | Default — any guidance question with no escalation signal | — |
| `CONSIDERING` | EvolUSAia's escalation tier reaches `VERIFIED_PROFESSIONAL`/`URGENT_HUMAN_REVIEW` | Message count, session length, number of questions asked |
| `READY_TO_ACT` | The user explicitly clicks "Encontrar un profesional" | Time spent reading, repeat visits |

Engagement is not intent. A user who asks five educational questions is still `EXPLORING`; a user who asks one and clicks connect is `READY_TO_ACT`.

**Geo context — member side, approximate by default:**

```ts
type GeoContext = { country: "US"; state: string | null; city: string | null; postalCode?: string };
```

`state` already exists (`profiles.state`) — no new required field. `city`/`postalCode` are voluntary, narrow matching only when present, never required. **No precise device geolocation by default** — nothing in V1's designed feature set (state/city-level professional matching) justifies asking for it; if a future feature genuinely needs precise location ("notary near me right now"), that's a separate, explicitly opt-in permission request at the point of that feature, not a platform-wide default.

**Professional service area — reuses existing columns, no new schema:**

```ts
type ProfessionalServiceArea = { state: string; city: string | null; virtualAvailable: boolean; inPersonAvailable: boolean };
```

Challenged and rejected: `lat`/`lng` + service radius. `professional_profiles.state`/`city`/`consultation_mode` (all live since Milestone 01) already fully express this for a marketplace with one professional per category per state today. Geospatial radius matching is real complexity that solves a problem this marketplace doesn't have yet — revisit only once a category/state pair has enough professionals that single-city exact-match is measurably too narrow.

**Eligibility before ranking — a pure boolean filter, evaluated before any scoring, no exceptions:**

```ts
function isEligible(lead: LeadIntent, pro: ProfessionalProfile): boolean {
  return pro.isApproved
    && pro.isAcceptingClients
    && pro.category === lead.category
    && pro.state === lead.geo.state
    && pro.languages.includes(lead.language)
    && isConsultationModeCompatible(pro.consultationMode, lead.consultationMode);
}
```

Sponsorship, payment, or score can never appear as an input to this function — an ineligible professional cannot become eligible by paying, and nothing downstream (matching, sponsored placement) ever sees a professional this function excludes.

**Match V1 — deterministic, explainable, computed only over the eligible set:**

```
score = 1 (base, eligibility already guarantees category/jurisdiction/language/mode fit)
      + 2  if pro.city === lead.geo.city
      + 1  if pro.identityVerified
      + 0.5 × (shared languages beyond the one required)
```

Every term maps directly to a named, user-facing reason (`match_reasons`, above) — `✓ Florida`, `✓ Miami`, `✓ Identidad verificada`, `✓ Español e inglés`. No ML in V1. `identity_verified` is a scoring **bonus**, never a gate — an approved-but-unverified professional stays eligible and matchable, consistent with Milestone 03's principle that approval and verification are independently meaningful, never collapsed. Response performance and capacity-based scoring are deferred — no response-time data exists yet with one live professional.

**Paid placement firewall — structural, not policy:**

```ts
type MatchResult = { professionalId: string; organicScore: number; organicReasons: MatchReason[]; sponsored: boolean };
```

`computeOrganicScore(lead, professional)` takes no billing/payment parameter — there is no argument through which sponsorship could enter the score even by accident. A sponsored professional must already be in the `isEligible` set and is rendered in a separate, clearly labeled slot ("Patrocinado") — never interleaved to look organic, never displacing a higher-organic-score result.

**Qualified Opportunity — deliberately thin, no personal data by default:**

```ts
type QualifiedOpportunity = {
  id: string;
  memberId: string;              // FK auth.users — never exposed to a professional before CONSENTED
  category: ServiceCategory;
  stage: StageId;
  geo: { state: string; city: string | null };
  readiness: IntentReadiness;
  consentState: ConsentState;
  routingState: RoutingState;
  matchedProfessionalCount: number;   // see "Geo/category expansion" below — the one field this needs to exist for later
  createdAt: string;
};
```

**Consent — the professional gets nothing by default:**

```ts
type ConsentState = "NOT_SHARED" | "CONSENTED" | "ROUTED" | "CONTACTED";
```

`NOT_SHARED` is the default and stays true even after a match is computed — matching and consent are separate steps. `CONSENTED` requires an explicit, unchecked-by-default user action ("Sí, compartir mi resumen"). State only moves forward.

**Lead summary — the only thing a professional ever sees pre-appointment:**

```ts
type LeadSummary = { category: ServiceCategory; stage: StageId; geo: { state: string; city: string | null }; readiness: IntentReadiness; userNote?: string };
```

Never the full AI conversation, never a sensitive identifier (none are collected per the sensitive-information policy in the EvolUSAia doc), never documents, never roadmap categories outside the matched one. `userNote` is the only freeform field, user-authored and user-edited at the consent step — never auto-populated from raw conversation text, same pattern as the roadmap-proposal and professional-handoff contracts in the EvolUSAia doc.

**Routing — V1 ships DIRECT only:**

```ts
type RoutingMode = "DIRECT" | "SHARED_MAX_3";
```

`SHARED_MAX_3` is a data-model-compatible future value, not built now — MVP has at most one eligible professional per category/state pair, so "sharing among up to 3" has no population to exercise yet. Never broadcast to every match regardless of mode.

**Professional capacity — reuses the existing boolean, nothing new:**

`professional_profiles.is_accepting_clients` (live since Milestone 01) is the entire V1 capacity signal — it's already an eligibility gate (above). Daily/weekly lead caps need real volume to justify and are explicitly deferred; no queue infrastructure is built ahead of that need.

**Lead lifecycle — 8 states, reduced from the 11-state candidate:**

```
CREATED → MATCHED → CONSENTED → ROUTED → CONTACTED → COMPLETED
                                                      ↘ EXPIRED (routed, no contact within N days)
                                        ↘ DECLINED (member or professional explicitly opts out, from any non-terminal state)
```

`ACCEPTED`/`APPOINTMENT_SET` were folded into `CONTACTED` (a detail of that state, not a separate stage — V1 doesn't need appointment-level granularity to measure conversion). `WON`/`WON`/`LOST` were replaced with `COMPLETED`/`DECLINED` — sales-pipeline language doesn't fit a product whose explicit principle (below) is that the member must never feel sold as a lead. Enough states to measure stage-to-stage conversion; not a CRM.

**Outcome model — connection value, never case outcome:**

```ts
type OpportunityOutcome = { professionalAccepted: boolean | null; memberContacted: boolean | null; appointmentOccurred: boolean | null; roadmapStepCompleted: boolean | null };
```

All nullable booleans. `appointmentOccurred` reuses the already-designed `appointment_outcomes` table rather than inventing a parallel one; `roadmapStepCompleted` reuses `progress_events`. Never a professional's notes about how the client's case/matter actually went — that's their business, not EVOLUSA's data to hold.

**Marketplace quality — deferred to real volume, cold-start-fair by design:**

Response rate, response time, appointment conversion, completion rate, and member verified-feedback (only from a `COMPLETED` appointment, same eligibility rule Reviews already uses) are the eventual signal set — not ratings alone. A professional with zero completed opportunities scores **neutral**, not zero, on every quality dimension, and stays matchable on eligibility + verification + geo/language fit alone until real signal accumulates — a new professional is never structurally locked out by lack of history. None of this is computed in V1 (only one professional exists); the rule is stated now so it's not designed reactively once it matters.

**Marketplace flywheel and where it breaks:**

`demand → qualified opportunities → supply growth → better coverage → better matches → higher completion → reputation → more demand.` Break points and the safeguard already designed against each: demand with no matching supply → an honest "no professional available" state, never fabricated supply (Milestone 04's `NO PROFESSIONAL CURRENTLY AVAILABLE` UX state). Supply exists but mismatched (wrong category/geo) → eligibility is mechanical, not fuzzy, so this is structurally rare. Professionals ghost routed leads → response-rate quality metric, future capacity throttling for chronic non-response. Members withhold consent because it feels like being sold → the "never make the user feel sold" experience principle below. Paid placement erodes trust in organic results → the firewall above, structural not policy. Verification gets diluted or implicitly purchasable → Milestone 03's approval/verification separation, unchanged, never for sale. Quality metrics permanently penalize new professionals → cold-start-neutral scoring, above.

**Member and professional experience.** The member never sees a "you are a lead" framing — the experience is "EVOLUSA encontró personas que pueden ayudarte con tu próximo paso," with why-matched, what's-verified (`identity_verified` only, nothing implied beyond it), where-they-serve, language, and consultation mode all visible before any consent decision. The professional's value proposition is qualified-opportunity quality, not volume — they receive `LeadSummary` + contact details only after `CONSENTED`, gated by their own capacity signal, never an unfiltered firehose.

**Monetization — never one model for every category:**

| Category group | Safe monetization | Needs legal review before ever proposing |
| --- | --- | --- |
| `SERVICE_BUSINESS` (Marketing, Bookkeeping, Notary, etc.) | Flat subscription, appointment fee, sponsored placement, CRM/software tooling | — |
| `REGULATED` (Legal, Immigration, Tax/CPA, Insurance) | Flat subscription, CRM/software tooling | Any per-lead or per-appointment fee (fee-splitting/referral-fee risk, same unresolved risk already flagged in MVP-V2) |

**TRUST IS NEVER FOR SALE** — no payment of any kind (subscription, lead fee, appointment fee, sponsorship) may ever increase `organicScore`, change `isEligible` output, or influence `identity_verified` or any future verification type. Sponsorship buys a labeled, separate visibility slot inside the already-eligible set. Nothing else is purchasable.

**Geo/category expansion (recruiting intelligence) — one field now, no reporting built yet.** The only structural requirement to make "where do we have unmet demand?" answerable later without losing history: `QualifiedOpportunity.matchedProfessionalCount` (above) must be recorded at match time, every time — including as `0`. Everything else (grouping by category/state, trend queries) is read-only reporting over that field whenever it's actually built; no analytics infrastructure is designed or implied now.

**MVP recommendation.** The smallest real proof of this loop: `LeadIntent` derived from an existing `PROFESSIONAL_ESCALATION` block (no separate capture UI) → member `geo.state` (already exists) → existing professional category catalog → `isEligible` filtering → one explainable match, `DIRECT` routing only → explicit consent click → a `QualifiedOpportunity` row → manual professional follow-up (an operator informs the matched professional directly, the same manual-runbook pattern already used for provisioning and verification — no automated notification system). No ML, no auction, no bidding, no `SHARED_MAX_3`, no capacity counters beyond the existing boolean, no quality scoring (moot with one professional). This sits **after**, not instead of, the appointments vertical slice MVP-V2 already recommends next — it depends on `appointments`/`appointment_outcomes` existing to record `appointmentOccurred`.

## EVOLUSA Appointments

### Scope

availability · booking · reschedule · cancel · time zones · consultation type (in-person/phone/video) · intake notes · confirmation · reminders · completion status · follow-up action · Roadmap update.

### Explicitly not V1

**No proprietary video system.** `appointments.external_meeting_provider` (`GOOGLE_MEET | ZOOM | OTHER`) plus `external_meeting_url` is the entire video surface for V1 — EVOLUSA schedules and confirms, an external provider hosts the call. This keeps EVOLUSA out of the video-infrastructure business entirely for the MVP and avoids a whole class of media-reliability and compliance (recording/consent) problems prematurely.

### Lifecycle

`REQUESTED → CONFIRMED → (RESCHEDULED)* → COMPLETED | CANCELLED | NO_SHOW`

`appointment_outcomes` is a **separate** table (one row per completed appointment, not a status field) because an outcome carries its own facts independent of the appointment record itself: `outcome_summary`, `follow_up_action`, and — critically — the link back into the Roadmap (`roadmap_item_id` or a newly created dynamic roadmap item), which is what closes the loop `APPOINTMENT → RESULT → ROADMAP UPDATE` from the North Star loop. Every completed appointment should either reference an existing roadmap item it resolved or create a follow-up one; an appointment with no Roadmap trace is a broken loop, worth flagging in QA once this is built.

`appointment_participants` exists as a separate table (not just `member_id`/`professional_id` columns on `appointments`) to allow a future multi-party appointment (e.g., a family member joining) without a schema change — deliberately over-normalized here because this is the one place a V1 shortcut (two fixed columns) would be expensive to unwind later once real appointment history exists.

## Reviews

**Only verified interactions are eligible.** A review must reference a specific `appointment_id` whose `status = 'COMPLETED'` — enforced at the schema level with a foreign key plus a check that the reviewer (`member_id`) matches the appointment's own member. This structurally rules out both paid positive reviews and anonymous/unverified reviews — there is no code path to submit a review without a real completed appointment behind it.

Fields: `appointment_id` (unique — one review per appointment) · `rating` (overall) · `communication` · `clarity` · `punctuality` · `language` · `overall_experience` · `text_review` · `moderation_state` (`PENDING | APPROVED | REJECTED`).

Public visibility is gated on `moderation_state = 'APPROVED'`, same public-view pattern as Verified badges — never a raw public SELECT on the table (a rejected/pending review must never be visible even briefly).

## Professional business model (design only)

| Tier | Includes |
| --- | --- |
| **Free** | Profile, verification, listing in Match, basic availability, appointment booking |
| **Pro** | Priority placement in Match, intake summaries, lightweight CRM view of appointment/review history, analytics |
| **Practice/Business** | Multi-professional org account, shared availability/calendar, team analytics, priority verification review |

No commission-of-fee model for any regulated category — see the business-model note in [EVOLUSA-PLATFORM-BLUEPRINT.md](./EVOLUSA-PLATFORM-BLUEPRINT.md). Billing is not implemented in this phase; this table exists to keep future billing work from inventing a model ad hoc.
