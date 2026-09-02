-- EVOLUSA Milestone 05B -- professional_applications: a lightweight,
-- write-only intake table for the "invite a real professional to apply"
-- flow (app/aplicar-profesional). Explicitly NOT professional_profiles --
-- an application here creates zero live-matching effect, zero public
-- visibility, and zero claim that anything submitted has been verified.
-- PROPOSED ONLY. NOT APPLIED. Never apply against BELONG.
--
-- Why a separate table instead of a "draft" professional_profiles row:
-- professional_profiles.category is constrained to the categories the
-- Opportunity Engine can actually route today (BUSINESS_MARKETING,
-- BUSINESS_OPERATIONS, and NOTARY once 0013 applies) -- an applicant
-- interested in TAX or LEGAL/IMMIGRATION has nowhere safe to land in that
-- table at all, and forcing one in would either violate that CHECK
-- constraint or require picking a fake category. This table's category
-- column is intentionally NOT constrained to the live professional catalog
-- -- it's an expression of interest, not a professional_profiles row, and
-- never becomes one automatically.
--
-- Anyone (no login required, by design -- an invited professional should
-- never hit a signup wall before they've even decided to join) can INSERT
-- their own application. Nobody except a service-role connection can ever
-- SELECT, UPDATE, or DELETE a row -- not the applicant, not any other
-- authenticated user, not anon. An operator reviews submissions out of
-- band (via the Supabase SQL Editor, same as every other operator action
-- in this project) and, if and when a real credential is independently
-- verified, manually creates the actual professional_profiles row through
-- the existing runbook (0005/0013) -- this table is never read by any RPC
-- or joined into the live matching engine.

create table public.professional_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  city text,
  -- Free text, not constrained to data/professional/categories.ts's live
  -- catalog -- see header comment. The application page's own UI is what
  -- keeps the options shown to a real applicant sane (existing categories
  -- plus "Impuestos"/"Legal e Inmigración" as clearly-labeled "próximamente,
  -- regístrate igual y te contactamos").
  category_of_interest text not null,
  -- Self-reported, unverified license/commission/credential identifier --
  -- e.g. a Florida notary commission number, a CPA license number, a Bar
  -- number. Never treated as proof of anything by this table or any code
  -- that reads it; verification remains the same out-of-band, operator-run
  -- process (FL DOS lookup, Florida Bar lookup, etc.) already established
  -- for NOTARY in 0013's runbook.
  credential_info text,
  bio text,
  notes text,
  status text not null default 'PENDING' check (status in ('PENDING', 'REVIEWED', 'CONTACTED')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  constraint professional_applications_email_not_blank check (btrim(email) <> ''),
  constraint professional_applications_full_name_not_blank check (btrim(full_name) <> '')
);

comment on table public.professional_applications is
  'Public "apply to join as a professional" intake — write-only for anon/authenticated (INSERT only, no SELECT/UPDATE/DELETE), operator-reviewed out of band via service-role. Never joined into the live Opportunity Engine and never implies review, approval, or verification of anything submitted. See this migration''s header comment for the full reasoning versus a draft professional_profiles row.';

comment on column public.professional_applications.credential_info is
  'Self-reported, unverified. Never treated as proof by any code path — verification is always the existing manual operator process (see 0005/0013 runbooks) before any real professional_profiles row is ever created from an application.';

alter table public.professional_applications enable row level security;

-- Anyone may submit an application -- no account required. This is the one
-- deliberate INSERT-without-auth policy in this schema; every other table
-- requires an authenticated owner. Rate limiting is a known, accepted gap
-- for V1 (see EVOLUSA-SECURITY.md's "Known design debt" pattern) -- low
-- severity here since a spam submission costs nothing beyond an operator's
-- reviewing time, there is no email-sending or paid side effect triggered
-- by an INSERT, and status/reviewed_by/reviewed_at all default safely
-- regardless of what a submitter provides.
create policy "anyone_can_apply" on public.professional_applications
  for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policy for anon or authenticated -- default-deny,
-- same pattern as professional_verifications (0006). Nobody can read back
-- their own or anyone else's application through the client; only a
-- service-role connection (the Supabase SQL Editor, used by the operator)
-- can ever list or act on submissions.

revoke all on public.professional_applications from anon, authenticated;
grant insert (full_name, email, phone, city, category_of_interest, credential_info, bio, notes)
  on public.professional_applications to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Operator review runbook (reference only -- not executed by this migration):
--
--   List pending applications:
--     select id, created_at, full_name, email, phone, city,
--            category_of_interest, credential_info, bio, notes
--     from public.professional_applications
--     where status = 'PENDING'
--     order by created_at asc;
--
--   Mark reviewed (after reading, before or instead of acting):
--     update public.professional_applications
--     set status = 'REVIEWED', reviewed_by = '<operator auth.users id>', reviewed_at = now()
--     where id = '<application id>';
--
--   Mark contacted (after reaching out, whether or not they become a real
--   professional_profiles row):
--     update public.professional_applications set status = 'CONTACTED' where id = '<application id>';
--
--   Promoting a reviewed application to a real professional is always the
--   existing 0005/0013 runbook (signup -> role = PROFESSIONAL -> insert
--   professional_profiles -> operator review -> is_approved = true, plus
--   the credential-verification runbook for a REGULATED category) -- this
--   table is only ever a lead, never a shortcut past that process.
-- ---------------------------------------------------------------------------
