-- EVOLUSA — Admin dashboard v1. PROPOSED ONLY. NOT APPLIED. Must be reviewed
-- (supabase-architect, security-reviewer) and explicitly approved by the
-- project owner before apply_migration. Never apply against BELONG.
--
-- Gives an ADMIN-role account visibility into professional_applications
-- (previously readable only via the Supabase SQL Editor, per 0014's own
-- runbook) and basic operational counts, without granting any client any
-- direct table access. Same pattern as every other privileged read/write in
-- this schema: a SECURITY DEFINER function that checks the caller's own
-- profiles.role from auth.uid(), never a table grant.

-- ---------------------------------------------------------------------------
-- admin_list_professional_applications — every professional_applications
-- row, newest first. ADMIN only. professional_applications itself still has
-- zero SELECT grant for anon/authenticated (0014) -- this is the one
-- reader, and it re-checks the caller's role every call rather than trusting
-- a cached claim.
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_professional_applications()
returns table (
  id uuid,
  created_at timestamptz,
  full_name text,
  email text,
  phone text,
  city text,
  category_of_interest text,
  credential_info text,
  bio text,
  notes text,
  status text,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then
    raise exception 'not authorized';
  end if;

  return query
    select
      pa.id, pa.created_at, pa.full_name, pa.email, pa.phone, pa.city,
      pa.category_of_interest, pa.credential_info, pa.bio, pa.notes,
      pa.status, pa.reviewed_at
    from public.professional_applications pa
    order by pa.created_at desc;
end;
$$;

comment on function public.admin_list_professional_applications() is
  'Every professional_applications row, newest first. ADMIN only — re-checks profiles.role every call.';

revoke all on function public.admin_list_professional_applications() from public, anon;
grant execute on function public.admin_list_professional_applications() to authenticated;

-- ---------------------------------------------------------------------------
-- admin_update_application_status — move an application PENDING ->
-- REVIEWED -> CONTACTED (or back). ADMIN only. reviewed_by is always
-- auth.uid(), never client-supplied.
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_application_status(
  p_application_id uuid,
  p_status text
)
returns public.professional_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.professional_applications;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then
    raise exception 'not authorized';
  end if;

  if p_status not in ('PENDING', 'REVIEWED', 'CONTACTED') then
    raise exception 'invalid status';
  end if;

  update public.professional_applications
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_application_id
  returning * into v_application;

  if v_application.id is null then
    raise exception 'application not found';
  end if;

  return v_application;
end;
$$;

comment on function public.admin_update_application_status(uuid, text) is
  'Updates a professional_applications row''s status. ADMIN only; reviewed_by is always auth.uid().';

revoke all on function public.admin_update_application_status(uuid, text) from public, anon;
grant execute on function public.admin_update_application_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- admin_dashboard_stats — headline counts for the admin overview. ADMIN
-- only. Pure aggregate reads, no row-level data leaves this function beyond
-- counts.
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns table (
  total_members bigint,
  total_professionals_approved bigint,
  pending_applications bigint,
  total_opportunities bigint,
  routed_opportunities bigint,
  contacted_opportunities bigint,
  completed_opportunities bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then
    raise exception 'not authorized';
  end if;

  return query
    select
      (select count(*) from public.profiles where role = 'MEMBER'),
      (select count(*) from public.professional_profiles where is_approved = true),
      (select count(*) from public.professional_applications where status = 'PENDING'),
      (select count(*) from public.opportunities),
      (select count(*) from public.opportunities where status = 'ROUTED'),
      (select count(*) from public.opportunities where status = 'CONTACTED'),
      (select count(*) from public.opportunities where status = 'COMPLETED');
end;
$$;

comment on function public.admin_dashboard_stats() is
  'Headline counts (members, approved professionals, pending applications, opportunities by status) for the admin dashboard. ADMIN only.';

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
