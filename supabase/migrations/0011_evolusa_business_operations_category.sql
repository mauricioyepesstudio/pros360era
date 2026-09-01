-- EVOLUSA Milestone 04F -- widen the Opportunity Engine to a second
-- professional category, BUSINESS_OPERATIONS, alongside the existing
-- BUSINESS_MARKETING.
-- PROPOSED ONLY. NOT APPLIED. Must be reviewed (supabase-architect,
-- security-reviewer) and explicitly approved by the project owner before
-- apply_migration. Never apply against the BELONG project.
--
-- BUSINESS_OPERATIONS is already compliance-cleared in
-- data/compliance/claims.ts (requiresVerification: false, enabledByDefault:
-- true -- the identical tier as MARKETING). This migration does purely
-- additive schema/RPC widening to let that TypeScript-side decision actually
-- take effect end to end: no new verification workflow, no RLS change, no
-- grant change beyond re-asserting the existing explicit revoke/grant
-- pattern on the two functions this migration redefines.
--
-- Companion TypeScript-side change, already made and NOT part of this
-- migration: data/professional/types.ts, data/professional/categories.ts,
-- data/needs/catalog.ts (new CRM_SETUP need, possibleProfessionalCategories:
-- ["BUSINESS_OPERATIONS"]).
--
-- IMPORTANT CORRECTION vs. the original request for this migration: the
-- request described the fail-closed regulatory allowlist gate as appearing
-- in exactly two places -- create_qualified_opportunity (0007) and
-- consent_and_route_opportunity (0007, line ~366). In fact
-- consent_and_route_opportunity is "create or replace function"-ed a SECOND
-- time in 0008_evolusa_opportunity_lifecycle_v1.sql (section 2, to add
-- expires_at), and CREATE OR REPLACE FUNCTION entirely overwrites the prior
-- body -- so the copy of the gate actually live today is 0008's, not 0007's.
-- Widening only 0007's copy (a dead body, superseded the moment 0008 was
-- applied) would have had zero effect on production behavior. This
-- migration therefore issues a THIRD create-or-replace of
-- public.consent_and_route_opportunity, carrying forward the complete,
-- current 0008 body (lifecycle columns included) with only the gate
-- widened -- see section 4 below. 0007's and 0008's own file text are left
-- untouched (past migration files are not edited retroactively); this file
-- is the reviewable diff.
--
-- Same hardened pattern as every prior migration in this project:
--   - Every SECURITY DEFINER function keeps set search_path = '' with
--     every table reference fully schema-qualified -- never
--     public, pg_temp.
--   - Every function redefined here gets explicit
--     revoke all ... from public; revoke execute ... from anon;
--     grant execute ... to authenticated; re-asserted, even though
--     CREATE OR REPLACE (same signature, no DROP) preserves prior grants --
--     belt-and-suspenders per docs/EVOLUSA-SECURITY.md's "Reusable security
--     rule", not because this migration is expected to change them.
--   - No changes to professional_verifications, RLS policies, or any grant
--     beyond what this widening requires.

-- ---------------------------------------------------------------------------
-- 1. professional_profiles.category -- widen the CHECK constraint.
--    supabase/migrations/0005_evolusa_professional_foundation.sql:125
--    Constraint name assumed to be Postgres's default for an inline
--    "column type not null check (...)" clause on a single column
--    (<table>_<column>_check) -- this is that constraint's first and only
--    CHECK, so no name collision/suffix is expected. Verify the actual name
--    via information_schema.check_constraints before apply if there is any
--    doubt; if the name is wrong this DROP simply errors and the whole
--    migration transaction rolls back, it does not silently no-op.
-- ---------------------------------------------------------------------------
alter table public.professional_profiles
  drop constraint professional_profiles_category_check;

alter table public.professional_profiles
  add constraint professional_profiles_category_check
  check (category in ('BUSINESS_MARKETING', 'BUSINESS_OPERATIONS'));

