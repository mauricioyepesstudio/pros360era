-- EVOLUSA Milestone 05A -- NOTARY, the first REGULATED professional
-- category, plus the hard verification gate a regulated category actually
-- requires.
-- PROPOSED ONLY. NOT APPLIED. Must be reviewed (supabase-architect,
-- security-reviewer) and explicitly approved by the project owner before
-- apply_migration. Never apply against the BELONG project.
--
-- ===========================================================================
-- WHY THIS MIGRATION EXISTS -- the finding that drove it
-- ===========================================================================
--
-- lib/opportunities/eligibility.ts (the TypeScript "design reference" layer)
-- DOES model a hard verification gate correctly:
--
--   if (!regulatoryPolicy) {
--     reasons.push("REGULATORY_BLOCK");
--   } else if (regulatoryPolicy.regulated && regulatoryPolicy.verificationRequirement === "IDENTITY_VERIFIED" && !professional.identityVerified) {
--     reasons.push("VERIFICATION_REQUIRED");
--   }
--
-- But that file is explicitly NOT authoritative (its own header comment says
-- so) -- the actual live matching query inside create_qualified_opportunity
-- (0007, most recently redefined by 0011) has ZERO verification check in its
-- WHERE clause. identity_verified in this whole system today is only ever a
-- SCORING BONUS (lib/opportunities/match.ts), never a hard block, at the SQL
-- layer that actually writes opportunities/consent_receipts rows. That is
-- fine for BUSINESS_MARKETING/BUSINESS_OPERATIONS (both
-- verificationRequirement: null -- genuinely no verification needed). It is
-- NOT fine for NOTARY: a notarization performed by someone without a valid,
-- current Florida notary commission can be legally void (Florida Statutes
-- Chapter 117), and impersonating a notary/authorized representative
-- ("notario fraud") is a documented fraud pattern specifically targeting the
-- Spanish-speaking immigrant community this platform serves. Getting this
-- wrong is not just a bug -- it undermines the platform's entire trust
-- premise. This migration closes that gap AT THE SQL LAYER, the one that
-- actually matters, not just in the design-reference TypeScript.
--
-- ===========================================================================
-- SCOPE
-- ===========================================================================
--
-- NOTARY only. TAX is coming next in its OWN separate, later migration --
-- deliberately not built here (see this migration's section 4 for why the
-- mechanism is already shaped to make that a trivial follow-up: one more
-- CASE branch in two places, not new plumbing).
--
-- No real notary has been verified yet and this migration verifies none --
-- it only builds the mechanism (the professional_verifications row type, the
-- category, and the hard gate). A human operator must manually confirm a
-- real notary's Florida commission (via the FL Department of State's public
-- notary lookup) and insert a professional_verifications row -- see the
-- runbook at the end of this file -- before her profile can ever pass the
-- new gate. That manual step is intentionally out of scope for this file,
-- same as 0006's identical deferral for Daniela Torres's IDENTITY_VERIFIED
-- row.
--
-- Companion TypeScript-side changes, already made and NOT part of this
-- migration (same split as 0011): data/professional/types.ts (NOTARY added
-- to professionalCategoryIds), data/professional/categories.ts (NOTARY
-- entry, group: "REGULATED"), data/professional/verification-types.ts
-- (NOTARY_COMMISSION_VERIFIED added -- see that file's header comment for
-- the full generic-vs-category-specific-type reasoning, summarized in
-- section 1 below), data/needs/catalog.ts (new NOTARIZE_DOCUMENT need,
-- gated liveInDatabase: false until this migration lands, same pattern as
-- CRM_SETUP before 0011), data/compliance/regulatory-policy.ts (new
-- NOTARY/FL row, regulated: true, verificationRequirement:
-- "NOTARY_COMMISSION_VERIFIED" -- NOT null like the two existing rows).
--
-- Same hardened pattern as every prior migration in this project:
--   - Every SECURITY DEFINER function keeps set search_path = '' with every
--     table reference fully schema-qualified -- never public, pg_temp.
--   - Every function redefined here gets explicit
--     revoke all ... from public; revoke execute ... from anon;
--     grant execute ... to authenticated; re-asserted, even though
--     CREATE OR REPLACE (same signature, no DROP) preserves prior grants --
--     belt-and-suspenders per docs/EVOLUSA-SECURITY.md's "Reusable security
--     rule", not because this migration is expected to change them.
--
-- Constraint names below assume Postgres's default naming for an inline
-- "column type not null check (...)" clause on a single column
-- (<table>_<column>_check) -- same assumption 0011 made, verified correct
-- there. Verify the actual name via information_schema.check_constraints
-- before apply if there is any doubt; if a name is wrong, the DROP simply
-- errors and the whole migration transaction rolls back -- it does not
-- silently no-op.

