# EVOLUSA — MVP V2 (Platform)

Scope, proposed schema, and risk for the move from marketing+account product ([EVOLUSA-MVP.md](./EVOLUSA-MVP.md), already shipped) into a real two-sided platform. No migration in this document has been applied — see "Proposed schema" for what's designed vs. built.

## Scope

### MVP — proves the full loop once, thinly

`DIAGNOSIS → EvolUSAia → ROADMAP → VERIFIED PROFESSIONAL → MATCH → APPOINTMENT → PROGRESS`

- EvolUSAia: structured responses (six block types), the three-trust-layer model, deterministic escalation rules — **no live model provider required to prove the architecture**; can ship with a rules-driven/templated response generator first and swap in a real model later without changing the response contract.
- Exactly **one** professional category live end-to-end (recommend: Business Consultant or Bookkeeper — `SERVICE_BUSINESS` group, not `REGULATED`, so Verified/Match/Appointments can be proven without a bar-verification workflow blocking launch).
- EVOLUSA Verified: `IDENTITY_VERIFIED` + `EVOLUSA_PROFESSIONAL` badge only. License/bar verification types are designed (schema exists) but not required to launch MVP with the one non-regulated category above.
- EVOLUSA Match: explainable checklist scoring (no ML ranking).
- EVOLUSA Appointments: request → confirm → complete, external meeting link (Google Meet/Zoom), no reschedule automation (manual re-request is acceptable for MVP).
- Progress events: the four "meaningful step" event types, powering the North Star metric from day one.

### Aggressively NOT in MVP

- Reviews (needs completed appointments to exist first — Phase 2).
- Any regulated professional category (Immigration/Business/Tax Attorney, CPA, EA, Insurance) — needs real verification workflow, which is Phase 2.
- Document metadata vault.
- Consent-based data-access grants between member and professional (beyond appointment intake notes).
- Real source ingestion pipeline — MVP source registry can be **hand-seeded** with a handful of real, manually-verified official links (USCIS, IRS, SBA, Florida Sunbiz) rather than built as a live crawler.
- Reschedule/cancellation automation, reminders, timezone-aware notification delivery.
- Professional Pro/Practice tiers, any billing.
- Multi-professional practice accounts.
- Audit log table (design exists, not required until moderation/verification review actually happens at volume).
- Social features of any kind (public reviews feed, professional following, member-to-member anything) — explicitly out per instruction.

### Phase 2

- Reviews (verified-interaction gated).
- Second and third professional categories, including the first `REGULATED` category with real license/bar verification.
- Document metadata vault (`documents` table — metadata only, storage design deferred).
- `data_access_grants` (explicit, revocable member→professional sharing beyond intake notes).
- `audit_log` wired into verification/moderation actions.
- Real source ingestion (scheduled fetch → `source_documents` snapshot → citation), still human-reviewed before a source is marked `trust_level` high.
- Reschedule/cancel flows, reminder notifications.

### Phase 3

