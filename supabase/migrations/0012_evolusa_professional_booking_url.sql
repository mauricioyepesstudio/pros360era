-- EVOLUSA — professional-owned booking link, surfaced to a member only
-- after their own consent has already routed them to that professional.
-- AUTHORED, NOT APPLIED. Never apply against BELONG. Depends on 0010
-- (get_my_opportunity_professionals, which this migration DROPs and
-- redefines) already being applied first. Apply strictly in the order 0010,
-- then 0011, then this file — 0011 has no functional interaction with this
-- migration (confirmed: it never touches get_my_opportunity_professionals
-- or professional_profiles_public) but is numerically and chronologically
-- between the two and should land first regardless, to keep the applied
-- migration history matching this repo's file order exactly.
--
-- Product context: closes the "primer impacto" gap identified 2026-09-01 —
-- today a matched member sees a professional's name/headline/location but
-- has no way to actually book the first call. This adds a single
-- owner-editable field (booking_url, e.g. a Cal.com link) to
-- professional_profiles and exposes it through the one existing RPC that
-- already reveals matched-professional identity post-consent
-- (get_my_opportunity_professionals, 0010) — never through the fully public
-- professional_profiles_public view, to avoid turning every approved
-- professional's booking calendar into something scrapeable by an
-- unauthenticated visitor browsing /profesionales.

-- ---------------------------------------------------------------------------
-- Section 1: new column. Owner-editable like headline/bio/consultation_mode
-- (NOT operator-controlled like category/is_approved) — a professional
-- setting or changing their own booking link is exactly the kind of edit
-- prevent_professional_profile_protected_field_self_change() (0005) already
-- allows; that trigger only inspects new.is_approved/new.category, so no
-- trigger change is needed here.
--
-- The trigger is NOT the only authorization gate on this table, though.
-- 0005 also grants UPDATE to `authenticated` on an explicit column list
-- (display_name, slug, headline, bio, state, city, languages,
-- consultation_mode, is_accepting_clients) — a second, independent
-- defense-in-depth layer its own comments call load-bearing: an UPDATE
-- naming a column outside that list is rejected at the grant layer before
-- RLS or the trigger even run. booking_url must be added to that grant
-- explicitly, or a professional's own UPDATE of their own row would fail
-- with "permission denied for column booking_url" even though RLS and the
-- trigger both already permit it. See the widened GRANT at the end of this
-- section.
-- ---------------------------------------------------------------------------

alter table public.professional_profiles
  add column booking_url text;

comment on column public.professional_profiles.booking_url is
  'Optional owner-set scheduling link (e.g. Cal.com) for a member to book the first call after being routed to this professional. Never validated/allowlisted server-side beyond being text — rendered as a plain outbound link, never auto-embedded, never treated as trusted content beyond that. NULL means no booking link set yet; consumers must treat NULL as "no button", not an error.';

-- Widen 0005's column-level UPDATE grant to include booking_url. Re-issuing
-- the full column list (not just the new one) makes this statement
-- idempotent and self-documenting regardless of what 0005 originally
-- granted — a reader of this file alone can see the complete, current
-- allowlist without cross-referencing 0005.
grant update (
  display_name, slug, headline, bio, state, city, languages,
  consultation_mode, is_accepting_clients, booking_url
) on public.professional_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Section 2: widen get_my_opportunity_professionals() to also return
-- booking_url. Postgres cannot CREATE OR REPLACE a RETURNS TABLE function
-- into a different row shape (42P13, the same limitation hit live during
-- 0008) — drop first, exactly like 0008 did.
-- ---------------------------------------------------------------------------

drop function if exists public.get_my_opportunity_professionals();

create or replace function public.get_my_opportunity_professionals()
returns table (
  opportunity_id uuid,
  professional_slug text,
  display_name text,
  category text,
  headline text,
  state text,
  city text,
  languages text[],
  consultation_mode text,
  is_accepting_clients boolean,
  identity_verified boolean,
  booking_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    o.id as opportunity_id,
    pp.slug as professional_slug,
    pp.display_name,
    pp.category,
    pp.headline,
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
    pp.booking_url
  from public.opportunities o
  join public.professional_profiles pp
    on pp.id = o.matched_professional_profile_id
  where o.member_id = (select auth.uid())
    and pp.is_approved = true;
$$;

comment on function public.get_my_opportunity_professionals() is
  'Returns the approved public identity of the professional matched to each opportunity owned by auth.uid(), plus that professional''s own optional booking_url. It never returns the professional profile id, organic score, private profile columns, verification rows, or opportunities owned by another member. Widened 2026-09-01 (0012) to add booking_url — same authorization boundary as 0010, no new exposure surface beyond the one added column.';

-- DROP FUNCTION removes prior grants along with the function itself — the
-- full revoke/grant triplet must be re-applied after every redefinition,
-- not just the first time. Same rule this project has followed since the
-- 0005/0007 live grant-leak bugs (see docs/EVOLUSA-SECURITY.md).
revoke all on function public.get_my_opportunity_professionals() from public;
revoke execute on function public.get_my_opportunity_professionals() from anon;
grant execute on function public.get_my_opportunity_professionals() to authenticated;

-- ---------------------------------------------------------------------------
-- Section 3: explicitly NOT touched, and why.
--
--   - professional_profiles_public (0006's view) — does not select
--     booking_url. A booking link is only ever shown to a member EVOLUSA
--     itself already matched and routed (consent already given), never to
--     an anonymous directory visitor. If a future milestone wants a public
--     "book a consult" button on /profesionales/[slug], that is a distinct,
--     separately-reviewed product decision (different spam/abuse surface —
--     anyone could hit an anonymous booking link at volume), not a side
--     effect of this migration.
--
--   - get_my_routed_opportunities() (0008, professional-facing) — a
--     professional already knows their own booking_url; no reason to
--     round-trip it back to them through this RPC.
--
--   - RLS policies on professional_profiles — unchanged (still
--     auth.uid() = user_id). Section 1's widened column-level GRANT is what
--     actually makes a professional's own booking_url edit possible once a
--     self-service edit UI exists; no UI ships in this migration (SQL-only,
--     per this project's established pattern of shipping schema ahead of UI
--     when the UI is a separately-reviewable unit of work). Until that UI
--     exists, booking_url is operator-set, same as every other field on a
--     newly onboarded professional today — the grant being live early is
--     harmless, since RLS still confines any such UPDATE to the owner's own
--     row regardless of which client eventually issues it.
-- ---------------------------------------------------------------------------
