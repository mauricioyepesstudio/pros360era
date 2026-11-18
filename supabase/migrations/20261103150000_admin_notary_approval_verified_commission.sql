-- NOTARY approval by a human ADMIN, gated on evidence.
-- A NOTARY profile becomes approvable (application flow and existing-profile flow)
-- ONLY when it has a professional_verifications row of type
-- NOTARY_COMMISSION_VERIFIED with status VERIFIED (verified_at is enforced by the
-- table's own check). This mirrors create_qualified_opportunity (0013), which
-- already refuses to route NOTARY opportunities without that verification.
-- Nothing here marks a verification VERIFIED or approves any profile by itself.

create or replace function private.notary_commission_verified(p_profile_id uuid)
returns boolean language sql stable set search_path = ''
as $fn$
  select exists (
    select 1 from public.professional_verifications pv
    where pv.professional_profile_id = p_profile_id
      and pv.verification_type = 'NOTARY_COMMISSION_VERIFIED'
      and pv.status = 'VERIFIED'
      and pv.verified_at is not null
  );
$fn$;
revoke all on function private.notary_commission_verified(uuid) from public, anon, authenticated;

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
  if v_category = 'NOTARY' then
    if not private.notary_commission_verified(v_profile_id) then
      return query select null::uuid, 'VERIFICATION_REQUIRED'::text; return;
    end if;
  elsif v_category not in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS') then
    return query select null::uuid, 'CATEGORY_NOT_ENABLED'::text; return;
  end if;
  return query select v_profile_id, 'APPROVABLE'::text;
end;
$fn$;
revoke all on function private.application_profile_approval_target(uuid) from public, anon, authenticated;

create or replace function private.admin_approve_existing_profile(p_profile_id uuid,p_expected_category text,p_reason text)
returns text language plpgsql security definer set search_path=''
as $fn$
declare v record; v_updated uuid;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN') then raise exception 'not authorized'; end if;
 if p_reason is null or length(btrim(p_reason))<12 or length(p_reason)>500 then return 'REASON_REQUIRED'; end if;
 select pp.user_id,pp.category,pp.is_approved,p.role,u.email_confirmed_at
 into v from public.professional_profiles pp join public.profiles p on p.id=pp.user_id
 join auth.users u on u.id=pp.user_id where pp.id=p_profile_id for update of pp for share of p,u;
 if not found then return 'PROFILE_NOT_FOUND'; end if;
 if v.role not in ('PROFESSIONAL','ADMIN') then return 'INELIGIBLE_ROLE'; end if;
 if v.email_confirmed_at is null then return 'UNCONFIRMED_EMAIL'; end if;
 if v.category is distinct from p_expected_category then return 'CATEGORY_MISMATCH'; end if;
 if v.category = 'NOTARY' then
   if not private.notary_commission_verified(p_profile_id) then return 'VERIFICATION_REQUIRED'; end if;
 elsif v.category not in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS','IMMIGRATION_DOCUMENT_SUPPORT') then
   return 'CATEGORY_NOT_ENABLED';
 end if;
 if v.is_approved then return 'APPROVED'; end if;
 update public.professional_profiles set is_approved=true where id=p_profile_id and not is_approved returning id into v_updated;
 if v_updated is null then return 'UPDATE_NOT_CONFIRMED'; end if;
 insert into private.professional_profile_approval_events(professional_profile_id,approved_by,category,approval_reason)
 values(v_updated,auth.uid(),v.category,btrim(p_reason));
 return 'APPROVED';
end;
$fn$;
