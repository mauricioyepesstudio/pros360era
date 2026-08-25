-- EVOLUSA MVP Milestone 01 — account roles + professional profile foundation.
-- APPLIED to the EVOLUSA project (ovialqdazxkekvqqgdiu) and live-verified
-- via 21 impersonated authorization tests (13 negative, 8 positive) plus a
-- post-apply advisor pass. A real grant bug found live immediately after
-- applying — `revoke ... from public` on professional_profiles_public was a
-- no-op, see the corrected REVOKE below — was fixed in the same session
-- before any authorization test ran, and this file was updated to match.
-- See docs/EVOLUSA-MVP-V2.md and docs/CURRENT-STATE.md for the full live
-- test results. Never apply against the BELONG project.
--
-- Scope, deliberately minimal (YAGNI per this milestone's instructions):
--   - profiles.role: distinguishes MEMBER / PROFESSIONAL / ADMIN. Existing rows
--     backfill to 'MEMBER' automatically via the column default — no data
--     migration script needed.
--   - professional_profiles: the smallest useful professional row. No pricing,
--     no ranking, no multi-category, no reviews, no credential storage —
--     those are explicitly out of scope for this milestone.
--   - professional_profiles_public: the FIRST public/anon-readable view in this
--     schema. Every other table in this project is owner-only; this
--     establishes the "safe projection view" pattern the platform blueprint
--     (EVOLUSA-TRUST-COMPLIANCE.md) called out as new and needing its own
--     review before use.
--
-- Explicitly NOT included: verifications, match, appointments, reviews,
-- credentials, document storage, multiple categories/locations, pricing.
-- Adding any of those is a future migration, not this one.
--
-- Hardening applied this revision (pre-apply security review findings):
--   1. `category` is now operator-controlled, same as `is_approved` — a
--      professional can no longer self-reclassify. Closes the gap where a
--      future second (possibly REGULATED) category could otherwise be
--      self-assigned without re-triggering review.
--   2. Any change to `category`, even by an operator, forces `is_approved`
--      back to false — a reclassification always requires a deliberate,
--      separate re-approval step; it can never silently carry forward an
--      approval granted under a different category.
--   3. Explicit REVOKE statements added as defense-in-depth, on top of RLS
--      (RLS remains the actual, primary gate — this is belt-and-suspenders,
--      not a replacement for it).
--   4. Security-boundary reasoning for the public view expanded, including
--      an explicit note on the Supabase advisor false-positive this view is
--      expected to trigger.
--   5. An explicit, copy-pasteable operator provisioning runbook is included
--      at the end of this file (reference only — not executed by the
--      migration itself).

-- ---------------------------------------------------------------------------
-- 1. Account role — added to the existing profiles table, not a new table.
--
-- Why a column on `profiles` instead of a separate `account_roles` table:
-- `profiles` is already the canonical 1:1-with-auth.users row, already
-- auto-provisioned on signup (handle_new_user(), migration 0003). A second
-- 1:1 table for a single enum column would be a place role state could drift
-- from the profile it describes, for no benefit — the smaller, safer design
-- is one column on the table that already exists for exactly this purpose.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column role text not null default 'MEMBER'
    check (role in ('MEMBER', 'PROFESSIONAL', 'ADMIN'));

-- Existing rows: the NOT NULL DEFAULT above backfills every existing profile
-- to 'MEMBER' as part of this single ALTER TABLE statement — atomic, no
-- separate UPDATE needed, no row can be left without a role.

-- Security reasoning: `update_own_profile` (migration 0002/0004) already lets
-- the profile owner update their own row — including, once this column
-- exists, `role`, unless something else blocks it. RLS's USING/WITH CHECK is
-- a row-level predicate; it cannot express "this column is immutable except
-- for one caller" on its own. A BEFORE UPDATE trigger is the correct
-- mechanism: it inspects OLD vs. NEW and rejects the specific column change
-- unless the request is running as `service_role` (Supabase's role claim for
-- direct service-role API access), or has no authenticated/anon JWT context
-- at all (a raw superuser SQL session, e.g. the Dashboard SQL Editor — such
-- a session already has unconditional database access regardless of this
-- trigger, so this isn't a new attack surface, just a precise description of
-- what `auth.role() <> 'service_role'` actually excludes). This blocks
-- self-promotion to PROFESSIONAL or ADMIN through every client-reachable
-- path while still allowing an authorized operator to assign a role
-- manually, per this milestone's manual-provisioning procedure (see the
-- runbook at the end of this file).
create or replace function public.prevent_profile_role_self_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role can only be changed by an authorized operator';
  end if;
  return new;
