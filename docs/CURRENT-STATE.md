# EVOLUSA — Current State

Snapshot as of the Phase 2.5 end-to-end validation milestone (real Supabase project, real auth, real persistence, **verified live in a browser**, not just code-reviewed). This file is a point-in-time summary — trust `git log` and the code over this if they disagree later.

## What's real and verified

- **Public marketing site**: fully wired (`app/page.tsx`), unaffected by this phase. Verified live: loads correctly on `localhost:3002`.
- **Supabase project**: `ovialqdazxkekvqqgdiu` ("InMigration", repurposed as the EVOLUSA production backend), org `eaxhsobbvufhnybrpozs` (EVOLUSA), region `us-west-2`, free plan.
- **Schema + RLS**: 4 migrations applied (`supabase/migrations/0001`–`0004`), `get_advisors` clean (0 findings).
- **Full real user lifecycle — walked through live in a browser this phase**: signup → (email-confirmation workaround, see below) → login → complete onboarding → answers persist to the real profile/onboarding tables → dashboard reflects the persisted stage/business-status/employment via the deterministic roadmap engine → completed a real roadmap task (persisted) → added a real life event (persisted) → logged out → logged back in → **all state was still there**, verified after a full server round-trip, not just client-side cache.
- **Cross-user RLS isolation — verified twice, against real live data**: a different authenticated identity's `SELECT`/`UPDATE`/`DELETE` against the real test user's real profile/roadmap_items/life_events rows all had zero effect (RLS filtered them out silently; one cross-user `INSERT` attempt was hard-rejected with an explicit `42501` policy violation). All test data was created, exercised, and then fully deleted — the project is back to 0 rows everywhere.
- **Protected routes**: verified live — an unauthenticated request to `/dashboard` redirects to `/login?next=/dashboard` before any protected content renders.
- **Auth settings**: confirmed via Supabase's own public GoTrue `/auth/v1/settings` endpoint — `mailer_autoconfirm: false` (confirmation genuinely required), `disable_signup: false`, only the `email` provider enabled (no socials, as required).
- **Tests/CI**: `npm test` runs all 7 tests, lint/tsc/build all clean, `.github/workflows/ci.yml` gates PRs.

## What's deliberately not done yet

- **Custom SMTP** for reliable production email volume — Supabase's default mailer is rate-limited (hit twice this session) and this session's test signup required a same-database confirmation workaround rather than a real inbox click. See [EVOLUSA-AUTH-TESTING.md](./EVOLUSA-AUTH-TESTING.md) for the exact blocker and what production SMTP setup requires.
- **Wiring the assistant to a real provider** — typed foundation only, by design.
- **Onboarding → deterministic rules engine mismatch**: the public `OnboardingFlow` component collects its own answer shape and picks a result stage directly from the user's self-reported stage choice — it does not call `lib/roadmap/rules.ts`'s deterministic engine (that engine is only used by the separate, unused `lib/roadmap/generateRoadmap.ts` path). The account-side roadmap (`lib/account/roadmap-engine.ts`, used by `/dashboard` and `/roadmap`) *is* deterministic and rule-based, and this phase's live test confirmed it correctly reflects onboarding-derived profile fields (business status, employment, selected needs all showed up exactly as chosen). This pre-existing architectural split predates this phase and wasn't part of the requested scope to unify — flagging it here so it's a visible, tracked gap rather than a silent one.
- **Goals collection**: the onboarding UI doesn't currently collect `UserGoal`-shaped data, so `user_goals` stays empty until a UI is built for it.

## Key files to know

| Concern | File |
| --- | --- |
| Supabase env/client/server | `lib/supabase/{env,client,server}.ts` |
| Route protection | `proxy.ts` |
| Persistence functions | `lib/account/persistence.ts` |
| Server actions (roadmap/life-events/onboarding sync) | `app/(account)/actions.ts` |
| Real auth UI | `components/account/AuthFoundation.tsx` |
| Migrations (source of truth for what's applied) | `supabase/migrations/0001`–`0004` |

## Related docs

[EVOLUSA-DATABASE.md](./EVOLUSA-DATABASE.md) · [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md) · [EVOLUSA-ACCOUNT-ARCHITECTURE.md](./EVOLUSA-ACCOUNT-ARCHITECTURE.md) · [EVOLUSA-AUTH-TESTING.md](./EVOLUSA-AUTH-TESTING.md) · [EVOLUSA-LAUNCH-CHECKLIST.md](./EVOLUSA-LAUNCH-CHECKLIST.md) · [EVOLUSA-AI-TEAM.md](./EVOLUSA-AI-TEAM.md)
