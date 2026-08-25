# EVOLUSA — EvolUSAia

Architecture only — no LLM provider is wired. This extends the existing typed foundation in `lib/assistant/service.ts` and `data/account/types.ts` rather than replacing it.

## Core principle

EvolUSAia is **not** an immigration attorney, a lawyer, a CPA, a licensed insurance adviser, or a substitute for a regulated professional.

EvolUSAia **is** contextual intelligence: an information organizer, an official-source navigator, a Roadmap assistant, a triage layer, a decision-support interface, and a professional-escalation router.

This is not a tone guideline — it is an architectural constraint. EvolUSAia's response model (below) makes the boundary structural: every response is composed from labeled blocks, and the "PROFESSIONAL" block is the only place individualized advice language is permitted to appear, and only as a referral, never as an answer.

## Response model — three trust layers

The codebase already has this hierarchy: `TrustSource = "OFFICIAL" | "EVOLUSA_GUIDE" | "PROFESSIONAL"` (`data/account/types.ts`), already used by `RoadmapItem.sourceType`, and `assistant_messages.guidance_label` is already constrained to the same three values in the schema. EvolUSAia's response model is this same enum, applied consistently to AI output instead of inventing a fourth naming scheme:

| Trust layer | Existing type value | Meaning |
| --- | --- | --- |
| **OFFICIAL SOURCE** | `OFFICIAL` | What an authoritative source (USCIS, IRS, state agency) says, cited directly. |
| **EvolUSAia** | `EVOLUSA_GUIDE` | Contextual explanation, organization, and Roadmap relevance — EVOLUSA's own synthesis, not an authority. |
| **PROFESSIONAL** | `PROFESSIONAL` | Flagged when individualized professional judgment or regulated advice is required — always a referral into EVOLUSA Network, never EvolUSAia answering in that professional's place. |

The user must be able to see which layer they're reading **in the UI itself**, not in a footer disclaimer — every structured response block (below) carries its trust-layer label as a visible header, not a tooltip or asterisk.

## EvolUSAia UX — not a generic chat bubble

### Signed-in entry state

A context-aware landing state, not an empty input box:

```
Good morning.

You are currently in: ESTABLÉCETE
2 steps completed · 1 priority pending · 1 upcoming appointment

What do you want to solve today?
› Understand my next step
› Ask a question
› Find a professional
› Review my Roadmap
```

Every fact in that entry state (stage, step counts, appointment) is already computable from existing data: `UserProfile.currentStage`, `roadmap_items` status counts, and the new `appointments` table (see Network doc). No new source of truth is needed for the entry state itself.

### Structured response blocks

A conversational reply is not a single paragraph. It renders as an ordered set of typed blocks, each independently omittable if not applicable:

```
SHORT ANSWER
WHY THIS MATTERS TO YOU
OFFICIAL SOURCES
YOUR ROADMAP
NEXT ACTION
PROFESSIONAL ESCALATION
```

`AssistantResponse` (`lib/assistant/service.ts`) is extended from its current single-string shape to this block union:

```ts
type AssistantResponseBlock =
  | { type: "SHORT_ANSWER"; text: string }
  | { type: "WHY_THIS_MATTERS"; text: string }
  | { type: "OFFICIAL_SOURCES"; citations: SourceCitation[] }        // trust layer: OFFICIAL
  | { type: "YOUR_ROADMAP"; roadmapItemIds: string[] }               // trust layer: EVOLUSA_GUIDE
  | { type: "NEXT_ACTION"; actionType: RoadmapItem["actionType"]; label: string; href?: string }
  | { type: "PROFESSIONAL_ESCALATION"; category: string; reason: string; matchHref?: string }; // trust layer: PROFESSIONAL

type AssistantResponse = {
  blocks: AssistantResponseBlock[];
  escalationTier: EscalationTier;   // see Escalation engine below
  guidanceLabel: TrustSource;       // the dominant/highest label present, for list/summary views
};
```

This is additive to the existing contract — `AssistantPrompt` (`message`, `context: RoadmapInput`) does not need to change shape, only `AssistantResponse` grows richer.

## EvolUSAia context

