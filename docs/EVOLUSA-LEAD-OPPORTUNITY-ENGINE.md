# EVOLUSA — Lead / Opportunity Engine

Architecture only — no migration applied, nothing implemented. This is Milestone 04's trust/operations layer: how an eligible match becomes a consented, auditable connection, and how the marketplace stays honest as it grows. Builds on [EVOLUSA-INTELLIGENCE-MATCH.md](./EVOLUSA-INTELLIGENCE-MATCH.md) (Need/Intent/Eligibility/Match) and the routing/lifecycle/consent shapes already sketched in [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#demand-engine--milestone-04-addendum-architecture-only-not-implemented) — refines rather than replaces the earlier `QualifiedOpportunity`/`ConsentState`/lifecycle design.

## Milestone 04A — final decisions (proposed migration, not applied)

`supabase/migrations/0007_evolusa_opportunity_engine_v1.sql` (proposed, **not applied**) implements the minimum table set from this doc's "Minimum proposed data model" exactly: `opportunities` and `consent_receipts` only — `platform_events` stayed deferred, as recommended. Decisions locked in while writing the actual SQL, refining what was architecture-only before:

- **`MATCHED` dropped from the lifecycle** — the candidate list in the 04A instruction already reduced to 7 states (no `MATCHED`), and implementing confirmed why: an `opportunities` row is never inserted without a match already attached, so `CREATED` already implies it. `CONSENTED` stays in the `status` CHECK constraint for schema completeness but is never actually produced by this V1's code — `consent_and_route_opportunity` transitions `CREATED → ROUTED` in one atomic step, with the `consent_receipts` row itself standing as the durable proof consent happened.
- **`professional_category` added as its own `opportunities` column** — not in the original candidate field list, but necessary once the security design was worked out: `consent_and_route_opportunity` must re-validate eligibility in SQL without duplicating the `Need → professionalCategory` code catalog there, so the category is resolved once in TypeScript at creation time and stored, not re-derived.
- **Superseded by a later hardening pass**: `opportunities` INSERT was originally designed as a plain, RLS-scoped write `authenticated` could perform directly, reasoning that an unconsented row was inert. That held for routing safety but not for data integrity — a client bypassing the app entirely could still pollute the table with a fabricated match/score. `create_qualified_opportunity` (`SECURITY DEFINER`) is now the *only* way to create an `opportunities` row; `authenticated` has zero INSERT grant on the table at all. Both writes — creation and consent-and-route — now get the same elevated-rigor treatment.
- **The consent RPC takes no `professionalProfileId` parameter** — it reads `matched_professional_profile_id` from the stored opportunity row itself, closing the "request tampering could redirect consent to a different professional" gap explicitly named in the privacy red-team below.
- **`professional_opportunities_public` (a view) was replaced by `get_my_routed_opportunities()` (a parameterless `SECURITY DEFINER` function)** in the same hardening pass — a closed call signature has no PostgREST query-composition surface at all, strictly narrower than even a well-gated view. It still gates every personal-data column per-category, not just per-row — a field the member didn't consent to renders `null`, including `need_id`/`city`/`state`, not just contact fields. `contact_phone` was removed entirely (not just null'd): no phone column exists anywhere in this schema. Its `auth.users.email` read is an explicit, owner-approved, narrowly-scoped exception to this project's standing rule against reading `auth.users` — see [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md#explicit-exception-get_my_routed_opportunities-reads-authusersemail) for the full 16-control exception and its required regression coverage.

## Milestone 04B — lifecycle past ROUTED (live)

`supabase/migrations/0008_evolusa_opportunity_lifecycle_v1.sql` is **applied** — `ROUTED → CONTACTED → COMPLETED`, with `DECLINED` as an alternate terminal outcome and an explicit, never-persisted `expires_at` boundary replacing the earlier lazy-write-from-a-read expiration idea this doc's own "Opportunity contract" section originally sketched (an owner correction: a read must stay a read). Full design, transition-authority table, decline-reason model, member/professional UX, and live-test results are in the dedicated [EVOLUSA-OPPORTUNITY-LIFECYCLE.md](./EVOLUSA-OPPORTUNITY-LIFECYCLE.md) — not duplicated here. The `MATCHED`-state reasoning and the `EXPIRED`-status reasoning immediately above both still hold; 04B only adds real writers for the states 04A had already reserved space for.

