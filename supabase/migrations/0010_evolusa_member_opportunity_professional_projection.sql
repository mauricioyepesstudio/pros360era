-- EVOLUSA Milestone 04E — member-owned professional identity projection.
-- AUTHORED, NOT APPLIED. Never apply against BELONG.
--
-- A member may already read their own opportunity row through RLS, but the
-- row contains only matched_professional_profile_id. The public professional
-- view intentionally omits its internal id, so the browser cannot safely join
-- the two. This RPC performs that join inside the database and returns only
-- the same approved/public profile fields already available anonymously.

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
  identity_verified boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
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
    ) as identity_verified
  from public.opportunities o
  join public.professional_profiles pp
    on pp.id = o.matched_professional_profile_id
  where o.member_id = (select auth.uid())
    and pp.is_approved = true;
$$;

comment on function public.get_my_opportunity_professionals() is
  'Returns the approved public identity of the professional matched to each opportunity owned by auth.uid(). It never returns the professional profile id, organic score, private profile columns, verification rows, or opportunities owned by another member.';

revoke all on function public.get_my_opportunity_professionals() from public;
revoke execute on function public.get_my_opportunity_professionals() from anon;
grant execute on function public.get_my_opportunity_professionals() to authenticated;