end;
$$;

comment on function public.prevent_profile_role_self_change() is
  'Blocks any client-side change to profiles.role. Only a service-role connection (or a raw superuser SQL session, which already bypasses everything) may change it. See the operator runbook at the end of 0005_evolusa_professional_foundation.sql.';

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_change();

-- Column-level defense-in-depth, independent of the trigger above: strips
-- just the `role` column out of the table-wide UPDATE grant `authenticated`
-- already holds on `profiles` (from migration 0001's table creation — not
-- restructured here, only this one column is narrowed). Even if the trigger
-- had a bug, an UPDATE naming `role` in its SET clause is rejected at the
-- grant level before Postgres evaluates RLS or fires any trigger at all.
-- Every other existing profiles column keeps its normal grant untouched.
revoke update (role) on public.profiles from authenticated;

-- ---------------------------------------------------------------------------
-- 2. professional_profiles — one row per professional, minimal MVP fields.
-- ---------------------------------------------------------------------------
create table public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Category is a code catalog (data/professional/categories.ts), same
  -- pattern as ServiceCategory in data/compliance/claims.ts. Only one MVP
  -- value exists today; adding a category later means updating the catalog
  -- AND widening this check constraint in a small follow-up migration —
  -- the same cost `current_stage`'s six-value check constraint already
  -- accepts in this schema. No separate categories table for one value.
  -- Operator-controlled — see prevent_professional_profile_protected_field_self_change() below.
  category text not null check (category in ('BUSINESS_MARKETING')),
  headline text,
  bio text,
  state text,
  city text,
  languages text[] not null default '{}',
  consultation_mode text not null check (consultation_mode in ('VIRTUAL', 'IN_PERSON', 'BOTH')),
  is_accepting_clients boolean not null default false,
  -- Not in the milestone's suggested field list — added because "public
  -- profile can be enabled only after manual review" requires some approval
  -- flag to gate the public view's WHERE clause on. Operator-controlled.
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.professional_profiles is
  'One row per professional. Owner (user_id) may read/update their own row and edit any field EXCEPT category and is_approved, which are operator-controlled (see prevent_professional_profile_protected_field_self_change()). No INSERT policy exists for anon/authenticated — rows are created only by an authorized operator. Public/anonymous readers must use professional_profiles_public, never this table directly.';

create trigger set_updated_at before update on public.professional_profiles
  for each row execute function public.set_updated_at();

-- Operator-controlled fields: is_approved (public-visibility gate) AND
-- category (public-facing professional classification). Neither may be
-- changed by the profile owner — a professional editing their own bio,
-- headline, languages, consultation_mode, etc. is fine and expected;
-- flipping their own profile public, or reclassifying themselves into a
-- different (possibly future REGULATED) category, is not.
--
-- Additionally: ANY change to category — even one made by an authorized
-- operator — forces is_approved back to false. A reclassification can never
-- silently carry forward an approval that was granted for a different
-- category; it always requires a deliberate, separate re-approval step
-- afterward. This is intentional, not a bug: an operator reclassifying a
-- professional in one UPDATE that also tries to set is_approved = true will
-- see is_approved end up false regardless — the runbook at the end of this
-- file documents the required two-step sequence.
create or replace function public.prevent_professional_profile_protected_field_self_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.is_approved is distinct from old.is_approved or new.category is distinct from old.category)
     and auth.role() <> 'service_role' then
    raise exception 'category and is_approved can only be changed by an authorized operator';
  end if;

  if new.category is distinct from old.category then
    new.is_approved := false;
  end if;

  return new;
end;
$$;

