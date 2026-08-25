-- EVOLUSA Milestone 03 — EVOLUSA Verified V1 (trust foundation).
-- PROPOSED ONLY. NOT APPLIED. Must be reviewed (supabase-architect,
-- security-reviewer) and explicitly approved before `apply_migration`.
-- Never apply against the BELONG project.
--
-- PRODUCT PRINCIPLE this migration encodes structurally, not just by
-- convention: "profile approved" (professional_profiles.is_approved —
-- permission to appear publicly) and "identity verified" (a real,
-- evidence-backed trust state) are different concepts and must never be
-- conflated. They live in different tables. Approving a profile does not,
-- and cannot, cause a verification row to exist — the two are wired
-- together only by a read-only derived boolean in the public view, never
-- by a shared column or a cascading write.
--
-- Scope, deliberately minimal (YAGNI):
--   - Exactly one verification_type: IDENTITY_VERIFIED. No LICENSE_VERIFIED,
--     BUSINESS_VERIFIED, INSURANCE_VERIFIED, etc. — those are future
--     migrations for when a regulated category and a real evidence process
--     exist, not speculative columns today.
--   - No document/evidence upload or storage. IDENTITY_VERIFIED V1 is
--     recorded by an authorized operator after an out-of-band identity
--     review — the row records THAT a review happened and its outcome, not
--     the evidence itself.
--   - No EXPIRED state — nothing in V1 ever produces or checks an
--     expiration; adding time-boxed verification (with a real re-review
--     process) is a later, explicit migration, not a speculative status
--     value sitting unused today.
--   - No self-view for a professional to check their own verification
--     status — see the RLS section below for why, and how they actually
--     find out.
--
-- Explicitly NOT included: LICENSE_VERIFIED and other future types,
-- evidence/credential/document tables, expiration, an admin UI, automatic
-- verification of any professional (including Daniela Torres — this
-- migration creates the capability; verifying her is a deliberate, separate,
-- owner-authorized operator action after this is applied and tested).

-- ---------------------------------------------------------------------------
-- 1. professional_verifications — one row per (professional, verification
--    type). Separate table, not a column on professional_profiles, so that
--    "approved" and "verified" can never be the same write.
-- ---------------------------------------------------------------------------
create table public.professional_verifications (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  verification_type text not null check (verification_type in ('IDENTITY_VERIFIED')),
  status text not null default 'PENDING' check (status in ('PENDING', 'VERIFIED', 'REJECTED', 'REVOKED')),
  verified_at timestamptz,
  -- Internal-only. Never selected by any public/anon-facing view, never
  -- readable by the professional themselves (see RLS below) — an operator
  -- audit trail, not evidence storage. A couple of sentences ("reviewed
  -- government-issued ID matching account name"), not a document.
  internal_notes text,
  -- The operator who made the current status what it is. Nullable because
  -- a freshly-inserted PENDING row may not have been reviewed by anyone
  -- yet. Internal-only, same as internal_notes.
  --
  -- ON DELETE SET NULL, not the implicit NO ACTION default: found during
  -- final pre-apply review. Without this, deleting ANY operator/admin
  -- auth.users row would be permanently blocked the moment they'd reviewed
  -- even one verification — the FK would restrict the delete indefinitely.
  -- SET NULL is correct because the verification record's validity (status,
  -- verified_at, internal_notes) does not depend on the reviewing account
  -- still existing; only the "who" attribution should degrade gracefully.
  -- RESTRICT (the accidental default) wrongly blocks legitimate account
  -- cleanup; CASCADE would be actively dangerous — it would silently delete
  -- the verification record itself, destroying the trust state, not just
  -- the attribution.
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One row per (professional, type) — re-verifying is an UPDATE to the
  -- existing row (with its own history implicitly visible via updated_at),
  -- not a growing list of rows for the same type.
  unique (professional_profile_id, verification_type),
  -- A row cannot claim status = VERIFIED without recording when. This does
  -- NOT force verified_at back to NULL on REVOKED — a revoked verification
  -- legitimately keeps the historical timestamp of when it was originally
  -- verified; only PENDING/REJECTED/REVOKED are permitted to have a NULL
  -- verified_at (REVOKED simply isn't required to).
  constraint verified_status_requires_verified_at
    check (status <> 'VERIFIED' or verified_at is not null)
);

comment on table public.professional_verifications is
  'Evidence-backed trust state, separate from professional_profiles.is_approved (public-visibility permission). A row existing, or even having status VERIFIED elsewhere, never implies is_approved, and vice versa — the two are connected only by a read-only derived expression in professional_profiles_public. Internal-only columns (internal_notes, reviewed_by) are never exposed publicly and are not even readable by the professional themselves — see the RLS section below.';

create trigger set_updated_at before update on public.professional_verifications
  for each row execute function public.set_updated_at();

-- No standalone index on professional_profile_id: found redundant during
-- final pre-apply review. The UNIQUE constraint above already creates a
-- composite btree index on (professional_profile_id, verification_type),
-- and Postgres can use a composite index's leftmost column(s) alone for an
-- equality lookup — the exact access pattern every query here uses (the
-- public view's EXISTS subquery filters on professional_profile_id AND
-- verification_type; a future "all verifications for this professional"
-- query would filter on professional_profile_id alone, still served by the
-- same leftmost prefix). A second single-column index would only add
-- write overhead with no read benefit at this table's scale and query
-- shape. Revisit only if a real query pattern needs an index that isn't a
-- leftmost prefix of (professional_profile_id, verification_type).

-- ---------------------------------------------------------------------------
-- 2. RLS + grants — deliberately the strictest table in this schema so far.
--
-- No professional can verify themselves, change their own status, set
-- verified_at, change verification_type, or "approve" their own evidence —
-- enforced by giving `authenticated` and `anon` ZERO privilege on this
-- table, not by a narrower owner-scoped policy like professional_profiles
-- has. There is no legitimate client-side operation on this table at all in
-- V1; only a service-role connection (the same operator path already used
-- for role/category/is_approved in 0005) can read or write it.
--
-- This also directly answers "AUTHENTICATED: cannot access internal
-- verification metadata" — a professional does not get read access to their
-- own row either, because that row contains internal_notes/reviewed_by.
-- They find out they're verified the same way the public does: the derived
-- identity_verified boolean on their own public profile. No separate
-- self-view is built for this in V1 (YAGNI) — if that becomes a real need,
-- it's a small follow-up view exposing only {verification_type, status,
-- verified_at}, not a reason to grant access to this table directly.
-- ---------------------------------------------------------------------------
revoke all on public.professional_verifications from anon, authenticated;