## E. Opportunity contract

An Opportunity is not a lead in the generic-marketplace sense — it's the record of *consented, explainable* intent to connect, not raw interest capture.

**Lifecycle — reduced from the candidate 11 states to 8, unchanged from the prior addendum, restated with ownership/access columns added:**

```
CREATED → MATCHED → CONSENTED → ROUTED → CONTACTED → COMPLETED
                                                      ↘ EXPIRED (routed, no contact within N days)
                                        ↘ DECLINED (member or professional opts out, from any non-terminal state)
```

`ACCEPTED`/`APPOINTMENT_SCHEDULED`/`APPOINTMENT_COMPLETED`/`ENGAGED` from the candidate list fold into `CONTACTED`→`COMPLETED` (detail fields, not separate top-level states — see the Outcome model in the Intelligence doc, which already captures `appointmentOccurred`/`roadmapStepCompleted` at finer grain than the lifecycle needs to). This is enough to measure stage-to-stage conversion without building CRM-grade pipeline management.

```ts
type Opportunity = {
  id: string;
  memberId: string;                          // owner — RLS: member reads/writes only their own
  needId: string;                             // resolves to serviceCategory via getNeed()
  stage: StageId;
  geo: { state: string; city: string | null };
  readiness: IntentReadiness;
  matchedProfessionalId: string | null;        // V1: at most one, DIRECT routing only — see Routing below
  organicScore: number | null;
  matchReasons: readonly MatchReason[];
  sponsored: boolean;
  consentState: ConsentState;
  lifecycleState: OpportunityLifecycleState;
  matchedProfessionalCount: number;             // recorded even when 0 — see Supply/demand intelligence
  createdAt: string;
  routedAt: string | null;
  expiresAt: string | null;                     // set only once ROUTED
};
```