comment on function public.prevent_professional_profile_protected_field_self_change() is
  'Blocks client-side changes to professional_profiles.category and .is_approved. Any category change (even by an operator) also forces is_approved back to false, requiring a deliberate separate re-approval step. See the operator runbook at the end of 0005_evolusa_professional_foundation.sql.';

create trigger protect_professional_profile_fields
  before update on public.professional_profiles
  for each row execute function public.prevent_professional_profile_protected_field_self_change();

-- ---------------------------------------------------------------------------
-- 3. RLS + explicit grants/revokes on professional_profiles.
--
-- RLS is the actual, primary gate here (as everywhere else in this schema).
-- The REVOKE below is deliberate defense-in-depth, not a replacement for
-- it: even if a future policy were mistakenly added, or RLS were briefly
-- disabled during debugging and not re-enabled, `anon`/`authenticated`
-- would still hold no table-level privilege at all on the base table unless
-- explicitly re-granted. This mirrors the same "belt and suspenders" spirit
-- as 0004's search_path pinning — cheap insurance against a future mistake,
-- not a sign the primary control is distrusted.
--
-- No insert policy for anon/authenticated at all, deliberately: this is what
-- makes self-service professional signup structurally impossible in MVP,
-- not just a missing UI. Only a service-role connection (which bypasses RLS
-- and is unaffected by the REVOKE below, which only targets anon/
-- authenticated) can create a row — matching the operator runbook at the
-- end of this file.
-- No delete policy — same convention as `profiles` (cascade from auth.users
-- only).
-- ---------------------------------------------------------------------------
-- IMPORTANT: GRANT and RLS are two separate, additive layers. GRANT decides
-- whether a role may attempt an operation on the table AT ALL; RLS policies
-- only FILTER an already-permitted operation down to specific rows — they
-- never restore a privilege that REVOKE stripped. `revoke all` here would
-- leave `authenticated` with zero privilege on this table, and the owner-
-- scoped policies below would then never even be evaluated, silently
-- breaking a professional's access to their own row. The explicit GRANTs
-- immediately below REVOKE are therefore load-bearing, not decorative.
revoke all on public.professional_profiles from anon, authenticated;

-- `anon` gets nothing restored — anonymous access is exclusively through
-- professional_profiles_public, never this table. `authenticated` gets
-- exactly SELECT (table-wide grant; RLS then filters to "own row only" via
-- the policy below) and UPDATE on ONLY the columns a professional is
-- actually allowed to edit — this is a second, independent layer of
-- protection for category/is_approved beyond the trigger above: even if the
-- trigger had a bug, an UPDATE statement naming `category` or `is_approved`
-- in its SET clause would already be rejected at the grant level, before
-- Postgres evaluates RLS or fires any trigger at all. No INSERT/DELETE
-- grant is given to `authenticated` — combined with the absence of an
-- INSERT/DELETE policy below, this makes self-service creation/deletion
-- impossible at two independent layers, not one.
grant select on public.professional_profiles to authenticated;
grant update (
  display_name, slug, headline, bio, state, city, languages,
  consultation_mode, is_accepting_clients
) on public.professional_profiles to authenticated;

alter table public.professional_profiles enable row level security;

create policy "select_own_professional_profile" on public.professional_profiles
  for select using ((select auth.uid()) = user_id);

create policy "update_own_professional_profile" on public.professional_profiles
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index professional_profiles_user_id_idx on public.professional_profiles(user_id);