- EVOLUSA+ member tier, Professional Pro/Practice tiers — actual billing, after a category-by-category legal review of fee models (see business-model note in the Platform Blueprint).
- ML-assisted match ranking (still required to emit the same explainable checklist as MVP's rule-based scorer — this is a hard constraint carried forward, not a Phase 3 relaxation).
- EVOLUSA Pay — only after the business/regulatory model is chosen; no design work happens before that decision.
- Multi-professional practice accounts, team analytics.
- English localization of the Network/Match/Appointments surfaces.

## Proposed schema

**Design only — not migrated.** Two kinds of new concepts, following the existing "catalog in code, state in database" rule from `EVOLUSA-DATA-MODEL.md`:

**New code catalogs** (no table): `data/professional/categories.ts`, `data/professional/verification-types.ts`, `data/assistant/escalation-rules.ts`, `data/assistant/response-blocks.ts` (block-type definitions).

**New tables** (all: UUID PK via `gen_random_uuid()`, `created_at timestamptz default now()`, owner-pattern RLS unless noted, `on delete cascade` from `auth.users` where a user is the owner):

| Table | Key columns | RLS pattern |
| --- | --- | --- |
| `account_roles` | `user_id` (PK/FK), `role` (`MEMBER`\|`PROFESSIONAL`) | owner |
| `professional_profiles` | `user_id` FK, `category_id` text, `display_name`, `bio`, `state`, `languages text[]`, `service_areas text[]`, `consultation_modes text[]`, `pricing_metadata jsonb`, `is_public boolean` | owner write; **public view** for read (see Trust/Compliance doc) |
| `professional_services` | `professional_id` FK, `category_id`, `description`, `price_metadata jsonb` | owner write; public view for read |
| `credentials` | `professional_id` FK, `credential_type`, `identifier`, `issuer`, `jurisdiction`, `issued_at`, `expires_at` | owner + admin only, never public |
| `verifications` | `professional_id` FK, `verification_type`, `issuer`, `credential_identifier`, `jurisdiction`, `status`, `verified_at`, `expires_at`, `last_checked_at`, `evidence_metadata jsonb`, `review_status` | owner + admin only; public view exposes only type+status+date |
| `availability` | `professional_id` FK, `day_of_week`/`date`, `start_time`, `end_time`, `timezone`, `consultation_mode`, `capacity` | owner write; public view of open slots only |
| `professional_locations` | `professional_id` FK, `address`/`city`/`state`/`zip` or `VIRTUAL_ONLY`, `is_primary` | owner write; public view for read |
| `saved_professionals` | `user_id` FK, `professional_id` FK | owner (member) |
| `matches` | `member_id` FK, `professional_id` FK, `match_score numeric`, `match_reasons jsonb`, `status` | **two-party** (member or matched professional) |
| `appointments` | `member_id` FK, `professional_id` FK, `match_id` FK nullable, `scheduled_at`, `timezone`, `consultation_type`, `external_meeting_provider`, `external_meeting_url`, `status`, `intake_notes` | **two-party** |
| `appointment_participants` | `appointment_id` FK, `user_id` FK, `role` | two-party (via parent appointment) |
| `appointment_outcomes` | `appointment_id` FK (unique), `outcome_summary`, `follow_up_action`, `roadmap_item_id` nullable, `recorded_by`, `recorded_at` | two-party |
| `reviews` | `appointment_id` FK (unique, must be `COMPLETED`), `member_id` FK, `professional_id` FK, five rating dimensions + `overall`, `text_review`, `moderation_state` | member write; public view gated on `moderation_state = 'APPROVED'` |
| `source_registry` | `title`, `authority`, `url`, `jurisdiction`, `category`, `trust_level`, `effective_date`, `expiry_date`, `updated_at` | public read; write restricted to service-role ingestion |
| `source_documents` | `source_registry_id` FK, `content_snapshot`/storage ref, `fetched_at`, `content_hash`, `is_current` | public read; write restricted to service-role ingestion |
| `ai_citations` | `assistant_message_id` FK (existing table), `source_registry_id` FK nullable, `professional_category_id` nullable, `citation_type` (`OFFICIAL`\|`EVOLUSA_GUIDE`\|`PROFESSIONAL`) | owner (via parent conversation) |
| `ai_escalations` | `assistant_message_id` FK, `escalation_tier`, `signal_reason`, `resolved boolean`, `resolved_at` | owner (via parent conversation) |
| `progress_events` | `user_id` FK, `event_type` (`TASK_COMPLETED`\|`APPOINTMENT_COMPLETED`\|`ROADMAP_MILESTONE`\|`SERVICE_OUTCOME_RECORDED`\|`REQUIRED_ACTION_COMPLETED`), `reference_id`, `occurred_at`, `metadata jsonb` | owner, append-only (no update/delete) |

Every FK to `professional_profiles`/`appointments`/etc. above is illustrative column intent, not final DDL — actual migrations need `supabase-architect` to write and `security-reviewer` to check before anything is applied, per existing repo convention.

## Milestone 01 — account roles + professional foundation (APPLIED, live-verified)

Migration file: `supabase/migrations/0005_evolusa_professional_foundation.sql` — **applied** to the EVOLUSA project (`ovialqdazxkekvqqgdiu`) and verified with 21 live authorization tests (13 negative, 8 positive) plus a post-apply advisor pass. Code catalog: `data/professional/types.ts`, `data/professional/categories.ts`. Full live test results, the grant bug found and fixed during apply, and advisor findings are in [CURRENT-STATE.md](./CURRENT-STATE.md#milestone-01-status-live--applied-hardened-and-authorization-tested) — not duplicated here. The design rationale below remains accurate to what's actually live.

This is the actual implemented design for the first slice of "Recommended next implementation milestone" above, and it deliberately simplifies two things this document originally sketched:

- **`account_roles` (proposed as a table above) became a `role` column on the existing `profiles` table instead.** `profiles` is already the canonical 1:1-with-`auth.users` row, already auto-provisioned on signup — a second 1:1 table for one enum column would only add a place role state could drift from the profile it describes. Existing users backfill to `'MEMBER'` automatically via the column default; no migration script needed.
- **`professional_categories` (proposed as a table above) is a code catalog** (`data/professional/categories.ts`), not a table — one entry only (`BUSINESS_MARKETING`, mapped to the real, live `MARKETING` service category in `data/compliance/claims.ts`), matching the "catalog in code, state in DB" rule already established for stages/services.

### Final schema (this milestone only)

- `profiles.role text not null default 'MEMBER' check (role in ('MEMBER','PROFESSIONAL','ADMIN'))`, protected by a `BEFORE UPDATE` trigger that rejects any client-side change to `role` (only a `service_role` connection may change it).
- `professional_profiles`: `id`, `user_id` (unique FK to `auth.users`), `display_name`, `slug` (unique, URL-safe, checked), `category` (checked against the one MVP catalog id), `headline`, `bio`, `state`, `city`, `languages text[]`, `consultation_mode`, `is_accepting_clients` (default `false`), `is_approved` (default `false`, protected the same way as `role`), `created_at`/`updated_at`.
- `professional_profiles_public`: a view exposing only `slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients`, filtered to `is_approved = true` — never `id`, `user_id`, `is_approved` itself, or anything from `auth.users`. Granted to `anon, authenticated`; the base table carries no such grant.

### RLS rules

`professional_profiles`: owner-only `SELECT`/`UPDATE` (`(select auth.uid()) = user_id`), **no `INSERT` policy for `anon`/`authenticated` at all** — this is what makes self-service professional signup structurally impossible, not just a missing UI; only a `service_role` connection can create a row. No `DELETE` policy (cascade from `auth.users` only, same convention as `profiles`). Public/anonymous read happens exclusively through `professional_profiles_public`, never a public policy on the base table.

### Manual professional provisioning procedure (MVP — no admin UI)

1. The professional has or creates a normal EVOLUSA account (existing signup flow, unchanged) — they land as `role = 'MEMBER'` like everyone else.
2. An authorized operator, connected with the Supabase service-role key (SQL editor or a one-off authenticated script — not the app's client), runs `update profiles set role = 'PROFESSIONAL' where id = '<their auth.users id>'`.
3. The same operator inserts their `professional_profiles` row directly (`insert into professional_profiles (...) values (...)`), with `is_approved` left at its default `false`.
4. Once the operator has manually reviewed the content, `update professional_profiles set is_approved = true where id = '<row id>'` — only then does the row appear through `professional_profiles_public`.

No code path exists for a user to perform any of these four steps themselves.

### Public/private field boundary

| Public (`professional_profiles_public`) | Private (base table only) |
| --- | --- |
| `slug`, `display_name`, `category`, `headline`, `bio`, `state`, `city`, `languages`, `consultation_mode`, `is_accepting_clients` | `id`, `user_id`, `is_approved`, `created_at`, `updated_at` |

### Known MVP limitations (accepted, not fixed this milestone)

- `slug` is owner-editable via the normal `UPDATE` policy (not protected like `is_approved`/`category`) — a professional could rename their own slug and break a shared link. Low severity (no data leak, no privilege escalation); deferred rather than adding a fourth protected-column trigger for a single-row MVP.
- Only one professional category exists; adding a second means a follow-up migration to widen the `category` check constraint, not a config change.
- No admin UI — provisioning is direct SQL, run by an authorized operator only.
- No automated RLS test suite exists in this repo (the existing `npm test` covers the deterministic roadmap engine only) — authorization was verified live for this milestone (21 tests, see CURRENT-STATE.md), but that verification is a point-in-time manual pass, not a regression suite; any future schema change to these tables needs its own live re-verification the same way.

## Biggest unresolved risks

1. **Regulated-category verification is a real-world process, not a schema.** The `verifications` table can hold a status, but *who actually checks a bar number or a state license* (manual admin review? a paid verification API? both?) is unresolved and blocks any `REGULATED` category from launching — MVP deliberately routes around this by launching with a `SERVICE_BUSINESS` category first.
2. **Fee-sharing/referral-fee risk for regulated professionals.** Several states restrict a non-lawyer platform from taking a fee tied to legal services. No billing model for `REGULATED` categories should be designed, let alone built, without an actual legal review — this blueprint explicitly declines to guess at a specific number or percentage for that reason.
3. **Deletion vs. two-party records.** What happens to a professional's review/appointment history when the *member* deletes their account (or vice versa) is unresolved — flagged in Trust/Compliance doc, needs a product decision before Phase 2 Reviews ship.
4. **EvolUSAia without a model provider.** MVP can launch with a rules/template-driven response generator, but the moment a real LLM is wired, prompt-injection and context-leakage risks (a malicious message trying to make the model claim to be a lawyer, or leak another user's data via a shared context bug) need a dedicated security pass — not designed in this document, flagged for whenever provider selection happens.
5. **Source registry staleness.** A hand-seeded MVP source registry will drift from reality (a URL changes, a form is deprecated) with no automated freshness check until real ingestion (Phase 2) exists — `updated_at`/`expiry_date` fields exist precisely so a manual quarterly review process has something to query, but that process itself doesn't exist yet.
6. **Two-party RLS is new to this codebase.** Every existing table uses single-owner RLS; `matches`/`appointments` need the OR-based two-party pattern for the first time. This is a real, well-known pattern, but it's new *here* — worth a dedicated `security-reviewer` pass before the first migration using it is applied, not assumed correct by analogy.

## Recommended next implementation milestone

**Step 1 is done** — `professional_profiles` + its public view are live and authorization-tested (see Milestone 01 above). **Do not jump to EvolUSAia or Match next.** The remaining narrow slice, in order:

1. ~~`account_roles` + `professional_profiles` (Free tier only, one hand-picked `SERVICE_BUSINESS` category) + its public view.~~ **Done — Milestone 01.**
2. `/profesionales/[slug]` — the minimum public route reading real data from `professional_profiles_public`, explicitly deferred out of Milestone 01. Design already exists (see the original milestone request); build it against the now-live view.
3. `verifications` with `IDENTITY_VERIFIED` only, manually reviewed (no automation).
4. A single hardcoded/manual "match" (skip the scoring engine entirely — pick one verified professional by hand) to prove `appointments` end-to-end: request → confirm → external meeting link → complete → `appointment_outcomes` → a real `progress_events` row.

Only after that thin vertical slice is live and RLS-verified (two-party pattern, tested the same way the existing cross-user isolation test was done in `EVOLUSA-SECURITY.md`) does it make sense to build the Match scoring engine or EvolUSAia's structured responses — both are UX/intelligence layers on top of a data model that needs to be proven correct first.
