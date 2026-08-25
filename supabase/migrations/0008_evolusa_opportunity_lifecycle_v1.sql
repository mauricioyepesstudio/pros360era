-- EVOLUSA Milestone 04B — Opportunity Lifecycle V1.
-- PROPOSED ONLY. NOT APPLIED. Must be reviewed (supabase-architect,
-- security-reviewer) and explicitly approved before `apply_migration`.
-- Never apply against the BELONG project.
--
-- Extends the Milestone 04A Opportunity Engine (0007) with the owner-
-- approved lifecycle: ROUTED -> CONTACTED -> COMPLETED, with DECLINED as an
-- alternate terminal outcome from ROUTED or CONTACTED, plus an explicit
-- expires_at boundary for MVP expiration (never a persisted EXPIRED status,
-- never written as a side effect of any read — see section 4 below).
-- See docs/EVOLUSA-OPPORTUNITY-LIFECYCLE.md for the full design.
--
-- Same hardened pattern as 0007 throughout: every mutation goes through a
-- SECURITY DEFINER function with search_path = '', explicit
-- `revoke execute ... from anon` (not just `from public` — see
-- docs/EVOLUSA-SECURITY.md's "Reusable security rule" for why both are
-- required), and `grant execute ... to authenticated` only where intended.
-- No new direct client INSERT/UPDATE grant on opportunities.

-- ---------------------------------------------------------------------------
-- 1. Schema additions — only what's necessary for the four transitions and
--    effective expiration. No persisted EXPIRED status (dropped from
--    consideration per the owner's explicit correction — the existing
--    status CHECK from 0007 already includes 'EXPIRED' for schema
--    completeness/forward-compatibility, but this migration never writes
--    it, and nothing here changes that constraint).
-- ---------------------------------------------------------------------------
alter table public.opportunities
  add column expires_at timestamptz,
  add column contacted_at timestamptz,
  add column completed_at timestamptz,
  add column declined_at timestamptz,
  add column declined_by text check (declined_by in ('MEMBER', 'PROFESSIONAL')),
  add column decline_reason text;

comment on column public.opportunities.expires_at is
  'Set once, at ROUTED time, to routed_at + 7 days — never recomputed, never extended, never written to by a read. Effective expiration is a display-time derivation (status = ROUTED AND expires_at <= now()), computed in get_my_routed_opportunities() and lib/opportunities/lifecycle.ts#getEffectiveStatus — the stored status column is never mutated to reflect it. See this migration''s own header comment and docs/EVOLUSA-OPPORTUNITY-LIFECYCLE.md.';

-- Actor-scoped decline reasons, not one shared ambiguous enum: a
-- professional and a member decline for structurally different reasons, so
-- the valid reason set depends on who declined. Enforced here as
-- defense-in-depth (decline_opportunity, below, is the primary enforcement
-- point and derives declined_by itself from auth.uid() — never a
-- client-supplied actor label) and mirrored in TypeScript
-- (data/opportunities/types.ts#declineReasonsByActor).
alter table public.opportunities
  add constraint opportunities_decline_reason_actor_check
  check (
    decline_reason is null
    or (declined_by = 'PROFESSIONAL' and decline_reason in ('AT_CAPACITY', 'OUTSIDE_SCOPE', 'UNREACHABLE', 'OTHER'))
    or (declined_by = 'MEMBER' and decline_reason in ('FOUND_HELP_ELSEWHERE', 'NO_LONGER_NEEDED', 'NOT_A_FIT', 'OTHER'))
  );

-- ---------------------------------------------------------------------------
-- 2. consent_and_route_opportunity now also sets expires_at at the exact
--    moment it sets routed_at — the only place either is ever written.
--    Everything else about this function (re-validation, the fail-closed
--    regulatory gate, the consent_receipts insert) is unchanged from 0007.
-- ---------------------------------------------------------------------------
create or replace function public.consent_and_route_opportunity(
  p_opportunity_id uuid,
  p_data_categories text[]
)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
  v_member_language text;
  v_eligible_professional_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_opportunity from public.opportunities where id = p_opportunity_id;
  if v_opportunity.id is null then
    raise exception 'opportunity not found';
  end if;

  if v_opportunity.member_id <> auth.uid() then
    raise exception 'not authorized for this opportunity';
  end if;

  if v_opportunity.status <> 'CREATED' then
    raise exception 'opportunity is not in a consentable state';
  end if;

  if v_opportunity.matched_professional_profile_id is null then
    raise exception 'opportunity has no matched professional to consent to';
  end if;

  if not (v_opportunity.professional_category = 'BUSINESS_MARKETING' and v_opportunity.state = 'FL') then
    raise exception 'no reviewed regulatory policy for this category/jurisdiction';
  end if;

  select preferred_language into v_member_language
  from public.profiles where id = v_opportunity.member_id;

  select id into v_eligible_professional_id
  from public.professional_profiles
  where id = v_opportunity.matched_professional_profile_id
    and is_approved = true
    and is_accepting_clients = true
    and category = v_opportunity.professional_category
    and state = v_opportunity.state
    and v_member_language = any(languages)
    and (
      consultation_mode = 'BOTH'
      or v_opportunity.preferred_consultation_mode = 'BOTH'
      or consultation_mode = v_opportunity.preferred_consultation_mode
    );

  if v_eligible_professional_id is null then
    raise exception 'matched professional is no longer eligible';
  end if;

  insert into public.consent_receipts (opportunity_id, member_id, professional_profile_id, purpose, data_categories, policy_version)
  values (
    v_opportunity.id,
    v_opportunity.member_id,
    v_eligible_professional_id,
    'Conectar con un profesional verificado en tu categoría',
    p_data_categories,
    'v1'
  );

  update public.opportunities
  set status = 'ROUTED', routed_at = now(), expires_at = now() + interval '7 days'
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. mark_opportunity_contacted — ROUTED -> CONTACTED. Professional only.
--    Rejects if the opportunity has already expired (expires_at <= now())
--    — a read never wrote EXPIRED, but the write path here still must not
--    let a professional confirm contact on something already past its
--    window. Rejects if status isn't exactly ROUTED (blocks double-CONTACTED
--    and contacting a DECLINED/COMPLETED opportunity).
-- ---------------------------------------------------------------------------
create or replace function public.mark_opportunity_contacted(p_opportunity_id uuid)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
  v_caller_professional_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_opportunity from public.opportunities where id = p_opportunity_id;
  if v_opportunity.id is null then
    raise exception 'opportunity not found';
  end if;

  if v_opportunity.matched_professional_profile_id is null then
    raise exception 'opportunity has no matched professional';
  end if;

  select id into v_caller_professional_id
  from public.professional_profiles
  where id = v_opportunity.matched_professional_profile_id and user_id = auth.uid();

  if v_caller_professional_id is null then
    raise exception 'not authorized for this opportunity';
  end if;

  if v_opportunity.status <> 'ROUTED' then
    raise exception 'opportunity is not in a contactable state';
  end if;

  if v_opportunity.expires_at is not null and v_opportunity.expires_at <= now() then
    raise exception 'opportunity has expired';
  end if;

  update public.opportunities
  set status = 'CONTACTED', contacted_at = now()
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

