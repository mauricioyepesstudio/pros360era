-- EVOLUSA — Professional portfolio v1. PROPOSED ONLY. NOT APPLIED. Must be
-- reviewed (supabase-architect, security-reviewer) and explicitly approved
-- by the project owner before apply_migration. Never apply against BELONG.
--
-- Closes a real gap: components/professional/ProfessionalProfileView.tsx
-- has always supported a real photo and work samples, but only
-- app/profesionales/preview-mauricio/page.tsx (a temporary, undatabased
-- fixture route, marked "delete once reviewed" in its own header) ever
-- passed them. The live public profile at /profesionales/[slug] has never
-- read a photo, portfolio link, website, social links, or work samples from
-- Supabase because none of those columns existed. This migration adds them
-- as plain, owner-self-editable fields (same trust tier as headline/bio —
-- not operator-controlled like category/is_approved) plus one new table for
-- work samples.

-- ---------------------------------------------------------------------------
-- 1. New self-editable portfolio columns on professional_profiles.
-- ---------------------------------------------------------------------------
alter table public.professional_profiles
  add column photo_url text,
  add column portfolio_url text,
  add column website_url text,
  add column social_links jsonb not null default '{}'::jsonb;

comment on column public.professional_profiles.photo_url is
  'Real profile photo path/URL. Null renders the existing EVOLUSA isotype placeholder in ProfessionalProfileView — never a fabricated headshot.';
comment on column public.professional_profiles.portfolio_url is
  'Optional link to the professional''s own portfolio/case-study site.';
comment on column public.professional_profiles.website_url is
  'Optional link to the professional''s own business website, distinct from portfolio_url.';
comment on column public.professional_profiles.social_links is
  'Optional {instagram, linkedin, facebook, tiktok} URLs, all keys optional. Free-form on purpose — no per-platform column to add later per network.';

-- Same defense-in-depth pattern 0005 established: authenticated gets an
-- explicit, column-scoped UPDATE grant naming exactly these new fields —
-- category and is_approved are never in this list, on this or any future
-- grant statement.
grant update (photo_url, portfolio_url, website_url, social_links)
  on public.professional_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. professional_work_samples — one row per completed-work item a
-- professional wants to show. Owner-managed (insert/select/update/delete
-- scoped to their own professional_profiles row), same trust tier as the
-- portfolio columns above.
-- ---------------------------------------------------------------------------
create table public.professional_work_samples (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  title text not null,
  image_url text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.professional_work_samples is
  'Real completed-work samples a professional chooses to show on their public EVOLUSA profile. Owner-managed via professional_profiles.user_id = auth.uid(); never a placeholder gallery — see ProfessionalProfileView.tsx''s own workSamples doc comment.';

create index professional_work_samples_profile_id_idx on public.professional_work_samples(professional_profile_id);

alter table public.professional_work_samples enable row level security;

create policy "manage_own_work_samples" on public.professional_work_samples
  for all
  using (
    exists (
      select 1 from public.professional_profiles pp
      where pp.id = professional_work_samples.professional_profile_id
        and pp.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.professional_profiles pp
      where pp.id = professional_work_samples.professional_profile_id
        and pp.user_id = (select auth.uid())
    )
  );

revoke all on public.professional_work_samples from anon;
grant select, insert, update, delete on public.professional_work_samples to authenticated;

-- ---------------------------------------------------------------------------
-- 3. professional_profiles_public — extended with the new portfolio
-- columns. Same security boundary as 0005/0006: filtered to is_approved =
-- true, never exposes id/user_id/is_approved/anything from auth.users.
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
  pp.photo_url,
  pp.portfolio_url,
  pp.website_url,
  pp.social_links,
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
  'Safe public projection of professional_profiles, filtered to is_approved = true. Extended in 0017 with photo_url/portfolio_url/website_url/social_links — all owner-editable, none operator-only. Never expose id, user_id, is_approved, or anything from auth.users through this view.';

revoke all on public.professional_profiles_public from anon, authenticated;
grant select on public.professional_profiles_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. professional_work_samples_public — same projection pattern, joined
-- through the approved-only professional_profiles row so a sample never
-- becomes visible before its owner's profile is approved.
-- ---------------------------------------------------------------------------
create view public.professional_work_samples_public as
select
  pp.slug as professional_slug,
  pws.title,
  pws.image_url,
  pws.description,
  pws.sort_order
from public.professional_work_samples pws
join public.professional_profiles pp on pp.id = pws.professional_profile_id
where pp.is_approved = true;

comment on view public.professional_work_samples_public is
  'Safe public projection of professional_work_samples, joined through is_approved = true professional_profiles rows only. Never exposes professional_profile_id or the sample row id.';

revoke all on public.professional_work_samples_public from anon, authenticated;
grant select on public.professional_work_samples_public to anon, authenticated;