With user permission, EvolUSAia should eventually read: account profile, stage, location/state, language, goals, roadmap, completed tasks, life events, professional interactions, appointments, saved services, and previous EvolUSAia conversations. Every one of these already exists as a typed field on `UserProfile`/`RoadmapInput` or a proposed table in the Network doc — EvolUSAia's context object is a read-only projection of existing state, not a new profile.

**Rule: the AI must not ask questions the platform already knows the answer to**, unless confirmation is genuinely necessary (e.g., "you told us X three months ago — is that still true?" after a life event that would plausibly invalidate it). This is enforceable mechanically: every prompt sent to a model is assembled server-side from the typed context object, and any question whose answer exists in that object must be answered from it before the model is asked anything.

Context is assembled server-side only. No client ever sends its own copy of profile/roadmap state as part of a prompt; the server derives it from the authenticated session, the same boundary rule already enforced for persistence writes (`app/(account)/actions.ts` never accepts a client-supplied user id).

## Source architecture

A retrieval/source system, designed now, **not implemented** — no blind scraping.

### Source families (initial)

USCIS · DOJ/EOIR (where relevant) · IRS · SBA · SSA · state government (keyed by the user's `state`) · Florida Division of Corporations (Sunbiz) · Florida DOR · county/city official resources · professional licensing authorities (per state, per category).

### Source metadata

Each source record (`source_registry`, see schema in MVP-V2) carries: `title`, `authority`, `url`, `jurisdiction`, `category`, `updated_at`, `fetched_at`, `trust_level`, `effective_date` (if available), `expiry`/`review_date` (if applicable). `source_documents` stores fetched snapshots against a `source_registry_id`, each with its own `fetched_at` and a content hash — so a citation always points at a specific point-in-time snapshot, not a live URL that may have since changed.

EvolUSAia never cites a source it hasn't fetched and stored a snapshot of. This is the mechanism that makes "OFFICIAL SOURCES" block trustworthy rather than a hallucinated link.

### What's explicitly out of scope this phase

- No scraping pipeline, scheduler, or crawler implementation.
- No vector index or embeddings pipeline.
- No live model provider wiring.

Only the schema and the citation contract are designed now, so the ingestion pipeline (whenever built) has a stable table to write into and the UI has a stable shape to render.

## Escalation engine

Every response is classified into exactly one tier before it's shown:

| Tier | When | Example |
| --- | --- | --- |
| **SELF_SERVICE** | The user's own Roadmap/account state already answers it | "What's my next step?" |
| **OFFICIAL_RESOURCE** | An authoritative source answers it directly and generically | "What documents does USCIS require for X?" |
| **EVOLUSA_GUIDE** | Needs EVOLUSA's own contextual synthesis across sources/Roadmap, still non-advisory | "How does this affect my Roadmap?" |
| **VERIFIED_PROFESSIONAL** | Individualized judgment or regulated advice is required | Any signal below is present |
| **URGENT_HUMAN_REVIEW** | High-risk or time-sensitive individualized situations | Deadlines, court proceedings, contradictory facts |

Escalation signals that force at least `VERIFIED_PROFESSIONAL` (each one independently sufficient): individualized legal strategy · immigration status consequences · deadlines · court proceedings · tax liability questions · insurance coverage decisions · complex financial decisions · contradictory facts supplied by the user · high model uncertainty · the user explicitly asks for professional advice.

Escalation rules are a **deterministic, testable ruleset** (`data/assistant/escalation-rules.ts`, new — mirrors the existing pure-function pattern in `lib/roadmap/rules.ts`), evaluated **before** any model call, not left to model judgment alone. A model may raise the tier (e.g., detect ambiguity mid-conversation) but a deterministic keyword/context rule can never be silently downgraded by the model — the highest tier wins. Each escalation decision is persisted (`ai_escalations`, see schema) with its triggering `signal_reason`, so escalation behavior is auditable, not a black box.

`LEGAL`/`IMMIGRATION` categories inherit the strictest defaults from `data/compliance/claims.ts`'s existing `serviceCompliance` table — this is not a new rule, it's the same rule already governing marketing copy, now also governing AI output.

## Milestone 04 additions (architecture only — not implemented)

Everything below was designed, not built, during the Milestone 04 architecture pass. It extends the sections above rather than replacing them; nothing here has a live migration, and no LLM provider is wired.

### Risk classification — feeds the escalation engine, doesn't replace it

A question is classified `LOW | MODERATE | HIGH` **before** `escalationTier` is computed — `riskLevel` is the deterministic classifier's raw signal; `escalationTier` (above) is the derived, user-facing routing decision. Both are present on `AssistantResponse`, but only `escalationTier` drives UI rendering; `riskLevel` exists for analytics/tuning of the ruleset itself.

The distinguishing test is **individualized judgment applied to this person's specific facts, versus general education true for anyone in that category** — not topic sensitivity alone:

- **LOW** — a stable, definitional answer with one correct response regardless of who's asking ("What is an EIN?").
- **MODERATE** — a general process/requirements question, answerable from official-source content without evaluating the user's specific situation ("What documents are generally used to form an LLC?").
- **HIGH** — answering requires evaluating this person's individual facts to produce a recommendation, or the topic carries immigration-status/legal/financial consequences if wrong ("Should I file asylum now or wait?", "Which immigration status should I choose?", "Should I sign this legal agreement?", "How should I answer this USCIS question given my situation?").

**Category floors, not per-question guessing**: `LEGAL`/`IMMIGRATION` (via `serviceCompliance`) set a **minimum** `riskLevel` of `MODERATE` regardless of how the individual question reads — a deterministic rule can raise a category's floor but a per-question classification can never lower it below that floor. This mirrors the existing "highest tier wins" rule for `escalationTier` and prevents an innocuous-sounding immigration question ("What is asylum?") from being scored `LOW` just because it's phrased definitionally.

### Source-type simplification — only one is needed for V1

The candidate four-value `source_type` (`OFFICIAL | EVOLUSA_CURATED | PROFESSIONAL | USER_PROVIDED`) was evaluated and reduced to **one**, `OFFICIAL`, for V1:

- `EVOLUSA_CURATED` is redundant with the existing `TrustSource = "EVOLUSA_GUIDE"` response-block label — EVOLUSA's own synthesis is already distinguished at the block level and is never itself a citable "source." A hand-seeded V1 `source_registry` (per MVP-V2) is by construction operator-verified, so every row is `OFFICIAL`; a separate provenance tag adds a taxonomy with no second value to actually use yet.
- `PROFESSIONAL` isn't a source-registry concept at all — professional escalation is its own response block (`PROFESSIONAL_ESCALATION`), never a citation.
- `USER_PROVIDED` must **never** be modeled as a source type, because a `source_registry` row implies "citable, authoritative." Treating user-typed text as a citable source is exactly failure mode #11 below (`AI treats user-provided information as official fact`) — the correct handling is that user input is never written to `source_registry`/`source_documents` under any label.

`source_registry.source_type` can stay a single-value `check` constraint (`'OFFICIAL'`) for V1 — the same "catalog in code, widen the constraint later" pattern already used for `professional_verifications.verification_type`, not a reason to build the fuller taxonomy today.

### Freshness — minimum viable field

`source_registry.last_checked_at` (an EVOLUSA operator's own last-confirmed date, distinct from `effective_date` — when the underlying rule took effect) is the only freshness field required for V1. The fuller design (`source_documents` snapshots + content hash, enabling true point-in-time citation) stays deferred until real ingestion exists (Phase 2) — it needs a fetch pipeline to populate it, which is explicitly out of scope this phase.

**Copy rule, enforced at render time, not just convention**: the UI always renders *"Fuente revisada por EVOLUSA: [last_checked_at]"* — never "Actualizado: [date]" or any phrasing implying the government page itself changed on that date. This is a single copy string in one place (the `OFFICIAL_SOURCES` block renderer), not something left to per-response wording.

### Roadmap proposal contract

`YOUR_ROADMAP` (existing, references items already on the user's Roadmap) is joined by a new block for items **not yet** on it:

```ts
type AssistantResponseBlock =
  | ...                                                    // existing block types, unchanged
  | { type: "ROADMAP_PROPOSAL"; catalogItemId: string; label: string };
```

`catalogItemId` must resolve to an **existing** code-catalog roadmap item — EvolUSAia can propose surfacing/prioritizing a catalog item the user hasn't seen yet, never inventing a freeform task. This is a deliberate V1 constraint, not an oversight: `roadmap_items` only ever stores `(user_id, catalog_item_id, status)` (see `lib/account/persistence.ts#completeRoadmapItem`), so a wholly custom AI-authored task has no column to live in today. Building that (a nullable `custom_title` or an `ai_suggested` provenance flag) is a real Phase 2+ feature, not required to prove the loop.

**Contract**: EvolUSAia emits the proposal block only → the UI renders `[Agregar al Roadmap]` → a click calls a new, small server action following the *exact* existing pattern (`app/(account)/actions.ts` → a `lib/account/persistence.ts` function, RLS-owner-scoped, no service-role key) that sets that catalog item's status — the same shape as the existing `completeRoadmapItem`, just activating rather than completing. The AI process itself never calls a persistence function; it only ever returns data for the client to act on, identical to the boundary rule already enforced everywhere else in this codebase (`app/(account)/actions.ts` never accepts a client-supplied user id, and no code path here would let a model response accept one either).

### User-context allowlist

An explicit projection, not "send the profile":

| May receive (server-assembled, read-only) | Must never receive by default |
| --- | --- |
| `currentStage`, `goals`, `selectedNeeds`, `businessStatus`, `employment`, `completedTaskIds`, `lifeEventIds` — exactly `RoadmapInput`, already assembled by `getCurrentProfile()` | `name` (not needed for guidance quality) |
| `state`, `preferredLanguage` (jurisdiction + response-language selection) | raw onboarding `answers` jsonb blob (only its already-typed, derived fields) |
| Roadmap item **counts/ids** already completed (for the entry-state summary) | any other user's data, ever |
| — | professional-side data (irrelevant to a Member's context) |
| — | appointment `intake_notes` (future, sensitive, requires its own explicit-share step — see Professional handoff below) |
| — | prior assistant conversation content beyond the current session (see Conversation storage below) |
| — | any `auth.users` field (email, etc.) — same boundary already enforced everywhere in `lib/account/persistence.ts`, extended unchanged here |

Same "the AI must not ask what the platform already knows" rule from above applies mechanically to this table, not just the fields it already named.

### Sensitive information policy

No storage is built for any of the following: passport numbers, A-numbers, SSNs, tax IDs, addresses, case numbers, medical information, immigration history details, financial account information.

- **Discouraged**: a persistent, visible notice in the assistant UI (the current placeholder page already says a version of this — "El servicio recibirá únicamente etapa, metas y necesidades" — extend that copy to explicitly name what never to type).
- **Redacted before use**: a deterministic pattern-matcher (SSN format, A-number format `A\d{8,9}`, EIN format, etc.) strips matches from a message **before** it reaches any model call and before any persistence write, replacing them with a placeholder token. Only "a value was redacted" is ever logged — never the matched value.
- **Not persisted**: even if the redactor misses something, the raw message is never the thing written to `assistant_messages.content` if conversation persistence is ever turned on (see below) — only the redacted version is.
- **Deferred**: any real document/evidence workflow (uploading a passport scan, etc.) is explicitly Phase 2+, tracked already in MVP-V2's "Document metadata vault" cut line — not designed further here.

### Conversation storage — the assumption, challenged

`assistant_conversations`/`assistant_messages` **already exist**, live, RLS-correct, 0 rows (applied in `0001`/`0002`/`0004` as a "typed foundation," per that migration's own comment). Their existing is a sunk schema cost, not a reason to turn on persistent user-facing chat history by default.

**Recommendation: V1 does not ship a user-facing conversation-history UI.** Two real options were weighed:
1. **True session-only** — no DB write at all; the current exchange lives only in the active session/client, nothing survives a reload. Simplest, smallest privacy surface, zero retention-policy work needed.
2. **Audit-only persistence into the existing tables** — still write redacted messages to `assistant_messages` purely for internal quality/escalation-accuracy review, but never expose a "history" screen to the user.

Given this is a legal/immigration-adjacent product where reviewing escalation-engine failures has real accountability value, (2) is the better fit **once a real model provider exists** — but it requires a retention/deletion policy that doesn't exist yet and shouldn't be designed blind before the redaction mechanism (above) is proven. For this architecture-only milestone, treat conversation storage as **deferred, not decided** — the existing schema is sufficient to build either option later without a new migration.

### Professional handoff — safe summary, not the transcript

When `escalationTier` reaches `VERIFIED_PROFESSIONAL`, the user is shown *why* and *what type of professional* (via `PROFESSIONAL_ESCALATION`'s `category`/`reason`), then may choose to browse. **EvolUSAia never sends anything automatically.** A future "safe summary" object — user-reviewed and user-edited before any send — is deliberately small and separate from the raw conversation:

```ts
type SafeSummaryDraft = { category: ServiceCategory; escalationReason: string; roadmapContext?: string[]; userNote?: string };
```

This is not a new table: it's the eventual input to `appointments.intake_notes`, already designed in [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#evolusa-appointments). Since Appointments doesn't exist yet, V1's actual behavior when escalation triggers is: show why + what type, link to browsing existing approved professionals — no send mechanism exists to build against yet, so none is built. "Send a safe summary" stays a Phase 2 feature, gated on Appointments.

### EVOLUSA Verified integration — never a collapsed "trusted" claim

EvolUSAia may say a generic *"EVOLUSA encontró profesionales que pueden ayudarte"* — a fact about search results existing, never a claim about a specific professional's trust state. It must **never** paraphrase or summarize an individual professional's verification status in its own words. Trust-state rendering for any specific professional is delegated entirely to the already-built primitives (`professional_profiles_public`, `VerifiedBadge`) — `is_approved` (public-visibility permission), `identity_verified` (Milestone 03's derived boolean), and any future license/business-verification type stay visually and semantically distinct exactly as Milestone 03/03B already established; EvolUSAia adds no fourth, blended "trusted" vocabulary of its own.

### Appointment/video-call future

No new design needed — `appointments`/`appointment_outcomes`/`appointment_participants` (request → confirm → complete, `external_meeting_provider`/`external_meeting_url`, no in-house video) are already fully designed in [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#evolusa-appointments). EvolUSAia's only future touchpoint is proposing the escalation that leads a user there — it never manages availability, confirmation, or the meeting link itself.

### Failure-mode red team

| Failure | Prevent | Detect | Recover |
| --- | --- | --- | --- |
| Hallucinates a filing deadline | `OFFICIAL_SOURCES` block requires a real `source_registry` citation; no deadline claim is permitted without one | Response validated server-side: any date-shaped claim in `SHORT_ANSWER`/`WHY_THIS_MATTERS` text must trace to a cited source or be stripped | Block ships without the claim rather than failing open; user directed to the official source directly |
| Cites a nonexistent law/source | `source_registry` is hand-seeded and operator-verified only (no live generation of citation records) | A citation whose `source_registry_id` doesn't resolve is a hard render error, not a silently-dropped citation | Response fails closed (shows `SOURCE UNCERTAIN` state, below) rather than rendering a fabricated link |
| Uses an outdated USCIS rule | `last_checked_at` freshness field + operator review cadence (manual, quarterly per MVP-V2's flagged risk) | Sources past a staleness threshold are flagged for operator review, not silently served | Stale source shown with visible review date so the user can judge currency themselves; never implied current by omission |
| Recommends the wrong professional type | `required_professional_category` is drawn from the existing, stable `ServiceCategory` taxonomy (`data/compliance/claims.ts`), not free text | Escalation category is always one of the closed enum values — an out-of-enum value is a build-time type error, not a runtime surprise | User can still browse all categories manually; wrong category shown is a content bug, not a broken code path |
| Implies EVOLUSA verified a license it hasn't | See "EVOLUSA Verified integration" above — structural, not a prompt instruction | Any AI-authored sentence containing verification vocabulary about a specific professional is a policy violation by definition, checkable by string-matching in review | Fix the offending copy; the underlying data was never wrong since AI never writes to `professional_verifications` |
| Exposes private professional metadata | AI context assembler only ever reads `professional_profiles_public` (11 public columns), same boundary as the web UI — never the base table | Same leak-check discipline already used in Milestones 02B/03B (grep rendered/returned content for private field names) applies to AI output too | Redeploy the context assembler with the correct view; no schema change needed since the boundary already exists |
| Changes Roadmap without permission | `ROADMAP_PROPOSAL` block is inert until a user click hits the existing action boundary; AI has no persistence credential of any kind | Any Roadmap write not attributable to an authenticated user-initiated request is a bug by construction (RLS requires `auth.uid()` ownership on every write) | N/A structurally — there is no code path for this to happen, only for the UI to render a proposal wrong |
| Sends conversation to professional without consent | No send mechanism exists in V1 (see Professional handoff above) | N/A until Appointments/handoff is built | N/A until Appointments/handoff is built — flagged as the point where this needs a real consent gate designed |
| Gives individualized legal advice | Risk/escalation classifier forces `VERIFIED_PROFESSIONAL`/`URGENT_HUMAN_REVIEW` before any individualized-judgment answer is composed | `PROFESSIONAL` trust-layer block appearing with substantive advice text (rather than a referral) is a review-catchable policy violation | Response template for `PROFESSIONAL_ESCALATION` never contains an answer field, only `reason`/`category` — structurally can't carry advice text |
| Answers confidently when evidence is insufficient | `OFFICIAL_SOURCES` required for any `OFFICIAL_RESOURCE`-tier response; missing citation forces `SOURCE UNCERTAIN` state instead | Empty/low-confidence citation set is a detectable pre-render condition | UI shows `SOURCE UNCERTAIN` (below), never a confident-sounding answer with no backing |
| Treats user-provided information as official fact | User input is never written to `source_registry`/`source_documents` under any label (see source-type simplification above) | N/A — structurally excluded, not a runtime check | N/A |
| Fabricates marketplace availability | `required_professional_category` (conceptual, `ServiceCategory`) is checked against a **live query** of `professional_profiles_public` at render time before claiming supply exists | Zero live results for a category renders `NO PROFESSIONAL CURRENTLY AVAILABLE` (below), never a generic "we can help" | UI state is driven by the live query result, not by the existence of the category concept itself |

### UX states

- **NORMAL GUIDANCE** — the standard block set (`SHORT_ANSWER` → `WHY_THIS_MATTERS` → `OFFICIAL_SOURCES` → `YOUR_ROADMAP`/`ROADMAP_PROPOSAL` → `NEXT_ACTION`), calm, no warning styling.
- **SOURCE UNCERTAIN** — shown instead of a confident answer when no citable `source_registry` entry exists yet; plain, matter-of-fact copy ("Todavía no tenemos una fuente oficial verificada para esto") plus a path to search independently or ask a professional — never a fabricated citation to avoid looking empty.
- **PROFESSIONAL HELP RECOMMENDED** — `PROFESSIONAL_ESCALATION` block, calm explanatory tone (why + category), CTA to browse — not alarmist, since most escalations aren't emergencies.
- **URGENT / HIGH-RISK** — same block shape as above with visually distinct (not frightening) urgency treatment reserved specifically for `URGENT_HUMAN_REVIEW` tier (deadlines, court proceedings, contradictory facts) — clear and direct, not red/siren styling that would apply fear-based pressure.
- **NO PROFESSIONAL CURRENTLY AVAILABLE** — the live-query-empty case from the red-team table above; honest ("Todavía no tenemos un profesional verificado en esta categoría"), never silently substituting a different category or omitting the escalation entirely just because supply doesn't exist yet.

### Recommended V1 (design only — see Milestone 04 report for the full recommendation)

Structured guidance contract (block union above) · curated source registry (`OFFICIAL` only) · deterministic risk classifier with category floors · escalation policy reusing the existing 5-tier model, routed via `ServiceCategory` · explicit context allowlist · roadmap proposal contract (existing catalog items only) · no user-facing conversation history · no autonomous agent · no direct professional messaging · no appointments yet · still no live model provider required to prove the contract (a rules/template-driven generator can ship first, per MVP-V2's own recommendation).
