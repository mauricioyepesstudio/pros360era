-- Classification only: no approval, credentials, matching, fees or public availability.
alter table public.professional_profiles drop constraint professional_profiles_category_check;
alter table public.professional_profiles add constraint professional_profiles_category_check
 check(category in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS','NOTARY','IMMIGRATION_DOCUMENT_SUPPORT'));
create table private.professional_category_change_events(
 id uuid primary key default gen_random_uuid(),professional_profile_id uuid not null,
 previous_category text not null,new_category text not null,changed_by uuid not null,
 reason text not null,changed_at timestamptz not null default now());
alter table private.professional_category_change_events enable row level security;
revoke all on private.professional_category_change_events from public,anon,authenticated;
create or replace function public.prevent_professional_profile_protected_field_self_change()
returns trigger language plpgsql set search_path=''
as $fn$
begin
 if new.category is distinct from old.category and auth.role() is distinct from 'service_role'
 and not(current_user='postgres' and exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN')) then
 raise exception 'category can only be changed by an authorized operator'; end if;
 if new.is_approved is distinct from old.is_approved and auth.role() is distinct from 'service_role'
 and not(current_user='postgres' and exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN')) then
 raise exception 'approval can only be changed by an authorized administrator'; end if;
 if new.category is distinct from old.category then new.is_approved:=false; end if;
 return new;
end;
$fn$;
create function private.admin_classify_document_support(p_profile_id uuid,p_expected_category text,p_reason text)
returns text language plpgsql security definer set search_path=''
as $fn$
declare v_old text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN') then raise exception 'not authorized'; end if;
 if p_reason is null or length(btrim(p_reason))<12 or length(p_reason)>500 then return 'REASON_REQUIRED'; end if;
 select category into v_old from public.professional_profiles where id=p_profile_id for update;
 if not found then return 'PROFILE_NOT_FOUND'; end if;
 if v_old is distinct from p_expected_category then return 'CATEGORY_MISMATCH'; end if;
 if v_old='IMMIGRATION_DOCUMENT_SUPPORT' then return 'UNCHANGED'; end if;
 update public.professional_profiles set category='IMMIGRATION_DOCUMENT_SUPPORT',is_approved=false,is_accepting_clients=false where id=p_profile_id;
 insert into private.professional_category_change_events(professional_profile_id,previous_category,new_category,changed_by,reason)
 values(p_profile_id,v_old,'IMMIGRATION_DOCUMENT_SUPPORT',auth.uid(),btrim(p_reason));
 return 'CLASSIFIED';
end;
$fn$;
create function public.admin_classify_document_support(p_profile_id uuid,p_expected_category text,p_reason text)
returns text language sql security invoker set search_path=''
as $fn$ select private.admin_classify_document_support(p_profile_id,p_expected_category,p_reason); $fn$;
revoke all on function private.admin_classify_document_support(uuid,text,text) from public,anon,authenticated;
revoke all on function public.admin_classify_document_support(uuid,text,text) from public,anon,authenticated;
grant execute on function private.admin_classify_document_support(uuid,text,text) to authenticated;
grant execute on function public.admin_classify_document_support(uuid,text,text) to authenticated;
