-- Manual ADMIN approval of an existing document-support profile.
-- This deliberately does NOT widen auto-registration or application approval.
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
 -- The sole regulated-category exception: a human ADMIN manual approval.
 if v.category not in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS','IMMIGRATION_DOCUMENT_SUPPORT') then return 'CATEGORY_NOT_ENABLED'; end if;
 if v.is_approved then return 'APPROVED'; end if;
 update public.professional_profiles set is_approved=true where id=p_profile_id and not is_approved returning id into v_updated;
 if v_updated is null then return 'UPDATE_NOT_CONFIRMED'; end if;
 insert into private.professional_profile_approval_events(professional_profile_id,approved_by,category,approval_reason)
 values(v_updated,auth.uid(),v.category,btrim(p_reason));
 return 'APPROVED';
end;
$fn$;

-- Existing profiles can predate the application flow. This projection is ADMIN-only
-- and omits an already-linked application so it cannot duplicate that review queue.
create or replace function private.admin_list_unapplied_professional_profiles()
returns table (profile_id uuid,display_name text,email text,category text,city text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $fn$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN') then raise exception 'not authorized'; end if;
 return query
 select pp.id,pp.display_name,u.email,pp.category,pp.city,pp.created_at
 from public.professional_profiles pp
 join auth.users u on u.id=pp.user_id
 where pp.is_approved=false
   and not exists (
     select 1 from public.professional_applications pa
     where lower(btrim(pa.email))=lower(btrim(u.email))
   )
 order by pp.created_at asc,pp.id asc;
end;
$fn$;

create or replace function public.admin_list_unapplied_professional_profiles()
returns table (profile_id uuid,display_name text,email text,category text,city text,created_at timestamptz)
language sql security invoker set search_path=''
as $fn$ select * from private.admin_list_unapplied_professional_profiles(); $fn$;

revoke all on function private.admin_list_unapplied_professional_profiles() from public,anon,authenticated;
revoke all on function public.admin_list_unapplied_professional_profiles() from public,anon,authenticated;
grant execute on function private.admin_list_unapplied_professional_profiles() to authenticated;
grant execute on function public.admin_list_unapplied_professional_profiles() to authenticated;