comment on constraint professional_profiles_category_check on public.professional_profiles is
  'Widened in 0011_evolusa_business_operations_category.sql to add BUSINESS_OPERATIONS alongside the original BUSINESS_MARKETING. category remains operator-controlled (see prevent_professional_profile_protected_field_self_change() in 0005) -- a professional cannot self-reclassify into either value.';

-- ---------------------------------------------------------------------------
-- 2. opportunities.need_id / opportunities.professional_category -- widen
--    both CHECK constraints.
--    supabase/migrations/0007_evolusa_opportunity_engine_v1.sql:43 (need_id)
--    supabase/migrations/0007_evolusa_opportunity_engine_v1.sql:49
--    (professional_category)
--    Same default-naming assumption and same fail-closed-on-wrong-name
--    behavior as section 1 above.
-- ---------------------------------------------------------------------------
alter table public.opportunities
  drop constraint opportunities_need_id_check;

alter table public.opportunities
  add constraint opportunities_need_id_check
  check (need_id in ('BRANDING', 'WEBSITE', 'CRM_SETUP'));

alter table public.opportunities
  drop constraint opportunities_professional_category_check;

alter table public.opportunities
  add constraint opportunities_professional_category_check
  check (professional_category in ('BUSINESS_MARKETING', 'BUSINESS_OPERATIONS'));

comment on constraint opportunities_need_id_check on public.opportunities is
  'Widened in 0011_evolusa_business_operations_category.sql to add CRM_SETUP alongside BRANDING/WEBSITE. Must stay in lockstep with data/needs/catalog.ts and the CASE mapping in create_qualified_opportunity below.';

comment on constraint opportunities_professional_category_check on public.opportunities is
  'Widened in 0011_evolusa_business_operations_category.sql to add BUSINESS_OPERATIONS alongside BUSINESS_MARKETING. This column is never a client input -- see create_qualified_opportunity''s header comment in 0007.';

-- ---------------------------------------------------------------------------
-- 3. create_qualified_opportunity -- full body carried forward from
--    supabase/migrations/0007_evolusa_opportunity_engine_v1.sql:190-288,
--    unchanged except for the two spots this section's comments mark.
--    Signature is identical (text, text, text, text), so this is a plain
--    CREATE OR REPLACE -- no DROP, no grant reset.
-- ---------------------------------------------------------------------------
create or replace function public.create_qualified_opportunity(
  p_need_id text,
  p_city text,
  p_preferred_consultation_mode text,
  p_readiness text
)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid := auth.uid();
  v_member_state text;
  v_member_language text;
  v_professional_category text;
  v_best_professional_id uuid;
  v_best_score numeric;
  v_opportunity public.opportunities;