revoke all on function public.mark_opportunity_contacted(uuid) from public;
revoke execute on function public.mark_opportunity_contacted(uuid) from anon;
grant execute on function public.mark_opportunity_contacted(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. complete_opportunity — CONTACTED -> COMPLETED. Member only, by explicit
--    owner decision: whether help was actually received is the member's own
--    judgment, not something the party being rated should self-certify.
--    The professional has NO equivalent action — no
--    mark_opportunity_completed exists at all, on either side of this
--    migration, structurally (not just by omitted UI). No expiry check
--    here: once CONTACTED was legitimately reached (which itself already
--    required passing the expiry check above), completion isn't time-boxed
--    — the thing expiry protects against (no one ever responding) already
--    didn't happen.
-- ---------------------------------------------------------------------------
create or replace function public.complete_opportunity(p_opportunity_id uuid)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_opportunity from public.opportunities where id = p_opportunity_id;
  if v_opportunity.id is null then
    raise exception 'opportunity not found';
  end if;

  if v_opportunity.member_id <> auth.uid() then
    raise exception 'not authorized for this opportunity';
  end if;

  if v_opportunity.status <> 'CONTACTED' then
    raise exception 'opportunity is not in a completable state';
  end if;

  update public.opportunities
  set status = 'COMPLETED', completed_at = now()
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

revoke all on function public.complete_opportunity(uuid) from public;
revoke execute on function public.complete_opportunity(uuid) from anon;
grant execute on function public.complete_opportunity(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. decline_opportunity — ROUTED or CONTACTED -> DECLINED. Either the
--    member or the matched professional. declined_by is DERIVED from which
--    identity auth.uid() actually resolves to — never a client-supplied
--    actor label, which would let either party misrepresent who declined.
--    The actor-appropriate reason check is enforced here AND by the
--    opportunities_decline_reason_actor_check CHECK constraint above
--    (defense-in-depth, same layering as every other protected field in
--    this project) — a professional cannot use a member-only reason or
--    vice versa, checked against the resolved actor, not a claimed one.
-- ---------------------------------------------------------------------------
create or replace function public.decline_opportunity(p_opportunity_id uuid, p_reason text)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
  v_declined_by text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_opportunity from public.opportunities where id = p_opportunity_id;
  if v_opportunity.id is null then
    raise exception 'opportunity not found';
  end if;

  if v_opportunity.status not in ('ROUTED', 'CONTACTED') then
    raise exception 'opportunity is not in a declinable state';
  end if;

  if v_opportunity.member_id = auth.uid() then
    v_declined_by := 'MEMBER';
  elsif v_opportunity.matched_professional_profile_id is not null and exists (
    select 1 from public.professional_profiles
    where id = v_opportunity.matched_professional_profile_id and user_id = auth.uid()
  ) then
    v_declined_by := 'PROFESSIONAL';
  else
    raise exception 'not authorized for this opportunity';
  end if;

  if v_declined_by = 'PROFESSIONAL' and p_reason not in ('AT_CAPACITY', 'OUTSIDE_SCOPE', 'UNREACHABLE', 'OTHER') then
    raise exception 'invalid decline reason for this actor';
  end if;

  if v_declined_by = 'MEMBER' and p_reason not in ('FOUND_HELP_ELSEWHERE', 'NO_LONGER_NEEDED', 'NOT_A_FIT', 'OTHER') then
    raise exception 'invalid decline reason for this actor';
  end if;

  update public.opportunities
  set status = 'DECLINED', declined_at = now(), declined_by = v_declined_by, decline_reason = p_reason
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

revoke all on function public.decline_opportunity(uuid, text) from public;
revoke execute on function public.decline_opportunity(uuid, text) from anon;
grant execute on function public.decline_opportunity(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. get_my_routed_opportunities — widened to surface the lifecycle to the
--    professional: raw status alongside a computed effective_status (the
--    same ROUTED-past-expires_at -> 'EXPIRED' derivation as
--    lib/opportunities/lifecycle.ts#getEffectiveStatus — kept in sync by
--    hand, same lockstep note as every other duplicated-by-necessity rule
--    in this project), plus expires_at/contacted_at/completed_at/
--    declined_at/declined_by/decline_reason — all operational metadata
--    already visible to the professional via their own knowledge of the
--    opportunity, none of it personal member data, so no new consent
--    category or PII exposure is introduced. WHERE widened to include
--    DECLINED so a professional can see an opportunity the member declined
--    (they already know about it — it was routed to them).
--
--    Everything else — the consent-category-gated personal fields, the
--    auth.users.email exception, the zero-parameter enumeration-proof
--    shape — is completely unchanged from 0007.
--
--    DROP before CREATE: Postgres refuses `CREATE OR REPLACE FUNCTION` when
--    a RETURNS TABLE function's output row shape changes (error 42P13,
--    discovered live applying this migration) — unlike a plain scalar or
--    `RETURNS opportunities`-style return type, the OUT-parameter row type
--    of a table function can't be altered in place. Safe here: both
--    statements are in the same migration transaction, so there is no
--    window where the function is missing if anything below failed.
-- ---------------------------------------------------------------------------
drop function if exists public.get_my_routed_opportunities();

create function public.get_my_routed_opportunities()
returns table (
  opportunity_id uuid,
  need_id text,
  status text,
  effective_status text,
  readiness text,
  city text,
  state text,
  member_name text,
  contact_email text,
  consented_data_categories text[],
  created_at timestamptz,
  routed_at timestamptz,
  expires_at timestamptz,
  contacted_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  declined_by text,
  decline_reason text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    o.id,
    case when 'NEED_SUMMARY' = any(cr.data_categories) then o.need_id else null end,
    o.status,
    case when o.status = 'ROUTED' and o.expires_at is not null and o.expires_at <= now() then 'EXPIRED' else o.status end,
    o.readiness,
    case when 'CITY' = any(cr.data_categories) then o.city else null end,
    case when 'STATE' = any(cr.data_categories) then o.state else null end,
    case when 'NAME' = any(cr.data_categories) then p.name else null end,
    case when 'CONTACT_EMAIL' = any(cr.data_categories) then u.email else null end,
    cr.data_categories,
    o.created_at,
    o.routed_at,
    o.expires_at,
    o.contacted_at,
    o.completed_at,
    o.declined_at,
    o.declined_by,
    o.decline_reason
  from public.opportunities o
  join public.consent_receipts cr
    on cr.opportunity_id = o.id and cr.professional_profile_id = o.matched_professional_profile_id
  join public.professional_profiles pp
    on pp.id = o.matched_professional_profile_id and pp.user_id = auth.uid()
  left join public.profiles p on p.id = o.member_id
  left join auth.users u on u.id = o.member_id
  where o.status in ('ROUTED', 'CONTACTED', 'COMPLETED', 'DECLINED');
$$;

revoke all on function public.get_my_routed_opportunities() from public;
revoke execute on function public.get_my_routed_opportunities() from anon;
grant execute on function public.get_my_routed_opportunities() to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Not built in this migration, on purpose: any notification/email
--    delivery (blocked on custom SMTP being configured — see
--    docs/EVOLUSA-SECURITY.md), a persisted EXPIRED status or any
--    scheduled/cron job to write one, rematching/re-routing automation,
--    freeform notes or messages of any kind between member and
--    professional, platform_events, and any UI. Rate limiting on how often
--    these RPCs can be called remains exactly as deferred as it was in
--    0007.
-- ---------------------------------------------------------------------------
