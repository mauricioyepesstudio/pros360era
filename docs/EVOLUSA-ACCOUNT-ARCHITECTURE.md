# EVOLUSA — Account Architecture (Phase 2)

## Status: live

Real Supabase project, real auth, real persistence. See [EVOLUSA-DATABASE.md](./EVOLUSA-DATABASE.md) for the project/migration details and [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md) for the verified RLS/session boundary.

## Funnel (do not force signup early)

```
PUBLIC EVOLUSA
  → preliminary onboarding (/onboarding, no account required)
  → useful preliminary roadmap/result (shown inline, no account needed)
  → account creation (/signup)
  → progress persisted automatically on first authenticated page load
  → personalized dashboard (/dashboard)
```

`/onboarding` still works fully for anonymous visitors — the preliminary result is shown inline on the same page. Only saving/continuing progress requires an account. The "Ver dashboard preliminar" link was changed to "Ya tengo cuenta, continuar" → `/login`, since `/dashboard` is now a genuinely protected route (previously it just showed static demo data to anyone).

## Server/client boundary

- `lib/supabase/env.ts` — single place that reads `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase/client.ts` — browser client, used by `AuthFoundation` (signup/login) and `AccountShell` (logout).
- `lib/supabase/server.ts` — server client using `next/headers` cookies, used by every persistence function and by `getCurrentUser()`.
- `proxy.ts` — the authorization gate for `/dashboard`, `/roadmap`, `/assistant`, `/profile`. **Verified live**: an unauthenticated request to `/dashboard` redirects to `/login?next=/dashboard` before any protected content renders.

## Auth: real, implemented, verified reaching Supabase

`components/account/AuthFoundation.tsx` now does real `supabase.auth.signUp()` / `signInWithPassword()` calls (previously disabled inputs with a "pending configuration" placeholder — that placeholder still shows automatically if `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` are ever unset, e.g. in a fresh clone without `.env.local`).

- **Signup**: on success with an immediate session, redirects to `next` (defaults to `/dashboard`); if Supabase requires email confirmation, shows an honest "check your email" state instead of pretending signup is complete.
- **Login**: real `signInWithPassword`, redirects to `next` on success.
- **Logout**: added to `AccountShell`'s sidebar — calls `supabase.auth.signOut()`, redirects to `/`.
- **Session restoration**: handled by `@supabase/ssr`'s cookie-based session automatically on every server render.
- **Error states**: Spanish-language, pattern-matched against real Supabase Auth error messages (`translateAuthError` in `AuthFoundation.tsx`) — verified live against actual API responses (`email_address_invalid`, `over_email_send_rate_limit`), not guessed.
- **Social providers**: none enabled, as instructed.

A full end-to-end browser signup couldn't be completed in this session because Supabase's built-in (non-custom-SMTP) mailer is rate-limited and rejects `example.com`-style test addresses — this is normal free-tier Supabase behavior, not an app bug. Instead, the auth code path was verified by (a) confirming the real API request reached Supabase and returned real, correctly-parsed errors, and (b) a direct database-level RLS test with two throwaway users proving cross-user isolation (see EVOLUSA-SECURITY.md). Custom SMTP is the next step for reliable production signup volume.

## Persistence: wired into pages

`lib/account/persistence.ts` functions are now called directly from the account pages (previously written but unused):

- `getCurrentProfile()` — called from `/dashboard`, `/roadmap`, `/profile` (all three are now async Server Components; Next's build confirms they're dynamically rendered, `ƒ`, since they read the session per request). Falls back to `previewProfile` only when signed out or unconfigured.
- `saveOnboardingResponse` + `updateProfileFields`, orchestrated by `syncOnboardingAction` (`app/(account)/actions.ts`) — the public `OnboardingFlow` component writes its answers to `sessionStorage` on completion; `OnboardingSync` (mounted once in `AccountShell`) picks them up on the first authenticated page load and persists them, then clears the storage key.
- `completeRoadmapItem` via `completeRoadmapItemAction` — wired to a "Marcar como completado" button on every `now`/`upcoming` `RoadmapBoard` item (a plain form-action Server Action, no client JS required).
- `recordLifeEvent`/`removeLifeEvent` via `toggleLifeEventAction` — `LifeEvents` on the dashboard now toggles real rows instead of local-only state, with optimistic UI and rollback on failure.

One correctness fix made along the way: `getCurrentProfile()` originally derived `completedTaskIds` from the `tasks` table, but the completion button writes to `roadmap_items` — these are different tables. Fixed to read `completedTaskIds` from `roadmap_items` where `status = 'COMPLETED'`, which is what the catalog ids in `lib/account/roadmap-engine.ts` actually match against.

## Assistant architecture

Unchanged by design — no LLM provider added. `lib/assistant/service.ts`'s typed `AssistantPrompt`/`AssistantResponse` contract and the `OFFICIAL`/`EVOLUSA_GUIDE`/`PROFESSIONAL` trust hierarchy are ready to receive real profile/roadmap/task/life-event context once a provider decision is made — that decision is explicitly out of scope for this phase.