-- ---------------------------------------------------------------------------
-- 4. professional_profiles_public — the safe public projection.
--
-- SECURITY BOUNDARY, stated explicitly:
--
-- This view is deliberately NOT declared `security_invoker = true`. Views
-- created without that option run with the CREATING role's privileges
-- against the underlying table (not the querying role's) — which is exactly
-- the mechanism that lets `anon`/`authenticated` read through this view at
-- all, since the base table now carries neither a public grant (revoked
-- above) nor a public RLS policy (only the two owner-scoped policies exist).
-- The view's own fixed SELECT list and `WHERE is_approved = true` clause are
-- the ENTIRE security boundary for public reads — there is no RLS on the
-- view itself (Postgres views cannot carry row-level security policies
-- directly; the underlying query IS the policy).
--
-- EXPECTED SUPABASE ADVISOR FALSE POSITIVE: `get_advisors` will very likely
-- flag this view as `security_definer_view` (a view that bypasses RLS via
-- creator privilege is exactly what that check looks for). This is
-- expected, intentional, and must be reviewed and explicitly acknowledged
-- during the post-apply advisor pass — NOT "fixed" by adding
-- `security_invoker = true`. Doing that would make the view re-evaluate RLS
-- as the querying role, which has no matching policy on the base table, so
-- anon/authenticated would see nothing through the view either — silently
-- breaking the entire public professional directory. If this finding is
-- ever "cleaned up" without reading this comment, that is the bug to look
-- for.
--
-- Column list intentionally excludes: id, user_id (internal FK to
-- auth.users — never exposed), is_approved (internal moderation flag),
-- created_at/updated_at (not requested, low value, kept internal for now).
-- Never selects anything from auth.users.
-- ---------------------------------------------------------------------------
create view public.professional_profiles_public as
select
  slug,
  display_name,
  category,
  headline,
  bio,
  state,
  city,
  languages,
  consultation_mode,
  is_accepting_clients
from public.professional_profiles
where is_approved = true;

comment on view public.professional_profiles_public is
  'Safe public projection of professional_profiles, filtered to is_approved = true. Intentionally not security_invoker — see the SECURITY BOUNDARY comment above this view''s definition in 0005_evolusa_professional_foundation.sql before changing that. Never expose id, user_id, is_approved, or anything from auth.users through this view.';

-- CORRECTED live, same session as the original apply: `revoke ... from
-- public` is a no-op here — REVOKE FROM PUBLIC only strips privileges
-- granted to the PUBLIC pseudo-role, but Supabase's schema-level default
-- privileges grant a new view's INSERT/UPDATE/DELETE/TRUNCATE/SELECT
-- directly to the NAMED roles anon/authenticated at creation time. Revoke
-- from those actual named roles instead, then re-grant exactly SELECT.
-- Verified live via information_schema.role_table_grants before and after
-- this fix — anon/authenticated held full CRUD-shaped grants on this view
-- until this correction, closed before any authorization testing began.
revoke all on public.professional_profiles_public from anon, authenticated;
grant select on public.professional_profiles_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Operator provisioning runbook (reference only — NOT executed by this
--    migration; run manually, one professional at a time, via a service-role
--    connection, after this migration has been applied and reviewed).
--
--    Step 1 — the professional already has a normal EVOLUSA account
--    (existing signup flow, unchanged) and is currently role = 'MEMBER'
--    like everyone else. Find their id:
--
--      select id, name from public.profiles where id = '<their auth.users id>';
--
--    Step 2 — assign the PROFESSIONAL role (service-role connection required
--    — this fails silently-to-error for any normal authenticated session):
--
--      update public.profiles set role = 'PROFESSIONAL' where id = '<id>';
--
--    Step 3 — create their professional profile row. is_approved defaults
--    to false; do not attempt to set it true in this same statement — the
--    row doesn't exist yet for the protected-field trigger to compare
--    against, so this INSERT itself is unaffected by that trigger (it only
--    fires on UPDATE), but treat "review before approve" as a hard rule
--    regardless:
--
--      insert into public.professional_profiles
--        (user_id, display_name, slug, category, headline, bio, state, city,
--         languages, consultation_mode, is_accepting_clients)
--      values
--        ('<id>', '<Display Name>', '<url-safe-slug>', 'BUSINESS_MARKETING',
--         '<headline>', '<bio>', '<ST>', '<City>', array['es','en'],
--         'VIRTUAL', false);
--
--    Step 4 — operator reviews the content (out of band — no admin UI yet
--    in this milestone).
--
--    Step 5 — mark it public, as its OWN separate statement:
--
--      update public.professional_profiles set is_approved = true where id = '<row id>';
--
--    Reclassifying an already-approved professional later (category
--    change) is always two statements, never one, by design (the trigger
--    forces is_approved back to false the instant category changes):
--
--      update public.professional_profiles set category = '<new category>' where id = '<row id>';
--      -- now re-review, then:
--      update public.professional_profiles set is_approved = true where id = '<row id>';
-- ---------------------------------------------------------------------------
