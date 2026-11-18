-- M2: Laura document support and verified Marie notary may receive consented inquiries.
-- The authorization is ALWAYS intersected with the privileged per-profile allowlist.
-- No new tables or changes to existing lead ownership/CRM privileges.
begin;
create or replace function public.submit_professional_inquiry(
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
  if not coalesce((select enabled from public.crm_inquiry_pilot_settings where id=1),false) then
    raise exception 'PILOT_DISABLED' using errcode='42501';
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

  -- Allow approved, accepting and allowlisted profiles; notary must have verified FL commission.
  -- Laura is restricted to administrative document support, without legal advice.
  select pp.id, pp.user_id into v_professional, v_owner
    from public.professional_profiles pp
    join public.profiles pr on pr.id=pp.user_id and pr.role in ('PROFESSIONAL','ADMIN')
    where pp.slug=p_professional_slug
      and pp.is_approved=true and pp.is_accepting_clients=true
      and (
        pp.category in ('BUSINESS_MARKETING','BUSINESS_OPERATIONS')
        or (pp.slug='1migration-b2bfe2' and pp.category='IMMIGRATION_DOCUMENT_SUPPORT')
        or (
          pp.slug='marie-fernandez-efff0e' and pp.category='NOTARY'
          and exists (
            select 1 from public.professional_verifications nv
            where nv.professional_profile_id=pp.id
              and nv.verification_type='NOTARY_COMMISSION_VERIFIED'
              and nv.status='VERIFIED'
          )
        )
      )
      and exists (
        select 1 from public.crm_inquiry_pilot_profiles ap
        where ap.professional_profile_id = pp.id
      );
  if not found or v_owner=v_requester then
    raise exception 'PROFESSIONAL_UNAVAILABLE' using errcode='22023';
  end if;

  -- Deduplicate accidental resubmissions even if the browser generates a
  -- different request key after reload. Serialize by requester and professional.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_requester::text || ':' || v_professional::text, 1)
  );
  select id into v_existing from public.crm_profile_inquiries
    where requester_user_id=v_requester
      and professional_profile_id=v_professional
      and lower(service)=lower(v_service)
      and summary=v_summary
      and created_at >= now()-interval '15 minutes'
    order by created_at desc limit 1;
  if found then return v_existing; end if;

  -- Conservative abuse control after identifying harmless retries.
  if (select count(*) from public.crm_profile_inquiries
      where requester_user_id=v_requester and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'RATE_LIMITED' using errcode='22023';
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

commit;
