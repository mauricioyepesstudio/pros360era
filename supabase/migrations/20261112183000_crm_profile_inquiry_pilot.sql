-- M1: consented profile inquiry -> existing professional CRM.
-- REVIEW ONLY: no db push until RLS, authorization and end-to-end tests are approved.
-- Applies to current EVOLUSA CRM schema. No Resource Living data, no automatic messages.
begin;

create table public.crm_profile_inquiries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id),
  professional_user_id uuid not null references auth.users(id),
  requester_user_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  service text not null check (char_length(btrim(service)) between 3 and 120),
  summary text not null check (char_length(btrim(summary)) between 10 and 1000),
  consent_version text not null default 'EVOLUSA_DIRECT_INQUIRY_V1'
    check (consent_version = 'EVOLUSA_DIRECT_INQUIRY_V1'),
  consent_at timestamptz not null default now(),
  notification_status text not null default 'not_configured'
    check (notification_status in ('not_configured','queued','attempted','accepted','delivered','failed')),
  created_at timestamptz not null default now(),
  constraint crm_profile_inquiries_idempotency unique (requester_user_id, idempotency_key)
);

create index crm_profile_inquiries_professional_created
  on public.crm_profile_inquiries (professional_user_id, created_at desc);
create index crm_profile_inquiries_requester_created
  on public.crm_profile_inquiries (requester_user_id, created_at desc);

alter table public.crm_profile_inquiries enable row level security;
revoke all on public.crm_profile_inquiries from public, anon, authenticated;
grant select on public.crm_profile_inquiries to authenticated;
create policy crm_profile_inquiries_owner_select
  on public.crm_profile_inquiries for select to authenticated
  using (
    professional_user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('PROFESSIONAL','ADMIN')
    )
  );

-- No INSERT/UPDATE/DELETE grants. Only the narrowly scoped RPC can create a receipt.
create function public.submit_professional_inquiry(
  p_professional_slug text,
  p_idempotency_key uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_service text,
  p_summary text,
  p_consent boolean
) returns uuid
language plpgsql security definer
set search_path = ''
as $body$
declare
  v_requester uuid := auth.uid();
  v_owner uuid;
  v_professional uuid;
  v_existing uuid;
  v_lead uuid;
  v_email text := lower(btrim(coalesce(p_email,'')));
  v_name text := btrim(coalesce(p_name,''));
  v_phone text := nullif(btrim(coalesce(p_phone,'')), '');
  v_service text := btrim(coalesce(p_service,''));
  v_summary text := btrim(coalesce(p_summary,''));
begin
  if v_requester is null or
     coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'AUTH_REQUIRED' using errcode='28000';
  end if;
  if not exists (
    select 1 from public.profiles where id=v_requester and role='MEMBER'
  ) then
    raise exception 'MEMBER_REQUIRED' using errcode='42501';
  end if;
  if p_consent is distinct from true then
    raise exception 'CONSENT_REQUIRED' using errcode='22023';
  end if;
  if p_idempotency_key is null or
     p_professional_slug !~ '^[a-z0-9-]{3,80}$' or
     char_length(v_name) not between 2 and 120 or
     char_length(v_email) not between 5 and 254 or
     v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or
     (v_phone is not null and char_length(v_phone) > 50) or
     char_length(v_service) not between 3 and 120 or
     char_length(v_summary) not between 10 and 1000 then
    raise exception 'INVALID_INQUIRY' using errcode='22023';
  end if;

  -- Serialize duplicate attempts from this member across concurrent requests.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_requester::text || ':' || p_idempotency_key::text, 0)
  );
  select id into v_existing from public.crm_profile_inquiries
    where requester_user_id=v_requester and idempotency_key=p_idempotency_key;
  if found then return v_existing; end if;

  -- Conservative abuse control, regardless of client-side validation.
  if (select count(*) from public.crm_profile_inquiries
      where requester_user_id=v_requester and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'RATE_LIMITED' using errcode='22023';
  end if;

  -- Only approved, accepting, non-regulated profiles in the M1 pilot.
  select pp.id, pp.user_id into v_professional, v_owner
    from public.professional_profiles pp
    join public.profiles pr on pr.id=pp.user_id and pr.role in ('PROFESSIONAL','ADMIN')
    where pp.slug=p_professional_slug
      and pp.is_approved=true and pp.is_accepting_clients=true
      and pp.category in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS');
  if not found or v_owner=v_requester then
    raise exception 'PROFESSIONAL_UNAVAILABLE' using errcode='22023';
  end if;

  -- Serialize lead creation by (owner,email) to respect the existing unique CRM index.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_owner::text || ':' || v_email, 0)
  );
  select l.id into v_lead from public.crm_leads l
    where l.user_id=v_owner and lower(l.email)=v_email for update;
  if v_lead is null then
    insert into public.crm_leads (user_id, source, source_url, name, email, phone, status)
      values (v_owner,'website',
        'https://evolusa.us/profesionales/' || p_professional_slug,
        v_name,v_email,v_phone,'new')
      returning id into v_lead;
  end if;

  insert into public.crm_profile_inquiries
    (lead_id,professional_profile_id,professional_user_id,requester_user_id,
     idempotency_key,service,summary,consent_version)
  values
    (v_lead,v_professional,v_owner,v_requester,
     p_idempotency_key,v_service,v_summary,'EVOLUSA_DIRECT_INQUIRY_V1')
  returning id into v_existing;

  -- No automated delivery or publication. Professional reads their CRM under RLS.
  return v_existing;
end
$body$;

revoke all on function public.submit_professional_inquiry(
  text,uuid,text,text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.submit_professional_inquiry(
  text,uuid,text,text,text,text,text,boolean) to authenticated;

commit;
