-- ADMIN-only approval of an existing, confirmed professional account.
-- Applicant/contact review, category and identity verification remain independent.
create schema if not exists private;

create table if not exists private.professional_profile_approval_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  professional_profile_id uuid not null,
  approved_by uuid not null,
  approved_at timestamptz not null default now(),
  category text not null
);
alter table private.professional_profile_approval_events enable row level security;
revoke all on private.professional_profile_approval_events from public, anon, authenticated;

create or replace function private.application_profile_approval_target(p_application_id uuid)
returns table (profile_id uuid, approval_state text)
language plpgsql set search_path = ''
as $fn$
declare
  a record; v_count bigint; v_user_id uuid; v_confirmed boolean;
  v_profile_id uuid; v_category text; v_approved boolean; v_role text;
begin
  select pa.email, pa.category_of_interest into a
  from public.professional_applications pa where pa.id = p_application_id;
  if not found then return query select null::uuid, 'APPLICATION_NOT_FOUND'::text; return; end if;
  select count(*), min(u.id::text)::uuid into v_count, v_user_id
  from auth.users u where lower(btrim(u.email)) = lower(btrim(a.email));
  if v_count <> 1 then
    return query select null::uuid, case when v_count=0 then 'NO_ACCOUNT' else 'AMBIGUOUS_ACCOUNT' end; return;
  end if;
  select u.email_confirmed_at is not null into v_confirmed from auth.users u where u.id=v_user_id;
  if not v_confirmed then return query select null::uuid, 'UNCONFIRMED_EMAIL'::text; return; end if;
  select pp.id, pp.category, pp.is_approved, p.role
    into v_profile_id, v_category, v_approved, v_role
  from public.professional_profiles pp join public.profiles p on p.id=pp.user_id
  where pp.user_id=v_user_id;
  if not found then return query select null::uuid, 'NO_PROFILE'::text; return; end if;
  if v_role not in ('PROFESSIONAL','ADMIN') then return query select null::uuid, 'INELIGIBLE_ROLE'::text; return; end if;
  if v_category is distinct from a.category_of_interest then
    return query select null::uuid, 'CATEGORY_MISMATCH'::text; return;
  end if;
  if v_approved then return query select v_profile_id, 'APPROVED'::text; return; end if;
  if v_category not in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS') then
    return query select null::uuid, 'CATEGORY_NOT_ENABLED'::text; return;
  end if;
  return query select v_profile_id, 'APPROVABLE'::text;
end;
$fn$;
revoke all on function private.application_profile_approval_target(uuid) from public, anon, authenticated;

create or replace function public.prevent_professional_profile_protected_field_self_change()
returns trigger language plpgsql set search_path = ''
as $fn$
begin
  if new.category is distinct from old.category
     and auth.role() is distinct from 'service_role' then
    raise exception 'category can only be changed by an authorized operator';
  end if;
  if new.is_approved is distinct from old.is_approved
     and auth.role() is distinct from 'service_role'
     and not (
       current_user = 'postgres' and exists (
         select 1 from public.profiles p where p.id=auth.uid() and p.role='ADMIN'
       )
     ) then
    raise exception 'approval can only be changed by an authorized administrator';
  end if;
  if new.category is distinct from old.category then new.is_approved := false; end if;
  return new;
end;
$fn$;

create or replace function private.admin_application_approval_states()
returns table (application_id uuid, approval_state text)
language plpgsql security definer set search_path = ''
as $fn$
begin
  if not exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='ADMIN') then
    raise exception 'not authorized';
  end if;
  return query
    select pa.id, t.approval_state from public.professional_applications pa
    cross join lateral private.application_profile_approval_target(pa.id) t;
end;
$fn$;

create or replace function private.admin_approve_application_profile(p_application_id uuid)
returns text language plpgsql security definer set search_path = ''
as $fn$
declare v_profile_id uuid; v_state text; v_category text; v_updated uuid;
begin
  if not exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='ADMIN') then
    raise exception 'not authorized';
  end if;
  perform 1 from public.professional_applications pa where pa.id=p_application_id for update;
  if not found then return 'APPLICATION_NOT_FOUND'; end if;
  select t.profile_id,t.approval_state into v_profile_id,v_state
    from private.application_profile_approval_target(p_application_id) t;
  if v_state <> 'APPROVABLE' then return v_state; end if;
  perform 1 from public.professional_profiles pp where pp.id=v_profile_id for update;
  perform 1 from auth.users u join public.professional_profiles pp on pp.user_id=u.id
    where pp.id=v_profile_id for share of u;
  select t.profile_id,t.approval_state into v_profile_id,v_state
    from private.application_profile_approval_target(p_application_id) t;
  if v_state <> 'APPROVABLE' then return v_state; end if;
  select pp.category into v_category from public.professional_profiles pp where pp.id=v_profile_id;
  update public.professional_profiles pp set is_approved=true
    where pp.id=v_profile_id and pp.category=v_category and pp.is_approved=false
    returning pp.id into v_updated;
  if v_updated is null then return 'UPDATE_NOT_CONFIRMED'; end if;
  insert into private.professional_profile_approval_events(application_id,professional_profile_id,approved_by,category)
    values(p_application_id,v_updated,auth.uid(),v_category);
  return 'APPROVED';
end;
$fn$;

-- Public PostgREST entry points are invokers; privileged work stays private.
create or replace function public.admin_application_approval_states()
returns table (application_id uuid, approval_state text)
language sql security invoker set search_path = ''
as $fn$ select * from private.admin_application_approval_states(); $fn$;

create or replace function public.admin_approve_application_profile(p_application_id uuid)
returns text language sql security invoker set search_path = ''
as $fn$ select private.admin_approve_application_profile(p_application_id); $fn$;

revoke all on function private.admin_application_approval_states() from public, anon, authenticated;
revoke all on function private.admin_approve_application_profile(uuid) from public, anon, authenticated;
revoke all on function public.admin_application_approval_states() from public, anon, authenticated;
revoke all on function public.admin_approve_application_profile(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.admin_application_approval_states() to authenticated;
grant execute on function private.admin_approve_application_profile(uuid) to authenticated;
grant execute on function public.admin_application_approval_states() to authenticated;
grant execute on function public.admin_approve_application_profile(uuid) to authenticated;
