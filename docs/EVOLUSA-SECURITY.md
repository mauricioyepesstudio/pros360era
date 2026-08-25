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

## Explicit exception: `get_my_routed_opportunities()` reads `auth.users.email`

**Standing rule, otherwise unchanged**: no public view, client query, generic RPC, professional query, analytics process, AI context assembler, or unrelated feature may read or expose `auth.users` data. This has held without exception since Milestone 01.

**Owner-approved, narrow exception** (Milestone 04A): `get_my_routed_opportunities()` (`supabase/migrations/0007_evolusa_opportunity_engine_v1.sql`) may read `auth.users.email`, and only for one purpose — returning a member's contact email to the specific professional matched to a `ROUTED` opportunity, and only when that member explicitly consented to sharing `CONTACT_EMAIL` for that exact opportunity. This is not a general relaxation; it applies to this one function only, and only while every one of these controls remains true:

1. Function is `SECURITY DEFINER`.
2. Explicit safe `search_path` (`''`) remains configured.
3. `PUBLIC` has zero `EXECUTE`.
4. `anon` has zero `EXECUTE`.
5. `authenticated` has `EXECUTE` only as intentionally granted.
6. Function accepts no member/user/professional selector parameter.
7. Professional identity comes from `auth.uid()`.
8. Professional profile is resolved from that authenticated identity.
9. Opportunity must be matched to that exact professional.
10. Opportunity must be `ROUTED` (or later).
11. A valid `consent_receipts` row must exist for that exact opportunity/professional pair.
12. `contact_email` is returned only when `CONTACT_EMAIL` exists in the consented `data_categories`.
13. `member_id` is never returned.
14. No arbitrary `auth.users` enumeration is possible (the function takes no parameters — there is no input that could widen the result set).
15. No raw `auth.users` row/object is returned — only the single derived `contact_email` field, itself conditionally null.
16. No email is copied into `opportunities` or any other table solely to avoid this controlled read — the read stays live and gated, never cached as a shortcut.

If any of these 16 controls stops being true, the exception no longer holds and the function must be re-reviewed before continuing to ship.

**Why access is required**: `auth.users.email` is the only place a member's email exists anywhere in this schema — `profiles` has no email column. A professional legitimately needs a way to reach a member who consented to share contact info; without this read, that value has no path to them at all.

**Where access occurs**: exactly one place — a `LEFT JOIN auth.users u on u.id = o.member_id` inside `get_my_routed_opportunities()`'s query body. No other function, view, trigger, or application code path in this repository reads `auth.users` for any reason.

**Why it is not exposed client-side**: no client (browser or server component) ever queries `auth.users` directly — Supabase's client libraries have no such capability for `anon`/`authenticated` regardless. The *only* client-facing surface is this one RPC, called the same way any other Supabase RPC is (`supabase.rpc("get_my_routed_opportunities")`), and it returns a single derived `contact_email` text field, conditionally null — never the `auth.users` row, never any other `auth.users` column, never a value a client could use to enumerate or infer other users' emails (see the 16 controls above, specifically 13–15).

**Required regression coverage** (live-tested at apply time; should become part of any future automated RLS/RPC test suite for this project):

- Routed opportunity + `CONTACT_EMAIL` consent → email visible.
- Routed opportunity without `CONTACT_EMAIL` consent → email null / not exposed.
- Consent recorded for a different professional → no row returned.
- Opportunity matched to a different professional → no row returned.
- Opportunity not yet `ROUTED` → no row returned.
- `anon` role → cannot execute the function at all.
- A different authenticated professional (not the matched one) → cannot obtain the email, or any row at all, for someone else's opportunity.

All seven were live-tested against throwaway fixtures during Milestone 04A's apply (see "Live verification procedure for new SECURITY DEFINER RPCs" below) and passed.

## Reusable security rule: `REVOKE ... FROM PUBLIC` is not enough for functions

**Root cause, discovered live during Milestone 04A's apply** (the second time this exact class of bug has appeared in this project — the first was `professional_profiles_public`'s grants in Milestone 01): Postgres grants `EXECUTE` on a newly created function to the `PUBLIC` pseudo-role by default. `revoke all on function ... from public` correctly strips that. But **Supabase's schema-level default privileges for the `public` schema separately grant `EXECUTE` directly to the *named* roles `anon` and `authenticated`** at creation time — a grant that exists independently of `PUBLIC` and is untouched by revoking from `PUBLIC` alone. This was confirmed live: immediately after applying `0007`, `information_schema.role_routine_grants` showed `anon` holding `EXECUTE` on all three new functions, despite each one's `revoke all on function ... from public` statement.

**The rule, for every future `SECURITY DEFINER` (or any not-`anon`-callable) function in this project**:

```sql
revoke all on function public.my_function(...) from public;
revoke execute on function public.my_function(...) from anon;   -- REQUIRED, not redundant with the line above
grant execute on function public.my_function(...) to authenticated;  -- or omit entirely if authenticated shouldn't call it either
```