begin
  if v_member_id is null then
    raise exception 'not authenticated';
  end if;

  if p_preferred_consultation_mode not in ('VIRTUAL', 'IN_PERSON', 'BOTH') then
    raise exception 'invalid preferred_consultation_mode';
  end if;
  if p_readiness not in ('EXPLORING', 'CONSIDERING', 'READY_TO_ACT') then
    raise exception 'invalid readiness';
  end if;

  -- Need -> professional_category: the explicit SQL mirror of
  -- data/needs/catalog.ts's possibleProfessionalCategories.
  -- WIDENED (0011): added CRM_SETUP -> BUSINESS_OPERATIONS, the mapping
  -- already added TypeScript-side in data/needs/catalog.ts.
  v_professional_category := case p_need_id
    when 'BRANDING' then 'BUSINESS_MARKETING'
    when 'WEBSITE' then 'BUSINESS_MARKETING'
    when 'CRM_SETUP' then 'BUSINESS_OPERATIONS'
    else null
  end;
  if v_professional_category is null then
    raise exception 'unknown need_id';
  end if;

  select state, preferred_language into v_member_state, v_member_language
  from public.profiles where id = v_member_id;

  if v_member_state is null then
    raise exception 'member state unknown';
  end if;

  -- Fail-closed regulatory gate -- explicit ALLOWLIST OF (category, state)
  -- PAIRS, not a lookup against a widenable table and not a loosened
  -- "any category, FL" / "BUSINESS_OPERATIONS in any state" predicate.
  -- WIDENED (0011): added the second reviewed pair as its own explicit
  -- "or (...)" clause, each with its own review note, exactly so a third
  -- category added later is an obvious, deliberate addition to this same
  -- list -- never an accidental widening of an existing clause.
  if not (
    -- Reviewed pair 1 (Milestone 04A, 0007): BUSINESS_MARKETING is
    -- unregulated in FL per data/compliance/regulatory-policy.ts's
    -- MARKETING/FL row (regulated: false, verificationRequirement: null).
    (v_professional_category = 'BUSINESS_MARKETING' and v_member_state = 'FL')
    -- Reviewed pair 2 (this migration, 0011): BUSINESS_OPERATIONS is
    -- unregulated in FL per data/compliance/claims.ts's BUSINESS_OPERATIONS
    -- entry (requiresVerification: false, enabledByDefault: true -- the same
    -- tier as MARKETING). data/compliance/regulatory-policy.ts (the more
    -- granular per-jurisdiction TS table that lib/opportunities/
    -- eligibility.ts and lib/opportunities/match.ts read from as their
    -- design reference) has gained a matching BUSINESS_OPERATIONS/FL row
    -- with the identical shape as MARKETING/FL (regulated: false,
    -- verificationRequirement: null, no restriction lists), so the two
    -- stay honest with each other -- this SQL function remains the
    -- authoritative gate for actual routing (per 0007's own hardening-note
    -- comments); the TS table is design-reference/test coverage only.
    or (v_professional_category = 'BUSINESS_OPERATIONS' and v_member_state = 'FL')
  ) then
    raise exception 'no reviewed regulatory policy for this category/jurisdiction';
  end if;

  -- Eligibility + deterministic scoring in one query: filters to eligible
  -- candidates via the WHERE clause (category, state, language, mode,
  -- approved, accepting), then picks the single best by the same weighted
  -- terms as lib/opportunities/match.ts. Unchanged by this migration: the
  -- BUSINESS_MARKETING/FL and BUSINESS_OPERATIONS/FL policies are identical
  -- in shape (neither requires verification), so the verification bonus
  -- stays correctly omitted for both -- see this migration's header note on
  -- lib/opportunities/eligibility.ts and lib/opportunities/match.ts for the
  -- confirmation that no category-specific behavior exists in either file
  -- to account for here.
  select pp.id,
    2
    + (case when pp.city is not null and p_city is not null and pp.city = p_city then 2 else 0 end)
    + 1
  into v_best_professional_id, v_best_score
  from public.professional_profiles pp
  where pp.is_approved = true
    and pp.is_accepting_clients = true
    and pp.category = v_professional_category
    and pp.state = v_member_state
    and v_member_language = any(pp.languages)
    and (
      pp.consultation_mode = 'BOTH'
      or p_preferred_consultation_mode = 'BOTH'
      or pp.consultation_mode = p_preferred_consultation_mode
    )
  order by
    (case when pp.city is not null and p_city is not null and pp.city = p_city then 2 else 0 end) desc,
    pp.created_at asc
  limit 1;

  insert into public.opportunities (
    member_id, need_id, professional_category, state, city,
    preferred_consultation_mode, readiness, status,
    matched_professional_profile_id, organic_match_score
  ) values (
    v_member_id, p_need_id, v_professional_category, v_member_state, p_city,
    p_preferred_consultation_mode, p_readiness, 'CREATED',
    v_best_professional_id, v_best_score
  )
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

comment on function public.create_qualified_opportunity is
  'The only path that can ever create an opportunities row. Client supplies need_id/city/preferred_consultation_mode/readiness only -- professional_category, member state/language, matched_professional_profile_id, and organic_match_score are all computed here from auth.uid()-derived data, never accepted as parameters. Fails closed (raises an exception) for any (category, jurisdiction) pair not in the explicit reviewed allowlist -- BUSINESS_MARKETING/FL (0007) and, as of 0011_evolusa_business_operations_category.sql, BUSINESS_OPERATIONS/FL.';

