-- EVOLUSA — professional self-service profile media (photo, portfolio,
-- website, social links). AUTHORED, NOT APPLIED. Review (supabase-architect,
-- security-reviewer) required before `apply_migration`. Never apply against
-- BELONG.
--
-- Product context: closes the "thin recommendation" gap named 2026-09-11 —
-- today a member routed to a professional (OpportunityProfessionalSummary,
-- get_my_opportunity_professionals) and a visitor to /profesionales/[slug]
-- (professional_profiles_public) both see only name/headline/bio/location —
-- no photo, no portfolio, no way to see the professional's own site or
-- social presence. This migration adds the four columns and widens the one
-- existing public view; it does NOT add a work-samples/portfolio-gallery
-- table — that is a materially larger feature (new table, RLS, storage for
-- images, a public projection view, moderation) and is deliberately left
-- for its own separately-reviewed migration. components/professional/
-- ProfessionalProfileView.tsx already has an unwired `workSamples` prop
-- for exactly that future addition; nothing here touches it.
--
-- Depends on 0012 (booking_url) already being applied — this migration
-- follows the exact same shape for each new column: owner-editable like
-- headline/bio (NOT operator-controlled like category/is_approved), widens
-- the same column-level UPDATE grant, and is rendered only as a plain
-- outbound link with no server-side allowlist beyond protocol (see
-- lib/opportunities/booking.ts's safeBookingHref and this repo's new
-- lib/professional/links.ts#safeHttpUrl, which follows the identical
-- http(s)-only pattern for these four fields).

-- ---------------------------------------------------------------------------
-- Section 1: new columns.
--
-- social_links is jsonb, not four more text columns — the set of platforms
-- a professional might want to link (Instagram, Facebook, LinkedIn, X, a
-- WhatsApp Business link, etc.) is exactly the kind of open-ended, growing
-- list that would otherwise mean a new migration every time a platform is
-- added. The application layer (data/professional/types.ts's
-- ProfessionalSocialLinks) defines the known keys it renders today; the
-- column itself imposes no constraint on keys beyond "is valid JSON object".
-- Never validated/allowlisted server-side beyond that — same "trust but
-- sanitize at render" posture as booking_url.
-- ---------------------------------------------------------------------------
alter table public.professional_profiles
  add column photo_url text,
  add column portfolio_url text,
  add column website_url text,
  add column social_links jsonb not null default '{}'::jsonb;

comment on column public.professional_profiles.photo_url is
  'Optional owner-set profile photo URL. Not a Supabase Storage upload in this milestone — a plain text URL, same posture as booking_url: never validated/allowlisted server-side beyond being text. Rendered with a plain <img>, never next/image, since the set of hostnames is unbounded and cannot be added to next.config.ts remotePatterns per-professional. NULL means no photo set; consumers must treat NULL as "show the EVOLUSA isotype fallback", not an error.';
comment on column public.professional_profiles.portfolio_url is
  'Optional owner-set link to an external portfolio (Behance, a personal site''s work page, etc). Same validate-at-render posture as booking_url.';
comment on column public.professional_profiles.website_url is
  'Optional owner-set business/personal website link. Same validate-at-render posture as booking_url.';
comment on column public.professional_profiles.social_links is
  'Optional owner-set map of social platform -> profile URL (e.g. {"instagram": "https://instagram.com/..."}); known keys are defined by the application layer (data/professional/types.ts), not this column. Defaults to {} (never null) so consumers can iterate Object.entries() unconditionally.';

-- Widen 0005's (then 0012's) column-level UPDATE grant. Re-issuing the full
-- list, matching 0012's own convention of always re-stating the complete
-- current allowlist rather than an incremental ALTER, so a reader of this
-- file alone can see the full grant without cross-referencing three files.
grant update (
  display_name, slug, headline, bio, state, city, languages,
  consultation_mode, is_accepting_clients, booking_url,
  photo_url, portfolio_url, website_url, social_links
) on public.professional_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Section 2: widen professional_profiles_public.
--
-- Unlike booking_url (0012, deliberately kept OFF this view — a booking
-- calendar link is only ever shown post-consent, never to an anonymous
-- directory visitor, to avoid a scrapeable-at-volume abuse surface), these
-- four fields are ordinary public marketing/trust content — the same
-- category as bio and headline, which this view already exposes publicly.
-- A photo, a portfolio link, a business site, and social profiles are
-- exactly what a public professional directory listing is expected to show;
-- there is no new privacy or abuse surface beyond what bio/headline already
-- carry (an already-approved professional publishing their own public-facing
-- links).
--
-- CREATE OR REPLACE VIEW appending columns at the end is safe here, same
-- reasoning as 0006: it doesn't reorder or remove any of the 11 existing
-- columns (slug, display_name, category, headline, bio, state, city,
-- languages, consultation_mode, is_accepting_clients, identity_verified),
-- and 0005's `grant select ... to anon, authenticated` already covers new
-- columns (view grants aren't per-column). After this migration the view has
-- 15 columns: the 11 that already existed, plus photo_url, portfolio_url,
-- website_url, social_links trailing.
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
  ) as identity_verified,
  pp.photo_url,
  pp.portfolio_url,
  pp.website_url,
  pp.social_links
from public.professional_profiles pp
where pp.is_approved = true;

comment on view public.professional_profiles_public is
  'Safe public projection of professional_profiles, filtered to is_approved = true. Extended 2026-09-11 (0015) with photo_url, portfolio_url, website_url, social_links — ordinary public marketing content, same trust tier as bio/headline which this view already exposed. booking_url remains deliberately excluded (see 0012) — that reasoning is unchanged. See 0005''s SECURITY BOUNDARY comment for why this view is intentionally not security_invoker.';

-- ---------------------------------------------------------------------------
-- Section 3: explicitly NOT touched, and why.
--
--   - booking_url / get_my_opportunity_professionals() (0012) — unaffected.
--     This migration does not widen that RPC; the member-facing enriched
--     recommendation card reads professional_profiles_public directly by
--     the slug that RPC already returns, rather than growing the RPC's own
--     column list. See lib/professional/public-profile.ts and
--     lib/opportunities/persistence.ts#getMyOpportunities for the read path.
--
--   - No new table for work samples/portfolio gallery — see this file's
--     header. A future migration, not this one.
--
--   - RLS policies on professional_profiles (select_own_professional_profile,
--     update_own_professional_profile, both from 0005) — unchanged. These
--     four columns are covered by the existing owner-scoped policies the
--     same way every other editable column already is; only the column-level
--     GRANT needed widening (Section 1).
--
--   - prevent_professional_profile_protected_field_self_change() (0005) —
--     unchanged. It only inspects category/is_approved; these four new
--     columns were never protected fields and need no trigger change.
-- ---------------------------------------------------------------------------