**Ownership**: the member who generated it. **Access boundary**: the matched professional gains read access to a *derived* `LeadSummary` projection (below) — never this row directly, and never before `consentState = CONSENTED`. **Expiration**: only meaningful once `ROUTED` (an un-routed opportunity doesn't need to expire — it just sits at `MATCHED`/`CONSENTED` until the user acts or abandons it); `EXPIRED` is a routing-side safeguard against a professional silently sitting on a lead forever, not a punishment for the member. **Auditability**: every state transition is a timestamped column change on this one row (`routedAt`, etc.) plus a `ConsentReceipt` for the consent step specifically (below) — no separate audit table duplicating what's already timestamped here.

## Consent receipt

A stronger, explicit artifact than the `ConsentState` enum alone — the enum says *where* an opportunity is in the flow; the receipt is the *proof* of what was actually agreed to, frozen at the moment of agreement:

```ts
type ConsentReceipt = {
  id: string;
  memberId: string;
  opportunityId: string;
  scope: "SINGLE_PROFESSIONAL";               // V1: routing is DIRECT-only, so scope has exactly one value — see Routing below
  professionalId: string;                      // the specific professional consented to, never a category-wide consent
  dataCategoriesShared: readonly ("NEED" | "STAGE" | "GEO_STATE" | "GEO_CITY" | "READINESS" | "USER_NOTE")[];
  purpose: string;                              // fixed, versioned copy string — not freeform
  createdAt: string;
  policyVersion: string;                        // so a later consent-copy change never retroactively reinterprets an old receipt
};
```

**Append-only, same pattern as `progress_events`** — never updated or deleted by the user; a withdrawal of consent is a new state on the `Opportunity` (`DECLINED`), not a mutation of the historical receipt.

**When consent happens** — after selection, before routing, scoped to the specific professional: the user sees the (one, in V1) actual match — its reasons, its verification state, its geo/language/mode fit — and *then* consents to share `LeadSummary` with *that* professional specifically. A blanket "consent to be matched" gate before any match exists would ask for permission before the user has anything concrete to evaluate, which is both less genuinely informed and, for V1's near-always-one-candidate reality, no safer than consenting to the specific result. This directly resolves the brief's open question: **consent is per-professional and post-match, not pre-match and category-wide.**

## Routing

`DIRECT | SHARED_MAX_3` as designed previously — **V1 ships `DIRECT` only.** With typically one eligible professional per need/state pair, `SHARED_MAX_3` has no population to exercise; it stays a compatible future enum value on both `Opportunity.routingState` and `ConsentReceipt.scope`, not built now. Never broadcast beyond the routing mode's own declared fan-out.

## Professional capacity (unchanged)

`professional_profiles.is_accepting_clients` (existing) is the entire V1 capacity signal, already an eligibility gate. No queue infrastructure, no daily/weekly counters, until real volume justifies them.

## Trust & anti-abuse

Threat-modeled, not solved beyond what's needed before any launch. Each risk: prevent → detect → enforce/audit.

| Risk | Prevent | Detect | Enforce/Audit |
| --- | --- | --- | --- |
| Fake professionals | Manual operator-only provisioning, no self-service signup (Milestone 01, unchanged) | Structurally excluded already | N/A |
| Fake credentials | No document/evidence upload exists in V1 — nothing to fake | Manual out-of-band review is the only verification path (Milestone 03) | Revocation via existing `REVOKED` status |
| Fake/bot-generated leads | Opportunities only ever created from an authenticated member's real escalation flow — no anonymous or API-only creation path | Rate-limit opportunity creation per user (future hardening, not V1) | Operator marks an opportunity `DECLINED` |
| Lead scraping | No endpoint exposes `Opportunity`/`LeadSummary` data outside owner/matched-professional RLS | Standard access-log review | Same remediation as any RLS violation — revoke, audit |
| Spam | Rate limits on opportunity creation (future) | Manual volume-anomaly review at V1 scale | Operator suspends the account (existing role mechanism, no new infra) |
| Professional claims a category they can't legally serve | `professional_profiles.category` stays operator-assigned only (Milestone 01 trigger, unchanged) — no self-service category change | Operator review at provisioning time | Operator correction, same as today |
| Abusive user content | Only one free-text field reaches a professional (`userNote`, operator-reviewable before routing) | Manual review at V1's low volume | Operator declines routing |
| Multiple accounts | **Not solved in V1** — flagged as a real, unresolved risk, not addressed here | N/A | N/A |
| Ranking manipulation | `computeOrganicScore` signature excludes payment/self-reported fields entirely (Intelligence doc) | Score is a pure function of real profile/verification state — recomputable and comparable | Recompute and diff, same as any deterministic function |
| Review manipulation | Reviews require a real `COMPLETED` appointment tied to the specific member (Network doc, unchanged) | Pattern detection (future — no reviews exist yet) | Existing `PENDING/APPROVED/REJECTED` moderation state |
| Capacity abuse (claims availability without serving) | `is_accepting_clients` toggle, operator-overridable | Future response-rate quality metric | Operator override |
| Selling/re-sharing lead data | `LeadSummary` is delivered in-platform only — no export/download feature exists or is designed | No export path exists to detect abuse of | Terms-of-service enforcement (non-technical) |
| Unauthorized solicitation (contact before consent) | Contact details withheld until `consentState = CONSENTED` — structural, not UI convention | Member complaint channel (manual, V1 scale) | Operator revokes the professional's routing eligibility |

**Cut line — must exist before any launch, even the manual MVP slice:** operator-only provisioning (exists), consent-gated contact-detail sharing (designed), category self-change blocked (exists), organic-score payment exclusion (designed). **Everything else in the table is later hardening** once real volume exists — rate limiting, dedup, response-rate-based throttling, and export-abuse detection are explicitly not built for the MVP slice.

## Minimum proposed data model

Every candidate concept evaluated against "why does this need to exist now?" — YAGNI applied aggressively, per instruction.

| Candidate | Decision | Why |
| --- | --- | --- |
| `needs` | **Code catalog**, not a table (`data/needs/catalog.ts`) | Small, curated, changes rarely, no per-row user state — same rule already applied to categories/verification-types |
| `professional_service_areas` | **Not needed** | Fully expressed by existing `professional_profiles.state`/`city`/`consultation_mode` |
| `professional_capabilities` | **Not needed for V1** | One professional, one category exists today — a real multi-capability model has no population to prove it against yet |
| `opportunities` | **New table** | Real per-user, per-need state; must be RLS-scoped and queryable — a code catalog can't hold this |
| `opportunity_matches` | **Not a separate table for V1** | `DIRECT`-only routing means at most one matched professional per opportunity — match result lives as columns on `opportunities` itself (`matchedProfessionalId`, `organicScore`, `matchReasons`). Only becomes its own table alongside `SHARED_MAX_3`, deferred with routing mode itself |
| `consent_receipts` | **New table** | Immutable audit record, append-only — same pattern as the existing `progress_events`, can't be a code catalog since it's per-event user data |
| `platform_events` | **New table, deliberately small** | Only 3 event names for V1 (`roadmap_item_viewed`, `professional_profile_viewed`, `match_viewed`) — see the Intelligence doc's event-taxonomy analysis for why the other ~17 candidate events are *not* separate rows |
| `regulatory_policies` | **Code catalog** (`data/compliance/regulatory-policy.ts`), not a table | Same reasoning as the existing `serviceCompliance` — a handful of human-reviewed rules, must never be admin-UI-editable at this stage |

**Minimum new tables for V1, when implementation is approved: `opportunities` and `consent_receipts`.** `platform_events` is optional/deferred — even its 3-event V1 scope may not be worth the schema before real user traffic exists to analyze; lean toward deferring it entirely until then.

## Privacy & security red-team

Twelve adversarial questions, each answered NO by architecture, not by UI convention:

1. **Can professional A discover professional B's opportunities?** No — RLS scopes `opportunities` reads for a professional to rows where `matchedProfessionalId` equals their own `professional_profiles.id`; no category-wide read exists.
2. **Can a professional enumerate users?** No — professionals never get `SELECT` on `profiles`/`auth.users`; they only ever see the `LeadSummary` projection (Intelligence doc) of their own matched, consented opportunities — no `memberId`, no raw user row.
3. **Can anonymous users access opportunities?** No — zero `anon` grant, owner-only RLS, identical posture to every sensitive table since Milestone 01.
4. **Can a user access another user's opportunities?** No — owner-only RLS (`memberId = auth.uid()`), the same single-owner pattern already live-verified 21+16 times in Milestones 01 and 03.
5. **Can a professional alter match scores?** No — `organicScore` is written only by a server-side/operator-equivalent process, never client-writable, same grant-layer defense already proven for `is_approved`/`category`/`professional_verifications`.
6. **Can a professional self-verify?** No — unchanged from Milestone 03: zero access to `professional_verifications`, not even read.
7. **Can payment modify organic ranking?** No — `computeOrganicScore`'s signature has no payment parameter; sponsorship is a separate, purely presentational field that cannot feed back into it.
8. **Can arbitrary AI output create an opportunity?** No — AI only ever returns a `PROFESSIONAL_ESCALATION` data block; opportunity creation requires an authenticated user's explicit action through the existing server-action boundary, the same "AI proposes, user confirms, app writes" rule as the Roadmap-proposal contract.
9. **Can user PII leak into analytics?** No — `platform_events.metadata` is a strict, per-event-name discriminated union (Intelligence doc); there is no field shape that accepts arbitrary text or an unlisted key.
10. **Can a regulated provider receive a lead before regulatory eligibility?** No — `getRegulatoryPolicy(category, jurisdiction)` is an additional gate inside `isEligible` (Intelligence doc), evaluated before an opportunity can ever reach `ROUTED`; regulatory policy can only narrow eligibility further, never widen it.
11. **Can private precise location leak publicly?** No — precise device geolocation isn't collected at all in V1; `geo.city`/`state` are the finest grain ever stored, and `professional_profiles_public` has no address column to leak.
12. **Can a user be contacted before consent?** No — `LeadSummary`/contact details are withheld until `consentState` reaches `CONSENTED` (and then `ROUTED`), a forward-only state machine with no skip path.