alter table public.professional_verifications enable row level security;
-- Deliberately no policies at all. With RLS enabled and zero policies,
-- every operation is denied by default for every role RLS evaluates
-- (anon, authenticated) — the explicit REVOKE above is defense-in-depth on
-- top of that default-deny, not the only thing preventing access.

-- ---------------------------------------------------------------------------
-- 3. professional_profiles_public — extended with ONE derived, read-only
--    column. Not a copied/stored boolean: computed fresh on every read from
--    professional_verifications, so it can never drift from the actual
--    verification state and there is no second place "verified" could be
--    set. CREATE OR REPLACE VIEW appending a column at the end of the
--    SELECT list is safe here — it doesn't change or reorder the ten
--    columns professional_profiles_public already had from 0005 (slug,
--    display_name, category, headline, bio, state, city, languages,
--    consultation_mode, is_accepting_clients), and the existing `grant
--    select ... to anon, authenticated` from 0005 already covers the new
--    column (view grants aren't per-column). After this migration the view
--    has 11 columns total: the 10 that already existed, plus
--    identity_verified trailing.
-- ---------------------------------------------------------------------------
create or replace view public.professional_profiles_public as
select
  pp.slug,
  pp.display_name,
  pp.category,
  pp.headline,
  pp.bio,
  pp.state,
  pp.city,
  pp.languages,
  pp.consultation_mode,
  pp.is_accepting_clients,
  exists (
    select 1
    from public.professional_verifications pv
    where pv.professional_profile_id = pp.id
      and pv.verification_type = 'IDENTITY_VERIFIED'
      and pv.status = 'VERIFIED'
  ) as identity_verified
from public.professional_profiles pp
where pp.is_approved = true;

comment on view public.professional_profiles_public is
  'Safe public projection of professional_profiles, filtered to is_approved = true, now including identity_verified — a derived, read-only boolean computed from professional_verifications (never a stored column). See 0005''s SECURITY BOUNDARY comment for why this view is intentionally not security_invoker; that reasoning is unchanged by this migration. reviewed_by, internal_notes, verified_at, and every other internal verification column are never exposed here.';

-- ---------------------------------------------------------------------------
-- 4. Operator verification runbook (reference only — NOT executed by this
--    migration; run manually, one professional at a time, via a service-
--    role connection, only after a real out-of-band identity review).
--
--    Step 1 — find the professional's professional_profiles.id:
--
--      select id, display_name, slug from public.professional_profiles where slug = '<slug>';
--
--    Step 2 — create the verification row, starting PENDING (do not set
--    status = 'VERIFIED' in the same statement as creation — record intent
--    to review, then record the actual outcome as its own deliberate step,
--    mirroring the two-step is_approved pattern from 0005):
--
--      insert into public.professional_verifications (professional_profile_id, verification_type, status)
--      values ('<professional_profiles.id>', 'IDENTITY_VERIFIED', 'PENDING');
--
--    Step 3 — after the operator has actually performed the out-of-band
--    identity review, record the outcome as its own statement:
--
--      update public.professional_verifications
--      set status = 'VERIFIED', verified_at = now(), reviewed_by = '<operator auth.users id>',
--          internal_notes = '<one or two sentences, never a document>'
--      where professional_profile_id = '<professional_profiles.id>' and verification_type = 'IDENTITY_VERIFIED';
--
--    (Or status = 'REJECTED' with a reason in internal_notes, if the review
--    did not pass — REJECTED is distinct from leaving it PENDING, so there
--    is a real record that a review happened and did not succeed.)
--
--    Revoking a prior verification (e.g., evidence later found fraudulent)
--    is the same UPDATE shape with status = 'REVOKED' — the row is never
--    deleted, so there is always a record that a professional WAS verified
--    and later was not, not silence.
--
--    Daniela Torres (daniela-torres-marketing) intentionally has NO row in
--    this table after this migration is applied. She remains
--    is_approved = true / identity_verified = false (the view returns
--    false for any professional with no VERIFIED row, including one with
--    no row at all) until the owner explicitly authorizes running this
--    runbook for her specifically.
-- ---------------------------------------------------------------------------
