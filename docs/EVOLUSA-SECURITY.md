# EVOLUSA — Security (Phase 2)

## Current posture

No secrets are committed. `.env*` is gitignored, with an explicit `!.env.example` exception so the placeholder file can be tracked while `.env.local` (which holds the real project URL and anon/publishable key) stays untracked. No service-role key appears anywhere in this repo, in `.env.local`, or in any file written this phase — grepped for `secret|api[_-]?key|service_role|SUPABASE_SERVICE` across all `.ts`/`.tsx`/`.json`, zero matches. Only `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` (the modern `sb_publishable_...` key, safe by design to expose client-side) were ever fetched or written.

## Isolation from BELONG

EVOLUSA's Supabase project (`ovialqdazxkekvqqgdiu`, org `eaxhsobbvufhnybrpozs`) is fully separate from `belong-platform` (org `jdkrwvlkmwvstbufzucs`). No migration or query in this repo has touched that project. `.claude/agents/supabase-architect.md` encodes this as a hard rule for future sessions.

## RLS: designed, applied, and verified live

Applied posture (`supabase/migrations/0002_evolusa_rls_policies.sql`, tightened in `0004`): a user can access only rows where `(select auth.uid()) = user_id` (or `= id` for `profiles`). No table has a blanket `USING (true)` policy. Ownership is never taken from a client-supplied value.

| Table | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| `profiles` | own | own | own | — (cascades from `auth.users`) |
| `user_goals` | own | own | own | own |
| `onboarding_responses` | own | own | own | — (kept as audit trail) |
| `roadmap_items` | own | own | own | own |
| `tasks` | own | own | own | own |
| `life_events` | own | own | own | own |
| `assistant_conversations` | own | own | own | own |
| `assistant_messages` | own | own | — (immutable log) | — |

**Live cross-user isolation test performed** (not just a design review): two throwaway `auth.users` rows were created directly in the live project, and with the Postgres session set to `role authenticated` and `request.jwt.claims` impersonating each user in turn:

- `SELECT * FROM profiles` as user A returned **only A's row** — B's row was invisible.
- `UPDATE profiles ... WHERE id = B` executed as user A **matched zero rows** (RLS filters the update target before it runs — no error, just no effect).
- `INSERT INTO life_events (user_id, ...) VALUES (B's id, ...)` executed as user A was **hard-rejected** with `42501: new row violates row-level security policy` — a user cannot even attribute a new row to someone else.
- User B's own `profiles.state` was confirmed unchanged (`null`) after A's attempted tamper.

Both test users, their auto-provisioned `profiles` rows, and the test `life_events` row were then deleted (`DELETE FROM auth.users` cascades everything). The project was confirmed back to 0 rows across `auth.users`, `profiles`, and `life_events` afterward — no test data left behind.

## The auto-provisioning trigger

`handle_new_user()` (from `0003`, tightened in `0004`) is `security definer` so it can insert into `profiles` from the `auth.users` insert trigger context (RLS would otherwise block it, since the inserting context isn't the new user's own session). `0004` explicitly revokes `EXECUTE` on it from `public`/`anon`/`authenticated` — it must only ever fire as a trigger, never be callable directly via PostgREST RPC. This was flagged by `get_advisors` and fixed, not left as a warning.

## Session/authorization boundary

- `proxy.ts` is the real gate for `/dashboard`, `/roadmap`, `/assistant`, `/profile` — verified live: an unauthenticated browser request to `/dashboard` was redirected to `/login?next=/dashboard` before any protected content rendered, with the real (not placeholder) login form showing.
- `lib/supabase/server.ts`'s `createSupabaseServerClient()` reads the session from cookies via `next/headers` — server code never trusts a client-passed user id.
- `lib/supabase/client.ts` (browser) only ever uses the public URL/anon key.
- Server actions in `app/(account)/actions.ts` re-derive `user.id` from the session on every call (via the persistence functions) — they never accept a user id as an argument from the client.

## What still needs a human decision

- The built-in Supabase email sender is rate-limited (confirmed live: a second signup attempt within the same session hit `over_email_send_rate_limit`) and rejects some test domains outright (`example.com` returned `email_address_invalid`). This is normal default Supabase behavior, not a bug — production signup volume will need custom SMTP configured in the Supabase Auth settings, which requires you to choose/authorize an email provider.
- Any additional rate-limiting/abuse-prevention beyond Supabase Auth's defaults is a product decision once real usage patterns exist.

## Dependency hygiene

`npm audit` is clean (0 vulnerabilities) after this phase's changes.