Never assume `revoke ... from public` alone leaves `anon` without access — verify it live with `has_function_privilege('anon', 'public.my_function(...)', 'EXECUTE')` (expect `false`) immediately after applying, before any authorization test runs, exactly as done for `create_qualified_opportunity`, `consent_and_route_opportunity`, and `get_my_routed_opportunities` here. The same live-verification-immediately-after-apply discipline that caught the 0005 view bug is what caught this one — both times, before any real authorization test could have been silently compromised by it.

**Rule proven out, Milestone 04B**: `0008_evolusa_opportunity_lifecycle_v1.sql`'s three new functions (`mark_opportunity_contacted`, `complete_opportunity`, `decline_opportunity`) and the widened `get_my_routed_opportunities()` all included the explicit `revoke execute ... from anon` line from the start. Verified live immediately after apply via `has_function_privilege` on all four — `anon` = `false`, `authenticated` = `true` on every one, no incident this time. The rule works when actually followed.

## Live verification procedure for new SECURITY DEFINER RPCs

Since privilege/RLS assertions can't run through `npm test` (no live database connection in that suite), this is the explicit procedure to run by hand immediately after applying any migration that adds a `SECURITY DEFINER` function, using throwaway fixtures only:

1. `select has_function_privilege('anon', 'public.<fn>(<argtypes>)', 'EXECUTE')` for every new function — expect `false`.
2. `select has_function_privilege('authenticated', 'public.<fn>(<argtypes>)', 'EXECUTE')` — expect `true` only for functions actually meant to be client-callable.
3. `select grantee, privilege_type from information_schema.role_table_grants where table_name in (<new tables>)` — confirm `authenticated` has only the intended operations (usually `SELECT` only), `anon` has none.
4. Attempt the direct client operations the design forbids (raw `INSERT`/`UPDATE`/`DELETE` on the new tables as `authenticated`) — expect `42501`.
5. Impersonate two different throwaway identities and confirm cross-identity isolation (one cannot read/write/consent on behalf of the other) via `SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}'`.
6. Run `get_advisors` (security + performance) and compare against a written prediction made *before* applying — treat any unpredicted `WARN`/`ERROR` as something to explain, not just note.
7. Clean up every throwaway identity and confirm row counts return to the pre-test baseline, including on any real, pre-existing data the test incidentally touched read-only (e.g., confirm it was never written to).

## Known design debt (recorded, not solved)

**A. `Need → professional_category` mapping is duplicated** between `data/needs/catalog.ts` (TypeScript, source of design intent) and a hardcoded `case` expression inside `create_qualified_opportunity` (SQL, source of runtime authority). Both must be updated in lockstep whenever a `Need` is added. **Future single-source-of-truth strategy** (not implemented now): once a second `Need` genuinely needs a *different* professional category than `BUSINESS_MARKETING`, replace the SQL `case` with a lookup against a small, explicitly-migrated `need_professional_category_map` table — still hand-populated and reviewed like a migration, but queried instead of duplicated in two languages. Not worth building for a mapping that is currently 1:1 for both existing `Need`s.

**B. Regulatory allowlist is duplicated** between the conceptual `RegulatoryPolicy` design (`data/compliance/regulatory-policy.ts`) and the hardcoded `if not (professional_category = 'BUSINESS_MARKETING' and state = 'FL')` check independently inside both `create_qualified_opportunity` and `consent_and_route_opportunity`. **Future strategy**: once a second reviewed `(category, jurisdiction)` pair exists, replace both hardcoded checks with a lookup against a small `regulatory_policies` table (mirroring the TypeScript catalog, populated only by a reviewed migration, never admin-UI-editable) — the two SQL functions would then share one query instead of one literal condition each. Deferred deliberately: building a table-driven policy engine for exactly one policy is the premature complexity this whole design has avoided everywhere else.

**C. Resolved in Milestone 04B.** `mark_opportunity_contacted`, `complete_opportunity`, and `decline_opportunity` now write `CONTACTED`, `COMPLETED`, and `DECLINED` respectively — see [EVOLUSA-OPPORTUNITY-LIFECYCLE.md](./EVOLUSA-OPPORTUNITY-LIFECYCLE.md) for the full transition-authority table. `EXPIRED` remains deliberately never persisted (an explicit owner correction to the original 04B design, which had proposed writing it lazily from a read) — it's a derived `effective_status` only, computed the same way in both `get_my_routed_opportunities()` and `lib/opportunities/lifecycle.ts#getEffectiveStatus`. Persisting a real `EXPIRED` row remains a separate, explicit, not-yet-scoped future milestone if an operational reason for it ever arises.

## What still needs a human decision

- The built-in Supabase email sender is rate-limited (confirmed live: a second signup attempt within the same session hit `over_email_send_rate_limit`) and rejects some test domains outright (`example.com` returned `email_address_invalid`). This is normal default Supabase behavior, not a bug — production signup volume will need custom SMTP configured in the Supabase Auth settings, which requires you to choose/authorize an email provider.
- Any additional rate-limiting/abuse-prevention beyond Supabase Auth's defaults is a product decision once real usage patterns exist.

## Dependency hygiene

`npm audit` is clean (0 vulnerabilities) after this phase's changes.