-- ---------------------------------------------------------------------------
-- 1. professional_verifications.verification_type -- widen the CHECK
--    constraint to add a SECOND, CATEGORY-SPECIFIC verification type:
--    NOTARY_COMMISSION_VERIFIED.
--
--    DESIGN DECISION (the one this migration's brief explicitly asked for
--    judgment on): a category-specific type (NOTARY_COMMISSION_VERIFIED),
--    NOT a generic PROFESSIONAL_LICENSE_VERIFIED bucket that a future TAX
--    credential would also use.
--
--    The generic option was the one originally suggested, and it would
--    genuinely save a small amount of future work -- TAX could reuse the
--    exact same verification_type value with no CHECK-constraint widening
--    and no new data/professional/verification-types.ts entry. But
--    verification_type is not an internal implementation detail; it is the
--    thing getVerificationDisclosure() (data/professional/
--    verification-types.ts) turns directly into the sentence a member reads
--    on a professional's public badge. A generic type forces that sentence
--    to either stay vague ("EVOLUSA verified this professional's license")
--    or silently describe two different realities under one label: a
--    Florida notary commission number checked against the FL Department of
--    State's public notary registry, versus a CPA license/EA credential/
--    PTIN checked against a state board or IRS database, are different
--    checks, against different authorities, proving different things, with
--    different "does not prove" caveats. For a platform whose stated threat
--    model here is literally people misrepresenting their authority to
--    notarize/represent, a vague or overloaded trust badge is a worse
--    failure mode than the one extra CHECK-constraint widening and catalog
--    entry a future TAX migration will need. This also matches this
--    project's own established convention everywhere else a trust-bearing
--    fact is catalogued (professional categories, needs, regulatory-policy
--    rows): explicit enumeration, never a shared generic bucket.
--
--    Critically: this decision affects ONLY the verification_type CHECK
--    constraint's allowed values and the TypeScript badge-copy catalog. It
--    does NOT add a third bespoke SQL MECHANISM for TAX -- section 4 below
--    designs the category -> required-verification-type gate as a small,
--    explicit CASE mapping specifically so that adding TAX_CREDENTIAL_
--    VERIFIED later is one more WHEN line in two places (identical shape to
--    this migration's own NOTARY addition), not new plumbing.
-- ---------------------------------------------------------------------------
alter table public.professional_verifications
  drop constraint professional_verifications_verification_type_check;

alter table public.professional_verifications
  add constraint professional_verifications_verification_type_check
  check (verification_type in ('IDENTITY_VERIFIED', 'NOTARY_COMMISSION_VERIFIED'));

comment on constraint professional_verifications_verification_type_check on public.professional_verifications is
  'Widened in 0013_evolusa_notary_regulated_category.sql to add NOTARY_COMMISSION_VERIFIED alongside the original IDENTITY_VERIFIED (0006). Deliberately category-specific, not a generic PROFESSIONAL_LICENSE_VERIFIED bucket -- see 0013 section 1 for the full reasoning. A future TAX_CREDENTIAL_VERIFIED type is expected to widen this constraint again, the same way, in its own migration.';

-- ---------------------------------------------------------------------------
-- 2. professional_profiles.category -- widen the CHECK constraint to add
--    NOTARY. Same mechanics as 0011's BUSINESS_OPERATIONS addition; category
--    remains operator-controlled (prevent_professional_profile_protected_
--    field_self_change(), 0005) -- a professional cannot self-reclassify
--    into NOTARY (or any category), and any operator reclassification still
--    forces is_approved back to false, requiring a deliberate re-approval.
-- ---------------------------------------------------------------------------
alter table public.professional_profiles
  drop constraint professional_profiles_category_check;

alter table public.professional_profiles
  add constraint professional_profiles_category_check
  check (category in ('BUSINESS_MARKETING', 'BUSINESS_OPERATIONS', 'NOTARY'));

comment on constraint professional_profiles_category_check on public.professional_profiles is
  'Widened in 0013_evolusa_notary_regulated_category.sql to add NOTARY (the first REGULATED-group category, data/professional/categories.ts) alongside BUSINESS_MARKETING/BUSINESS_OPERATIONS. category remains operator-controlled -- a professional cannot self-reclassify into any value, including NOTARY.';

-- ---------------------------------------------------------------------------
-- 3. opportunities.need_id / opportunities.professional_category -- widen
--    both CHECK constraints, same pattern as 0011.
-- ---------------------------------------------------------------------------
alter table public.opportunities
  drop constraint opportunities_need_id_check;

alter table public.opportunities
  add constraint opportunities_need_id_check
  check (need_id in ('BRANDING', 'WEBSITE', 'CRM_SETUP', 'NOTARIZE_DOCUMENT'));

alter table public.opportunities
  drop constraint opportunities_professional_category_check;

alter table public.opportunities
  add constraint opportunities_professional_category_check
  check (professional_category in ('BUSINESS_MARKETING', 'BUSINESS_OPERATIONS', 'NOTARY'));

comment on constraint opportunities_need_id_check on public.opportunities is
  'Widened in 0013_evolusa_notary_regulated_category.sql to add NOTARIZE_DOCUMENT alongside BRANDING/WEBSITE/CRM_SETUP. Must stay in lockstep with data/needs/catalog.ts and the CASE mapping in create_qualified_opportunity below.';

comment on constraint opportunities_professional_category_check on public.opportunities is
  'Widened in 0013_evolusa_notary_regulated_category.sql to add NOTARY alongside BUSINESS_MARKETING/BUSINESS_OPERATIONS. This column is never a client input -- see create_qualified_opportunity''s header comment in 0007.';

-- ---------------------------------------------------------------------------
-- 4. create_qualified_opportunity -- full body carried forward from
--    supabase/migrations/0011_evolusa_business_operations_category.sql
--    (the live version -- 0011's own header note confirms consent_and_route_
--    opportunity's live body is 0008's, not 0007's; create_qualified_
--    opportunity has no equivalent split, 0011's copy is simply the current
--    one), unchanged except for the three spots marked below. Signature is
--    identical (text, text, text, text), so this is a plain CREATE OR
--    REPLACE -- no DROP, no grant reset.
--
--    THE ACTUAL HARD GATE (this migration's real deliverable): a new
--    plpgsql variable, v_required_verification_type, computed from
--    v_professional_category via an explicit CASE -- NULL for every
--    category whose policy doesn't require verification (unaffected: NULL
--    for BUSINESS_MARKETING and BUSINESS_OPERATIONS, so their matching
--    behavior is byte-for-byte identical to before this migration), and the
--    matching verification_type string for a category that does. The
--    eligibility WHERE clause then adds exactly one more AND condition:
--    "v_required_verification_type is null OR a VERIFIED
--    professional_verifications row of that type exists for this
--    candidate." That is the SQL-level realization of the OR-condition
--    sketched in this migration's own design brief.
--
--    WHY A CASE MAPPING, NOT A LOOKUP TABLE: this project has an explicit,
--    repeatedly-stated convention (see 0011 section 5's comment, and
--    EVOLUSA-SECURITY.md's "Known design debt" B) that the regulatory
--    allowlist stays an explicit enumeration inside the reviewed SQL
--    function body, never a widenable table an admin UI or a careless
--    INSERT could silently expand. The same reasoning applies here with
--    equal force: a category's required-verification-type is exactly the
--    kind of fact that must only ever change via a reviewed migration, not
--    a runtime-editable row. A CASE expression is copy-and-extend by
--    construction -- adding TAX later is one more WHEN line, in the
--    IDENTICAL shape as the NOTARY line added here, in this exact function
--    (and its twin in consent_and_route_opportunity below) -- not a new
--    kind of change, not new plumbing, and (unlike a table) impossible to
--    widen without a migration and a diff a reviewer actually reads.
--
--    WHY THIS IS A CANDIDATE-POOL FILTER, NOT A SEPARATE RAISE EXCEPTION:
--    deliberately shaped like the existing is_approved / is_accepting_
--    clients / state / language / consultation_mode conditions already in
--    this WHERE clause, not like the allowlist's raise-exception gate above
--    it. An unreviewed (category, jurisdiction) pair must be impossible to
--    even ATTEMPT (hence: exception). An unverified NOTARY professional in
--    an otherwise-fine (category, jurisdiction) is a normal "zero eligible
--    candidates right now" outcome -- the exact same shape as "zero
--    approved BUSINESS_OPERATIONS professionals exist yet" was for CRM_SETUP
--    immediately after 0011 shipped (see 0011's needs/catalog.ts comment).
--    v_best_professional_id simply comes back NULL and the opportunity is
--    still created with matched_professional_profile_id = NULL, exactly
--    like today's "no eligible professional" case -- no new error path, no
--    new column, nothing for a future maintainer to special-case.
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
  v_required_verification_type text;
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
  -- WIDENED (0013): added NOTARIZE_DOCUMENT -> NOTARY, the mapping already
  -- added TypeScript-side in data/needs/catalog.ts.
  v_professional_category := case p_need_id
    when 'BRANDING' then 'BUSINESS_MARKETING'
    when 'WEBSITE' then 'BUSINESS_MARKETING'
    when 'CRM_SETUP' then 'BUSINESS_OPERATIONS'
    when 'NOTARIZE_DOCUMENT' then 'NOTARY'
    else null
  end;
  if v_professional_category is null then
    raise exception 'unknown need_id';
  end if;

  -- Category -> required verification_type mapping. NULL means "no
  -- professional_verifications row is required to match" -- the case for
  -- every category whose regulatory-policy.ts row has
  -- verificationRequirement: null (BUSINESS_MARKETING, BUSINESS_OPERATIONS,
  -- and every future unregulated category, via the ELSE branch below).
  -- ADDED (0013): NOTARY -> NOTARY_COMMISSION_VERIFIED, the first non-null
  -- entry. Extending to TAX later is exactly one more WHEN line here AND
  -- the identical WHEN line in consent_and_route_opportunity's copy of this
  -- same CASE below -- see this migration's section 4 header comment for
  -- why this stays a CASE, never a lookup table.
  v_required_verification_type := case v_professional_category
    when 'NOTARY' then 'NOTARY_COMMISSION_VERIFIED'
    else null
  end;

  select state, preferred_language into v_member_state, v_member_language
  from public.profiles where id = v_member_id;

  if v_member_state is null then
    raise exception 'member state unknown';
  end if;

  -- Fail-closed regulatory gate -- explicit ALLOWLIST OF (category, state)
  -- PAIRS, not a lookup against a widenable table and not a loosened
  -- "any category, FL" / "NOTARY in any state" predicate.
  -- WIDENED (0013): added the third reviewed pair as its own explicit
  -- "or (...)" clause, with its own review note, exactly so a future
  -- category (TAX) is an obvious, deliberate addition to this same list --
  -- never an accidental widening of an existing clause. Note: being on this
  -- allowlist is necessary but NOT sufficient for NOTARY -- the separate
  -- v_required_verification_type gate in the eligibility query below still
  -- has to pass independently for any specific NOTARY candidate to match.
  -- This allowlist answers "is this category/jurisdiction reviewed and
  -- routable at all"; the verification gate answers "is this SPECIFIC
  -- professional trustworthy enough to be the one routed to."
  if not (
    -- Reviewed pair 1 (Milestone 04A, 0007): BUSINESS_MARKETING is
    -- unregulated in FL per data/compliance/regulatory-policy.ts's
    -- MARKETING/FL row (regulated: false, verificationRequirement: null).
    (v_professional_category = 'BUSINESS_MARKETING' and v_member_state = 'FL')
    -- Reviewed pair 2 (0011): BUSINESS_OPERATIONS is unregulated in FL,
    -- identical shape to MARKETING/FL.
    or (v_professional_category = 'BUSINESS_OPERATIONS' and v_member_state = 'FL')
    -- Reviewed pair 3 (this migration, 0013): NOTARY is REGULATED in FL
    -- (Florida Statutes Chapter 117 -- notaries public). Per
    -- data/compliance/regulatory-policy.ts's NOTARY/FL row, regulated: true
    -- and verificationRequirement: 'NOTARY_COMMISSION_VERIFIED' -- the
    -- first row in that table with a non-null verificationRequirement. This
    -- allowlist entry permits the category/jurisdiction to be routed AT
    -- ALL; it does not by itself let any specific professional match --
    -- that additionally requires the v_required_verification_type gate
    -- below to find a VERIFIED professional_verifications row for that
    -- exact candidate.
    or (v_professional_category = 'NOTARY' and v_member_state = 'FL')
  ) then
    raise exception 'no reviewed regulatory policy for this category/jurisdiction';
  end if;

  -- Eligibility + deterministic scoring in one query: filters to eligible
  -- candidates via the WHERE clause (category, state, language, mode,
  -- approved, accepting, AND -- new in 0013 -- verification), then picks
  -- the single best by the same weighted terms as
  -- lib/opportunities/match.ts. Verification bonus intentionally still
  -- omitted from the score formula itself: for NOTARY the verification
  -- requirement is MANDATORY (enforced by the WHERE clause below), so every
  -- eligible NOTARY candidate is, by construction, already verified --
  -- there is no unverified-but-eligible NOTARY candidate for a bonus to
  -- meaningfully distinguish, unlike match.ts's OPTIONAL bonus case for a
  -- category where verification is a nice-to-have, not a gate.
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
    -- THE HARD VERIFICATION GATE (0013). NULL required type => this
    -- condition is always true, so BUSINESS_MARKETING/BUSINESS_OPERATIONS
    -- candidates are filtered by this clause exactly as before (no-op).
    -- A non-null required type => a candidate ONLY passes if a row in
    -- professional_verifications exists for THIS candidate (pp.id), of
    -- EXACTLY that verification_type, with status = 'VERIFIED' -- PENDING,
    -- REJECTED, and REVOKED rows all correctly fail this, same as no row at
    -- all. A revoked verification (e.g., fraud discovered after the fact)
    -- makes a previously-eligible NOTARY professional permanently
    -- ineligible again, with no code change required.
    and (
      v_required_verification_type is null
      or exists (
        select 1
        from public.professional_verifications pv
        where pv.professional_profile_id = pp.id
          and pv.verification_type = v_required_verification_type
          and pv.status = 'VERIFIED'
      )
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
  'The only path that can ever create an opportunities row. Client supplies need_id/city/preferred_consultation_mode/readiness only -- professional_category, member state/language, matched_professional_profile_id, and organic_match_score are all computed here from auth.uid()-derived data, never accepted as parameters. Fails closed (raises an exception) for any (category, jurisdiction) pair not in the explicit reviewed allowlist -- BUSINESS_MARKETING/FL (0007), BUSINESS_OPERATIONS/FL (0011), and, as of 0013_evolusa_notary_regulated_category.sql, NOTARY/FL. For a category whose regulatory-policy.ts row sets verificationRequirement (currently only NOTARY), a candidate additionally must have a VERIFIED professional_verifications row of the matching type to be matched at all -- an unverified professional in that category can never be routed to, not merely scored lower.';

revoke all on function public.create_qualified_opportunity(text, text, text, text) from public;
revoke execute on function public.create_qualified_opportunity(text, text, text, text) from anon;
grant execute on function public.create_qualified_opportunity(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. consent_and_route_opportunity -- full body carried forward from the
--    LIVE version, which is
--    supabase/migrations/0011_evolusa_business_operations_category.sql
--    (0011's own header note explains why: consent_and_route_opportunity
--    was CREATE OR REPLACE-d a second time in 0008 to add expires_at, and a
--    third time in 0011 to widen the allowlist -- 0011's copy is the one
--    actually live today; widening any earlier file's copy would silently
--    have zero effect, exactly the mistake 0011 itself flagged and avoided
--    for its own predecessor). This migration issues a FOURTH
--    create-or-replace, carrying 0011's complete body forward with only the
--    gate widened -- see section 4 above for the identical reasoning,
--    applied here a second time as its own independent defense-in-depth
--    layer at the routing boundary, not inherited from
--    create_qualified_opportunity's check. Signature is identical (uuid,
--    text[]), so this is a plain CREATE OR REPLACE -- no DROP, no grant
--    reset.
--
--    WHY THE VERIFICATION GATE MUST BE RE-APPLIED HERE TOO, INDEPENDENTLY:
--    this is not a redundant copy-paste. Time passes between
--    create_qualified_opportunity (match time) and consent_and_route_
--    opportunity (consent/routing time) -- an operator could REVOKE a
--    NOTARY professional's verification in that window (fraud discovered,
--    commission found lapsed, etc.). Re-checking verification status live,
--    against the actual current professional_verifications row, at the
--    exact moment consent is about to be recorded and the professional
--    revealed to the member, is precisely the kind of re-validation this
--    function's existing eligibility re-check (approved, accepting,
--    category, state, language, mode) already does for every other fact --
--    verification status gets no weaker guarantee than any of those.
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
  v_required_verification_type text;
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
  -- WIDENED (0013): same explicit (category, state) pair-list, same
  -- reasoning, as section 4's copy of this gate -- kept identical
  -- deliberately, since this is meant to be a true independent
  -- re-validation of the same policy, not a divergent one.
  if not (
    -- Reviewed pair 1 (Milestone 04A, 0007).
    (v_opportunity.professional_category = 'BUSINESS_MARKETING' and v_opportunity.state = 'FL')
    -- Reviewed pair 2 (0011).
    or (v_opportunity.professional_category = 'BUSINESS_OPERATIONS' and v_opportunity.state = 'FL')
    -- Reviewed pair 3 (this migration, 0013). See section 4 above for the
    -- full reasoning.
    or (v_opportunity.professional_category = 'NOTARY' and v_opportunity.state = 'FL')
  ) then
    raise exception 'no reviewed regulatory policy for this category/jurisdiction';
  end if;

  -- Category -> required verification_type mapping, identical shape and
  -- identical values to the copy inside create_qualified_opportunity above
  -- -- computed from v_opportunity.professional_category (the value stored
  -- at match time), not re-derived from need_id, matching this function's
  -- existing convention for every other re-validated field.
  v_required_verification_type := case v_opportunity.professional_category
    when 'NOTARY' then 'NOTARY_COMMISSION_VERIFIED'
    else null
  end;

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
    )
    -- THE HARD VERIFICATION GATE, re-applied at routing time (0013). Same
    -- semantics as section 4's copy: NULL required type is a no-op for
    -- BUSINESS_MARKETING/BUSINESS_OPERATIONS; a non-null required type (only
    -- NOTARY today) demands a live, current VERIFIED row for exactly this
    -- matched professional. If the operator revoked this professional's
    -- verification any time after the match was created, this now
    -- correctly fails ("matched professional is no longer eligible") --
    -- fixing a gap that would otherwise silently allow consent to route to
    -- a professional who no longer holds a verified commission.
    and (
      v_required_verification_type is null
      or exists (
        select 1
        from public.professional_verifications pv
        where pv.professional_profile_id = public.professional_profiles.id
          and pv.verification_type = v_required_verification_type
          and pv.status = 'VERIFIED'
      )
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
  'The only path that can ever create a consent_receipts row or move an opportunity to ROUTED. Re-validates every hard eligibility fact and the fail-closed regulatory allowlist against live data before writing anything -- never trusts what create_qualified_opportunity computed earlier. As of 0013_evolusa_notary_regulated_category.sql the allowlist covers BUSINESS_MARKETING/FL (0007), BUSINESS_OPERATIONS/FL (0011), and NOTARY/FL. For a category with a non-null verificationRequirement (currently only NOTARY), this function independently re-checks, at consent/routing time, that the matched professional still has a VERIFIED professional_verifications row of the required type -- a verification revoked between match time and consent time correctly blocks routing.';

revoke all on function public.consent_and_route_opportunity(uuid, text[]) from public;
revoke execute on function public.consent_and_route_opportunity(uuid, text[]) from anon;
grant execute on function public.consent_and_route_opportunity(uuid, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Deliberately NOT touched by this migration, and why:
--
--    - professional_verifications RLS policies and grants (0006) -- still
--      default-deny for anon/authenticated, still zero policies, still only
--      a service-role connection can read or write it. NOTARY_COMMISSION_
--      VERIFIED rows are created/updated through the exact same
--      operator-only path IDENTITY_VERIFIED rows already use -- see the
--      runbook at the end of this file. No new RLS surface needed.
--
--    - professional_profiles_public (0006) and get_my_opportunity_
--      professionals (0010/0012) -- neither exposes a per-verification-type
--      boolean beyond the existing identity_verified (derived from
--      IDENTITY_VERIFIED specifically). This migration does NOT add a
--      public notary_commission_verified column to either. That is a
--      separate, not-yet-scoped product/UI decision (a public NOTARY badge,
--      the same shape VerifiedBadge.tsx already renders for
--      IDENTITY_VERIFIED) -- the hard eligibility gate this migration
--      builds does not depend on it in any way (it reads
--      professional_verifications directly, never through either view/RPC).
--      FLAGGED FOR SECURITY REVIEWER / PRODUCT: before a NOTARY badge ships
--      in the UI, that follow-up needs its own review, same rigor as 0006's
--      original identity_verified derivation.
--
--    - lib/opportunities/eligibility.ts / lib/opportunities/match.ts --
--      read, not edited, per this migration's brief, and per their own
--      header comments ("design reference and test target ... NOT what an
--      authoritative opportunity is created against"). FLAGGED FOR SECURITY
--      REVIEWER: eligibility.ts's VERIFICATION_REQUIRED check is hardcoded
--      to the literal string comparison
--      `regulatoryPolicy.verificationRequirement === "IDENTITY_VERIFIED"`.
--      For NOTARY, regulatoryPolicy.verificationRequirement is
--      "NOTARY_COMMISSION_VERIFIED", so this comparison is false and
--      eligibility.ts will NOT push VERIFICATION_REQUIRED for an unverified
--      NOTARY candidate -- it will silently report such a candidate as
--      fully eligible. This is a real design-reference correctness gap
--      introduced the moment a second verificationRequirement value exists
--      at all, NOT a live security hole (the actual gate is the SQL in
--      sections 4-5 above, which is correct and does not use this file).
--      Left unfixed here deliberately, to keep this migration's diff
--      scoped to its stated brief (SQL migration + the specific TS catalog
--      additions item 2 asked for) -- but flagged explicitly because
--      ProfessionalProfilePublic has no field today that could express "is
--      this professional verified for the SPECIFIC type this category
--      requires" (only identityVerified exists), so a correct fix needs a
--      small, deliberate type change, not a one-line swap, and should not
--      be done as a drive-by inside this migration.
--
--    - VerifiedBadge.tsx -- unchanged; hardcoded to render only the
--      IDENTITY_VERIFIED type today, and nothing in this migration wires a
--      NOTARY badge into any UI (see the point above).
--
--    - Any RLS policy on opportunities, consent_receipts, or
--      professional_profiles -- unchanged; all are already category-agnostic
--      (owner-scoped by member_id/user_id, never by category).
--
--    - data/compliance/claims.ts -- NOTARY already existed there with the
--      correct compliance tier (requiresVerification: true, enabledByDefault:
--      false, defaultFulfillmentType: "REQUIRES_VERIFICATION") before this
--      migration; nothing to change.
--
--    - TAX -- explicitly out of scope for this migration. Sections 4 and 5's
--      CASE mappings, and this migration's verification-type design
--      decision (section 1), are shaped so a future TAX migration is a
--      trivial, reviewable, same-shaped follow-up: one more allowlist pair,
--      one more CASE branch in each function, one more verification_type
--      CHECK value, one more data/professional/verification-types.ts entry,
--      one more regulatory-policy.ts row -- not a new kind of change.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 7. Operator verification runbook (reference only -- NOT executed by this
--    migration; run manually, one professional at a time, via a service-role
--    connection, only after a real out-of-band verification of the notary's
--    Florida commission against the FL Department of State's public notary
--    lookup). Identical shape to 0006's IDENTITY_VERIFIED runbook,
--    parameterized for NOTARY_COMMISSION_VERIFIED.
--
--    Step 1 -- find the professional's professional_profiles.id (the row
--    must already exist with category = 'NOTARY', created the same way
--    every professional_profiles row is created -- see 0005's runbook):
--
--      select id, display_name, slug, category from public.professional_profiles where slug = '<slug>';
--
--    Step 2 -- create the verification row, starting PENDING (do not set
--    status = 'VERIFIED' in the same statement as creation -- record intent
--    to review, then record the actual outcome as its own deliberate step):
--
--      insert into public.professional_verifications (professional_profile_id, verification_type, status)
--      values ('<professional_profiles.id>', 'NOTARY_COMMISSION_VERIFIED', 'PENDING');
--
--    Step 3 -- after the operator has actually checked the notary's
--    commission number against the FL Department of State's public notary
--    registry (https://dos.fl.gov/sunbiz/other-services/notary/), record the
--    outcome as its own statement. internal_notes should record the
--    commission number checked and the check date -- never a document,
--    never an image, per 0006's "evidence itself is not stored" design:
--
--      update public.professional_verifications
--      set status = 'VERIFIED', verified_at = now(), reviewed_by = '<operator auth.users id>',
--          internal_notes = 'Confirmed active FL notary commission #<number> via FL DOS public registry on <date>.'
--      where professional_profile_id = '<professional_profiles.id>' and verification_type = 'NOTARY_COMMISSION_VERIFIED';
--
--    (Or status = 'REJECTED' with a reason in internal_notes, if the
--    commission number does not resolve, is expired, or does not match the
--    professional's stated identity -- REJECTED is distinct from leaving it
--    PENDING, so there is a real record that a review happened and did not
--    pass.)
--
--    Revoking a prior verification (e.g., a commission later found to have
--    lapsed, or evidence of fraud) is the same UPDATE shape with
--    status = 'REVOKED' -- the row is never deleted, so there is always a
--    record that a professional WAS verified and later was not. Per section
--    4/5's reasoning above, a REVOKED row takes effect immediately and
--    fail-closed: the professional stops matching new opportunities right
--    away (create_qualified_opportunity), and consent_and_route_opportunity
--    will refuse to route any opportunity already matched to them going
--    forward, without any further code change.
--
--    No professional has a NOTARY_COMMISSION_VERIFIED row after this
--    migration is applied. Every NOTARY professional_profiles row remains
--    ineligible to ever be matched or routed to (returns zero eligible
--    candidates, not an error) until the owner explicitly authorizes
--    running this runbook for a specific, real, verified notary.
-- ---------------------------------------------------------------------------
