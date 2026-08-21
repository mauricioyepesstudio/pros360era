# EVOLUSA — Database (Phase 2)

## Status: live

EVOLUSA's Supabase project is provisioned and migrated.

- **Organization:** EVOLUSA (`eaxhsobbvufhnybrpozs`) — separate from BELONG Labs (`jdkrwvlkmwvstbufzucs`, which owns the unrelated `belong-platform` project).
- **Project:** `mauricioyepesstudio's Project InMigration`, ref `ovialqdazxkekvqqgdiu`, region `us-west-2`, plan `free`.
- This project started completely empty (a stock, just-provisioned Supabase project, verified via `list_tables`/`list_migrations`/`get_advisors` before any mutation) and was repurposed as the EVOLUSA backend rather than creating a new project, because a new free project would have exceeded Supabase's 2-active-free-projects-per-owner limit (the account already had `belong-platform` + this one).
- **Region note:** `us-west-2` (Oregon), not `us-east-1`. For a South Florida-first user base this adds roughly 60–80ms of round-trip latency versus `us-east-1` — real but not MVP-blocking. Moving regions later means creating a new project and migrating data (Supabase has no in-place region change); today, with the DB freshly seeded, is the cheapest point to ever make that move if it matters later.

## Migrations applied (in order)

1. `0001_evolusa_account_schema.sql` — `profiles`, `user_goals`, `onboarding_responses`, `roadmap_items`, `tasks`, `life_events`, `assistant_conversations`, `assistant_messages`, `updated_at` triggers, indexes.
2. `0002_evolusa_rls_policies.sql` — owner-only RLS on every table.
3. `0003_evolusa_profile_provisioning.sql` — `handle_new_user()` trigger on `auth.users` insert, auto-creates the matching `profiles` row on signup (`security definer`, tightly scoped).
4. `0004_evolusa_advisor_fixes.sql` — closes every finding from `get_advisors` after the first three migrations: pinned `search_path` on `set_updated_at`, revoked public/anon/authenticated `EXECUTE` on `handle_new_user` (it must only ever run as a trigger), rewrote every RLS policy to use `(select auth.uid())` instead of a bare `auth.uid()` call (avoids re-evaluating it per row), added the one missing FK index.

`get_advisors` (security + performance) is clean after 0004 — the only remaining findings are INFO-level "unused index" notices, expected on a database with no query traffic yet.

## Design principle

Static catalog content (stage/service/roadmap-rule copy, life-event definitions) stays in code as the single source of truth (`docs/EVOLUSA-DATA-MODEL.md`, "Integrity rules"). The database persists **per-user state** against that catalog — it does not duplicate catalog content.

## Table map (TypeScript type → table)

| TypeScript type | Table | Notes |
| --- | --- | --- |
| `UserProfile` scalar fields (`data/account/types.ts`) | `profiles` | PK is `auth.users.id` directly; auto-created on signup by the `handle_new_user` trigger |
| `UserGoal` | `user_goals` | free-form/selected goals |
| Public `OnboardingFlow`'s raw answer set + `selectedNeeds` | `onboarding_responses` | `answers` stored as untyped `jsonb` — the onboarding UI's own shape (stage/time/goal/employment/business/needs), not the separate/unused `lib/roadmap/types.ts` `RoadmapAnswers` shape; see the comment on `saveOnboardingResponse` |
| Per-user completion state against the static roadmap catalog (`lib/account/roadmap-engine.ts`) | `roadmap_items` | `catalog_item_id` matches the code-defined catalog id (e.g. `"define-priority"`) — this is also what `getCurrentProfile()` reads back into `UserProfile.completedTaskIds` |
| `Task` | `tasks` | optional `roadmap_catalog_item_id` for traceability; not currently the source of `completedTaskIds` (see above) |
| `LifeEvent` selection (`data/account/foundation.ts` catalog) | `life_events` | `catalog_event_id` matches the code-defined catalog id (e.g. `"new-job"`); insert/delete both wired from the dashboard's `LifeEvents` component |
| `AssistantPrompt`/`AssistantResponse` (`lib/assistant/service.ts`) | `assistant_conversations`, `assistant_messages` | typed foundation only — no LLM wired this phase; `guidance_label` mirrors the `OFFICIAL`/`EVOLUSA_GUIDE`/`PROFESSIONAL` trust hierarchy |

Full DDL: [`supabase/migrations/`](../supabase/migrations/) (0001–0004), kept in the repo matching exactly what was applied.

## Integrity rules carried over from the code-level data model

- One canonical record per stage/service/catalog item — in code, not duplicated into the DB.
- Every user-owned table has `user_id uuid references auth.users(id) on delete cascade` (or, for `profiles`, `id` itself is that reference).
- UUID primary keys (`gen_random_uuid()`), `created_at`/`updated_at timestamptz` on every table that needs them, maintained by a shared `set_updated_at()` trigger.
- No sensitive personal data (SSN, passport, immigration case detail, medical info, bank credentials) in any table — matches the product-level rule in `docs/EVOLUSA-MVP.md`.

## RLS

See [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md) for the verified (not just designed) posture, including a live cross-user isolation test.