revoke all on function public.create_qualified_opportunity(text, text, text, text) from public;
revoke execute on function public.create_qualified_opportunity(text, text, text, text) from anon;
grant execute on function public.create_qualified_opportunity(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. consent_and_route_opportunity -- full body carried forward from the
--    LIVE version, which is
--    supabase/migrations/0008_evolusa_opportunity_lifecycle_v1.sql:60-137
--    (the 0008 CREATE OR REPLACE that added expires_at superseded 0007's
--    original body entirely -- see this migration's header comment), with
--    only the fail-closed gate widened, identically to section 3 above.
--    Signature is identical (uuid, text[]), so this is a plain CREATE OR
--    REPLACE -- no DROP, no grant reset.
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

  -- Fail-closed regulatory gate, re-applied independently at the routing
  -- boundary -- not inherited from create_qualified_opportunity's check.
  -- WIDENED (0011): same explicit (category, state) pair-list, same
  -- reasoning, as section 3's copy of this gate -- kept identical
  -- deliberately, since this is meant to be a true independent
  -- re-validation of the same policy, not a divergent one.
  if not (
    -- Reviewed pair 1 (Milestone 04A, 0007).
    (v_opportunity.professional_category = 'BUSINESS_MARKETING' and v_opportunity.state = 'FL')
    -- Reviewed pair 2 (this migration, 0011). See section 3 above for the
    -- full reasoning and the regulatory-policy.ts follow-up note.
    or (v_opportunity.professional_category = 'BUSINESS_OPERATIONS' and v_opportunity.state = 'FL')
  ) then
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

comment on function public.consent_and_route_opportunity is
  'The only path that can ever create a consent_receipts row or move an opportunity to ROUTED. Re-validates every hard eligibility fact and the fail-closed regulatory allowlist against live data before writing anything -- never trusts what create_qualified_opportunity computed earlier. As of 0011_evolusa_business_operations_category.sql the allowlist covers BUSINESS_MARKETING/FL (0007) and BUSINESS_OPERATIONS/FL. Runs as the function owner (SECURITY DEFINER) specifically so it can write to consent_receipts and update opportunities.status, neither of which authenticated has any direct grant on.';

revoke all on function public.consent_and_route_opportunity(uuid, text[]) from public;
revoke execute on function public.consent_and_route_opportunity(uuid, text[]) from anon;
grant execute on function public.consent_and_route_opportunity(uuid, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Deliberately NOT touched by this migration, and why:
--
--    - professional_verifications, its RLS policies, and its grants -- this
--      widening reuses the identical no-verification-required policy shape
--      as BUSINESS_MARKETING/FL, per the explicit compliance clearance in
--      data/compliance/claims.ts. No new verification workflow needed.
--
--    - professional_profiles_public (0005) -- a plain SELECT view with no
--      CHECK constraint of its own; it already projects category for any
--      value the base table allows, so it needs no change to start showing
--      approved BUSINESS_OPERATIONS rows.
--
--    - get_my_routed_opportunities (0007/0008) and
--      get_my_opportunity_professionals (0010) -- neither filters or
--      branches on professional_category anywhere in its body; both already
--      work correctly for any category once matched_professional_profile_id
--      points at an approved row of that category.
--
--    - lib/opportunities/eligibility.ts / lib/opportunities/match.ts -- read,
--      not edited, per this migration's brief. Confirmed nothing in either
--      file is BUSINESS_MARKETING-specific: category only ever appears via
--      need.possibleProfessionalCategories.includes(professional.category)
--      (generic) and via the regulatoryPolicy lookup (generic, keyed by
--      category+jurisdiction). The verification-bonus gate in match.ts is
--      driven entirely by regulatoryPolicy.verificationRequirement, which
--      is null for BUSINESS_MARKETING/FL and, now that the companion
--      regulatory-policy.ts row exists, is also null for
--      BUSINESS_OPERATIONS/FL -- the same policy shape as MARKETING/FL,
--      as recommended, not a new one.
--
--    - Any RLS policy on opportunities, consent_receipts, or
--      professional_profiles -- unchanged; all are already category-agnostic
--      (owner-scoped by member_id/user_id, never by category).
-- ---------------------------------------------------------------------------
