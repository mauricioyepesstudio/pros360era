# EVOLUSA — Platform Blueprint V1

Architecture only. Nothing in this document has been built, migrated, or deployed. It defines the target shape so implementation work has one plan to build against instead of ad hoc feature requests.

## North star

EVOLUSA exists to help people building their lives in the United States answer four questions: **Where am I? What should I do next? Who can help me? Am I making progress?**

Core loop:

```
DIAGNOSIS → EvolUSAia → ROADMAP → ACTION → VERIFIED PROFESSIONAL (when needed)
  → APPOINTMENT/SERVICE → RESULT → ROADMAP UPDATE → NEXT STEP
```

Every subsystem below exists to serve one step of this loop. A feature that doesn't map onto it does not belong in the product yet.

## Product architecture map

| Name | Role | Status |
| --- | --- | --- |
| **EVOLUSA** | Main platform | Live (public site + account, Phase 2) |
| **EvolUSAia** | Contextual intelligence layer | Designed this phase — see [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md) |
| **EVOLUSA Roadmap** | Personalized progress system | Live (deterministic v1) — extended by this blueprint with outcome/progress events |
| **EVOLUSA Network** | Professional ecosystem | Designed this phase — see [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md) |
| **EVOLUSA Verified** | Credential/trust/verification layer | Designed this phase, part of Network doc |
| **EVOLUSA Match** | Matching engine | Designed this phase, part of Network doc |
| **EVOLUSA Appointments** | Scheduling/consultation layer | Designed this phase, part of Network doc |
| **EVOLUSA Pay** | Payments | Explicitly deferred — no design work until the business/regulatory model is chosen (see "Business model assumptions" below) |

This is a **product family**, not five separate apps: one account, one Roadmap, one trust hierarchy, surfaced through different UI layers. `EvolUSAia`, `Verified`, `Match`, and `Appointments` all read/write the same per-user domain model already established in `data/account/types.ts` — none of them get their own parallel user or progress model.

## User types

### A. Member

Extends the **existing** `UserProfile` (`data/account/types.ts`) — this blueprint does not replace it. New surfaces a Member needs, each mapped to a proposed table in [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md#proposed-schema):

profile · onboarding/diagnostic (existing) · life stage (existing `currentStage`) · goals (existing) · roadmap (existing, extended with outcome events) · tasks (existing) · life events (existing) · EvolUSAia conversations (existing `assistant_conversations`/`assistant_messages`, extended) · saved professionals (new) · appointments (new) · documents metadata (new, Phase 2 — see MVP-V2) · service history (new, via `appointment_outcomes`) · progress timeline (new, via `progress_events`).

### B. Professional

A wholly new account role, additive to Member — see `account_roles` in the proposed schema. A Professional row is **never** assumed to carry the same rules as another category; every rule is looked up by `professional_categories` (see below), never hardcoded per feature.

Needs: professional profile · identity · professional category · jurisdiction/state · languages · service areas · credentials · licenses · verification records · availability · consultation modes · pricing metadata · office/virtual status · appointment history · reviews (verified-interaction only) · compliance scope · public profile.

## Professional categories

Modeled as a **code catalog** (`data/professional/categories.ts`, new — not a database table), the same pattern already used for `serviceCompliance` in `data/compliance/claims.ts`. Static classification rules belong in code as the single source of truth; the database only ever stores which category a given professional's row references (`professional_profiles.category_id text`), the same way `roadmap_items.catalog_item_id` references a code-defined id today.

| Group | Candidate categories |
| --- | --- |
| **Regulated / high-trust** | Immigration Attorney, Business Attorney, Tax Attorney, CPA, Enrolled Agent, Insurance Professional, Real Estate/Mortgage Professional (where applicable), DOJ-Accredited Immigration Representative |
| **Service / business** | Bookkeeper, Notary, Translator/Interpreter, Business Consultant, Marketing Professional, Web Designer/Developer, Graphic Designer, Photographer/Video, other business-support specialists |

Each category entry carries: `scope`, `verificationRequirements`, `jurisdictionRules`, `allowedServiceClaims`, `advicelsRegulated: boolean`, `bookingPaymentConstraints`. This is deliberately the same shape as `ServiceCompliance` in `claims.ts` — every regulated professional category should also map to an existing `ServiceCategory` (e.g., Immigration Attorney → `IMMIGRATION`) so the existing compliance engine governs both the marketing-side service listing and the professional-side credential requirement from one rule, not two. See [EVOLUSA-TRUST-COMPLIANCE.md](./EVOLUSA-TRUST-COMPLIANCE.md) for the full rule shape.

## North-star metric

**Meaningful Steps Completed.** Not a page view, an AI message, or a login. A meaningful step is one of: a roadmap task marked complete, a verified appointment completed, a roadmap milestone completed, a service outcome recorded, or a required action completed.

Tracked via a new append-only `progress_events` table (one row per meaningful step, never updated/deleted by the user — audit-trail style, matching the existing `onboarding_responses` pattern). See schema in [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md). Every other metric (activation, retention, match quality, appointment show-rate) is secondary and instrumented against this event stream, not a separate analytics schema.

## Scope

Full detail in [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md). Summary:

- **MVP**: Diagnosis → EvolUSAia (structured, source-labeled, non-advisory) → Roadmap → one verified professional category live → Match (explainable, simple scoring) → Appointments (external calendar link, not built in-house) → Progress event stream.
- **Phase 2**: Reviews, additional professional categories, document metadata vault, consent-based data-access grants, audit log, richer source registry with real ingestion.
- **Phase 3**: EVOLUSA+ member tier, professional Pro/Practice tiers, advanced matching, EVOLUSA Pay (only after business/regulatory model is confirmed).

## Business-model assumptions (design only — no billing implemented)

- **Member**: Free now; **EVOLUSA+** reserved for a future premium tier (scope undefined — not part of this blueprint's MVP).
- **Professional**: Free profile (listed, matchable, bookable) as the default; **Pro** and **Practice/Business** tiers layer on verification priority, analytics, a lightweight CRM view of intake summaries, and priority placement in Match — never a commission percentage of a legal fee (explicitly rejected per instruction; commission-on-regulated-advice creates exactly the fee-splitting/referral-fee risk `EVOLUSA-TRUST-COMPLIANCE.md` exists to prevent). Billing rules must be modeled **per professional category** — a flat SaaS-style subscription is safe for every category; a per-lead or per-booking fee needs a category-by-category compliance check before it's ever proposed for regulated categories (attorneys, CPAs) since several state bars restrict fee-sharing with non-lawyers.

## Cross-references

- [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md) — AI response model, context model, source architecture, escalation engine.
- [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md) — Verified, Match, Appointments, Reviews.
- [EVOLUSA-TRUST-COMPLIANCE.md](./EVOLUSA-TRUST-COMPLIANCE.md) — compliance engine extension, privacy/security model.
- [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md) — scope cut lines, proposed schema, risks, next milestone.
