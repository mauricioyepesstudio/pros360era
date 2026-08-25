-- EVOLUSA Milestone 04A — Qualified Opportunity Engine V1.
-- PROPOSED ONLY. NOT APPLIED. Must be reviewed (supabase-architect,
-- security-reviewer) and explicitly approved before `apply_migration`.
-- Never apply against the BELONG project.
--
-- SECURITY-HARDENING PASS (this revision): the first draft of this file let
-- authenticated members INSERT their own opportunities row directly,
-- reasoning that an unconsented row was inert and therefore harmless. That
-- reasoning held for routing safety but not for data integrity — a client
-- that bypassed the app entirely (a raw REST call with their own JWT)
-- could still have written a fabricated matched_professional_profile_id or
-- organic_match_score into a real, permanent row, polluting the one table
-- this project's future demand analytics will be built on, regardless of
-- whether that row could ever actually route. This revision closes that
-- gap: authenticated now has ZERO INSERT/UPDATE grant on opportunities.
-- Every write, including creation, goes through a SECURITY DEFINER
-- function that computes every authoritative field itself. See section 1
-- below for the full mechanism.
--
-- Proves the smallest real demand-engine loop end to end: member need ->
-- eligibility -> one explainable professional match -> user consent ->
-- qualified opportunity. Does NOT build Appointments, ML, SHARED_MAX_3,
-- payments, sponsored placement, professional analytics, or any new
-- regulated category. See docs/EVOLUSA-INTELLIGENCE-MATCH.md,
-- docs/EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md, and
-- docs/EVOLUSA-REGULATORY-POLICY.md for the full architecture this
-- migration implements a deliberately narrow slice of.

-- ---------------------------------------------------------------------------
-- 1. opportunities — one row per member request. Every column that
--    represents a system decision (professional_category,
--    matched_professional_profile_id, organic_match_score, status,
--    routed_at) is written ONLY by the SECURITY DEFINER functions in
--    sections 4 and 5 — authenticated has no INSERT or UPDATE grant on
--    this table at all (section 3). A client can never author these
--    values, honestly or dishonestly, because there is no code path
--    through which a client-supplied value for them could ever reach the
--    table.
-- ---------------------------------------------------------------------------
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  need_id text not null check (need_id in ('BRANDING', 'WEBSITE')),
  -- Resolved server-side from need_id inside create_qualified_opportunity
  -- (section 4) — never a client input at any step. Stored, not
  -- re-derived, so consent_and_route_opportunity (section 5) can
  -- re-validate against it without duplicating the Need -> category code
  -- catalog a second time.
  professional_category text not null check (professional_category in ('BUSINESS_MARKETING')),
  -- Resolved server-side from profiles.state inside create_qualified_
  -- opportunity — never a client input. A member cannot claim a different
  -- state than their own profile to bypass jurisdiction gating.
  state text,
  -- Voluntary, request-scoped, client-supplied and legitimately so (see
  -- section 4) — city is a match-score bonus only, never a jurisdiction
  -- gate, so a member misreporting it can at most misdirect their own
  -- match quality, not anyone else's eligibility. profiles has no city
  -- column today, so this is never fabricated from a nonexistent source.
  city text,
  preferred_consultation_mode text not null check (preferred_consultation_mode in ('VIRTUAL', 'IN_PERSON', 'BOTH')),
  readiness text not null check (readiness in ('EXPLORING', 'CONSIDERING', 'READY_TO_ACT')),
  -- CONSENTED was in the original design and was removed in this hardening
  -- pass: no code path can ever produce it (create_qualified_opportunity
  -- only ever writes CREATED; consent_and_route_opportunity transitions
  -- CREATED -> ROUTED directly, in one statement, with the consent_receipts
  -- row itself as the durable proof consent happened). A status value with
  -- no possible writer is exactly the kind of state YAGNI exists to catch.
  status text not null default 'CREATED' check (status in ('CREATED', 'ROUTED', 'CONTACTED', 'COMPLETED', 'DECLINED', 'EXPIRED')),
  matched_professional_profile_id uuid references public.professional_profiles(id) on delete set null,
  -- Nullable, not zero-defaulted: null already means "zero eligible
  -- professionals were found" — no separate matched_professional_count
  -- column, avoiding a second place that same fact could drift.
  organic_match_score numeric,
  created_at timestamptz not null default now(),
  routed_at timestamptz
);

comment on table public.opportunities is
  'One row per member request for a professional match. Every authoritative column (professional_category, matched_professional_profile_id, organic_match_score, status, routed_at) is written exclusively by create_qualified_opportunity or consent_and_route_opportunity (both SECURITY DEFINER) — authenticated has no direct INSERT or UPDATE grant on this table at all. See the state-writer matrix in this migration''s trailing comment for the authorized writer of every status value.';

create index opportunities_member_id_idx on public.opportunities(member_id);
create index opportunities_matched_professional_profile_id_idx on public.opportunities(matched_professional_profile_id);

-- ---------------------------------------------------------------------------
-- 2. consent_receipts — immutable proof of what a member authorized, never
--    a copy of the values themselves. Append-only, same pattern as the
--    existing progress_events design: no UPDATE, no DELETE, for anyone,
--    and (section 3) no direct INSERT for anyone either — only
--    consent_and_route_opportunity ever writes a row here.
--
--    CONTACT_PHONE was in the original design's allowed category list and
--    is removed here: nothing in this schema collects a phone number
--    anywhere (not on profiles, not on professional_profiles, not
--    captured at request time) — allowing consent to "share" data EVOLUSA
--    cannot actually produce would be a category the receipt could never
--    honestly redeem. Add it back only alongside a real column for it.
-- ---------------------------------------------------------------------------
create table public.consent_receipts (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  purpose text not null,
  data_categories text[] not null check (data_categories <@ array['NAME', 'CONTACT_EMAIL', 'CITY', 'STATE', 'NEED_SUMMARY']::text[]),
  policy_version text not null,
  consented_at timestamptz not null default now(),
  -- One receipt per (opportunity, professional) — re-consenting to the same
  -- professional for the same opportunity updates nothing; the lifecycle
  -- has no path that would ever need a second receipt for the same pair.
  unique (opportunity_id, professional_profile_id)
);

comment on table public.consent_receipts is
  'Immutable proof a member explicitly authorized sharing specific, named data categories with a specific professional for a specific opportunity — records WHAT was authorized, never copies of the values. Written only by consent_and_route_opportunity (SECURITY DEFINER); no client, including the consenting member, ever gets a direct INSERT/UPDATE/DELETE grant on this table — confirmed by the grants in section 3, not just by convention.';

create index consent_receipts_opportunity_id_idx on public.consent_receipts(opportunity_id);
create index consent_receipts_professional_profile_id_idx on public.consent_receipts(professional_profile_id);
-- Unlike professional_verifications.reviewed_by in 0006 (deliberately left
-- unindexed — no query pattern used it), this one has a real, certain,
-- immediate need: the select_own_consent_receipts policy below filters by
-- member_id on every single SELECT a member ever makes against this table.
create index consent_receipts_member_id_idx on public.consent_receipts(member_id);

-- ---------------------------------------------------------------------------
-- 3. RLS + grants. authenticated gets SELECT only on both tables — no
--    INSERT, no UPDATE, no DELETE on either, for anyone but the SECURITY
--    DEFINER functions below (which run as the function owner and bypass
--    these grants entirely, by design). This is the structural answer to
--    "can a member forge organic_match_score / matched_professional_
--    profile_id / professional_category / status": there is no grant that
--    would let them attempt it in the first place, regardless of what
--    request they craft.
-- ---------------------------------------------------------------------------
revoke all on public.opportunities from anon, authenticated;
revoke all on public.consent_receipts from anon, authenticated;

alter table public.opportunities enable row level security;
alter table public.consent_receipts enable row level security;

create policy "select_own_opportunities" on public.opportunities
  for select to authenticated
  using ((select auth.uid()) = member_id);

create policy "select_own_consent_receipts" on public.consent_receipts
  for select to authenticated
  using ((select auth.uid()) = member_id);

grant select on public.opportunities to authenticated;
grant select on public.consent_receipts to authenticated;

-- ---------------------------------------------------------------------------
-- 4. create_qualified_opportunity — the ONLY way an opportunity row can
--    ever be created. Client supplies exactly four values, all genuine
--    user input: which need, an optional voluntary city, preferred
--    consultation mode, and readiness. Everything else is computed here:
--
--    - professional_category: resolved from need_id via an explicit,
--      hardcoded CASE mapping — a minimal SQL mirror of exactly the
--      possibleProfessionalCategories mapping in data/needs/catalog.ts
--      (never the full catalog: labels/descriptions/roadmap stages stay
--      TypeScript-only). Must be widened here in lockstep whenever a new
--      Need is added to the TypeScript catalog, same as the need_id/
--      professional_category CHECK constraints above — flagged as a known
--      maintenance cost, not solved generically, per this migration's own
--      "do not build a huge regulatory-policy system" instruction.
--
--    - member state/language: read from profiles via auth.uid(), never a
--      client parameter — a member cannot claim a different state than
--      their own profile to route around jurisdiction gating.
--
--    - the regulatory fail-closed gate: an explicit allowlist check, not a
--      lookup against a widenable table. Only professional_category =
--      'BUSINESS_MARKETING' and member state = 'FL' — the one currently-
--      reviewed policy — is permitted to proceed at all; every other
--      combination raises an exception. This is deliberately narrower than
--      "unregulated categories are fine" — it names the one reviewed pair
--      explicitly, so the database boundary stays safe even if a future
--      developer adds a new Need/professional category to the TypeScript
--      catalogs without remembering to update this function. Widening
--      requires touching this exact line, in this exact migration-reviewed
--      function — not a config change.
--
--    - matched_professional_profile_id / organic_match_score: computed by
--      the eligibility+scoring query below, which mirrors
--      lib/opportunities/eligibility.ts / lib/opportunities/match.ts
--      exactly (see those files' own Milestone 04A hardening-note
--      comments) — DIRECT routing only, single best-scoring eligible
--      candidate.
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
  -- data/needs/catalog.ts's possibleProfessionalCategories, described above.
  v_professional_category := case p_need_id
    when 'BRANDING' then 'BUSINESS_MARKETING'
    when 'WEBSITE' then 'BUSINESS_MARKETING'
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

  -- Fail-closed regulatory gate — explicit allowlist, not a catalog lookup.
  -- See this function's header comment for why.
  if not (v_professional_category = 'BUSINESS_MARKETING' and v_member_state = 'FL') then
    raise exception 'no reviewed regulatory policy for this category/jurisdiction';
  end if;

  -- Eligibility + deterministic scoring in one query: filters to eligible
  -- candidates via the WHERE clause (category, state, language, mode,
  -- approved, accepting — the same gates as
  -- lib/opportunities/eligibility.ts), then picks the single best by the
  -- same weighted terms as lib/opportunities/match.ts (base 2 for
  -- category+state, both already guaranteed by WHERE; +2 same-city; +1
  -- accepting clients, also already guaranteed by WHERE). Verification
  -- bonus intentionally omitted: BUSINESS_MARKETING/FL's policy does not
  -- require it, matching the identical rule and reasoning in match.ts.
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
  'The only path that can ever create an opportunities row. Client supplies need_id/city/preferred_consultation_mode/readiness only — professional_category, member state/language, matched_professional_profile_id, and organic_match_score are all computed here from auth.uid()-derived data, never accepted as parameters. Fails closed (raises an exception) for any (category, jurisdiction) pair other than the one explicitly reviewed BUSINESS_MARKETING/FL policy.';

revoke all on function public.create_qualified_opportunity(text, text, text, text) from public;
-- `revoke ... from public` alone is NOT sufficient — live-discovered during
-- Milestone 04A apply, same root cause as the professional_profiles_public
-- bug in Milestone 01: Supabase's schema-level default privileges grant
-- EXECUTE on a new function directly to the *named* roles anon/authenticated
-- at creation time, separate from the PUBLIC pseudo-role. Confirmed via
-- information_schema.role_routine_grants immediately after the first apply
-- (anon had EXECUTE on all three functions in this file), fixed live with a
-- follow-up migration, and reproduced here so a fresh apply of this file
-- alone is correct without needing that follow-up.
revoke execute on function public.create_qualified_opportunity(text, text, text, text) from anon;
grant execute on function public.create_qualified_opportunity(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. consent_and_route_opportunity — the one operation that crosses the
--    trust boundary to a second party. Takes NO professional_profile_id
--    parameter — reads matched_professional_profile_id from the opportunity
--    row itself, so a tampered request can never redirect consent to a
--    different professional than the one create_qualified_opportunity
--    actually computed.
--
--    Re-validates every hard eligibility fact directly against live
--    professional_profiles data before writing anything — approved,
--    accepting clients, category (against the stored professional_category,
--    never re-derived from need_id), state, language, consultation-mode
--    compatibility — AND re-applies the identical fail-closed regulatory
--    allowlist from create_qualified_opportunity, independently, as its own
--    defense-in-depth layer specifically at the routing boundary (per this
--    hardening pass's explicit instruction that the regulatory gate must
--    hold at routing, not only at creation).
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

  -- Explicit NULL-safety note: with the auth.uid() is null check above,
  -- auth.uid() is guaranteed non-null here, so this <> comparison can never
  -- silently evaluate to NULL (which `if NULL then` treats as false, not
  -- true — a real gap in an earlier draft that relied on this comparison
  -- alone, found during the Milestone 04A final security-definer review).
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
  -- boundary — not inherited from create_qualified_opportunity's check.
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
  set status = 'ROUTED', routed_at = now()
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

comment on function public.consent_and_route_opportunity is
  'The only path that can ever create a consent_receipts row or move an opportunity to ROUTED. Re-validates every hard eligibility fact and the fail-closed regulatory allowlist against live data before writing anything — never trusts what create_qualified_opportunity computed earlier, even though that function is also authoritative. Runs as the function owner (SECURITY DEFINER) specifically so it can write to consent_receipts and update opportunities.status, neither of which authenticated has any direct grant on.';

revoke all on function public.consent_and_route_opportunity(uuid, text[]) from public;
revoke execute on function public.consent_and_route_opportunity(uuid, text[]) from anon;
grant execute on function public.consent_and_route_opportunity(uuid, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. get_my_routed_opportunities — the professional-facing read surface.
--    A SECURITY DEFINER function, not a view, chosen deliberately in this
--    hardening pass over the first draft's plain view: a function with a
--    fixed, closed signature (here, no parameters at all beyond the
--    implicit auth.uid()) has no PostgREST query-composition surface for a
--    client to interact with at all, which is a strictly narrower, more
--    easily audited boundary than "a view whose baked-in filters can only
--    be narrowed, never bypassed, by client-appended query params" — even
--    though that view would also have been safe, this is safer by
--    construction, not just by careful review.
--
--    Cannot enumerate: takes no parameters, so there is no input through
--    which a professional could request another professional's rows.
--    Cannot join arbitrary users: the join to professional_profiles is
--    hardcoded to auth.uid(); the joins to profiles/auth.users are scoped
--    by the same opportunity row that join already restricted to. Cannot
--    infer another member's email: only opportunities.matched_
--    professional_profile_id = <this professional> rows are ever visible,
--    and only once a consent_receipts row exists for that exact pair.
--    member_id is never in the returned column list. There is currently no
--    consent-revocation mechanism (consent_receipts is immutable) — if one
--    is added later, this function's join to consent_receipts is exactly
--    where a "not revoked" condition would be added; flagged, not built,
--    since nothing revokes yet.
--
--    contact_phone was in the first draft's projection (always null, no
--    source exists) and is removed entirely in this pass, alongside
--    CONTACT_PHONE's removal from consent_data_categories above — no
--    reason to project a column for data that can never exist.
--
--    Touches auth.users.email — a deliberate, reviewed exception to this
--    project's general "never read auth.users from a view/function"
--    convention, justified because access here is per-row (one specific
--    member's one specific opportunity), professional-authenticated-only,
--    parameterless (no enumeration surface), and gated by an explicit
--    consent_receipts row that must already exist for that exact
--    (opportunity, professional) pair.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_routed_opportunities()
returns table (
  opportunity_id uuid,
  need_id text,
  status text,
  readiness text,
  city text,
  state text,
  member_name text,
  contact_email text,
  consented_data_categories text[],
  created_at timestamptz,
  routed_at timestamptz
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
    o.readiness,
    case when 'CITY' = any(cr.data_categories) then o.city else null end,
    case when 'STATE' = any(cr.data_categories) then o.state else null end,
    case when 'NAME' = any(cr.data_categories) then p.name else null end,
    case when 'CONTACT_EMAIL' = any(cr.data_categories) then u.email else null end,
    cr.data_categories,
    o.created_at,
    o.routed_at
  from public.opportunities o
  join public.consent_receipts cr
    on cr.opportunity_id = o.id and cr.professional_profile_id = o.matched_professional_profile_id
  join public.professional_profiles pp
    on pp.id = o.matched_professional_profile_id and pp.user_id = auth.uid()
  left join public.profiles p on p.id = o.member_id
  left join auth.users u on u.id = o.member_id
  where o.status in ('ROUTED', 'CONTACTED', 'COMPLETED');
$$;

comment on function public.get_my_routed_opportunities is
  'Returns only the calling professional''s own routed-or-later opportunities, each with a matching consent_receipts row required by the join — an un-consented or forged opportunity produces zero rows here regardless of its status column. Every personal-data column is additionally gated per-category by what that specific receipt actually authorized; member_id is never returned.';

revoke all on function public.get_my_routed_opportunities() from public;
revoke execute on function public.get_my_routed_opportunities() from anon;
grant execute on function public.get_my_routed_opportunities() to authenticated;

-- ---------------------------------------------------------------------------
-- 7. State-writer matrix (every value in opportunities.status):
--
--    CREATED   -> create_qualified_opportunity only.
--    ROUTED    -> consent_and_route_opportunity only (requires a real,
--                 just-written consent_receipts row in the same statement).
--    CONTACTED -> no writer exists yet. Not built this migration —
--                 correctly out of scope, a real next slice.
--    COMPLETED -> no writer exists yet. Same as above.
--    DECLINED  -> no writer exists yet. Same as above.
--    EXPIRED   -> no writer exists yet. Same as above.
--
--    No generic UPDATE grant exists for any role but the function owner —
--    every one of the four not-yet-implemented states will need its own
--    reviewed SECURITY DEFINER function when built, the same as the two
--    above, never a direct client UPDATE.
--
-- 8. Abuse/rate-limit seam (documented, not built — no new column needed,
--    the existing schema already carries every signal a future limiter
--    would query):
--
--    - Same member, same need, short window:
--      count(*) from opportunities where member_id = ? and need_id = ?
--        and created_at > now() - interval '1 hour'
--    - Same member, same matched professional, short window:
--      count(*) from opportunities where member_id = ?
--        and matched_professional_profile_id = ?
--        and created_at > now() - interval '1 hour'
--
--    Both queries run against columns and indexes this migration already
--    creates (opportunities_member_id_idx). No rate-limiting logic is
--    added now — this section exists so a future limiter has a documented
--    starting point instead of inventing new tracking columns.
--
-- 9. Not built in this migration, on purpose: opportunity_matches as its
--    own table (V1 is DIRECT-only, so match result lives as columns on
--    opportunities itself), platform_events, professional accept/decline
--    actions, CONTACTED/COMPLETED/DECLINED/EXPIRED transitions, consent
--    revocation, sponsored placement, any second Need or professional
--    category, payments, rate limiting.
-- ---------------------------------------------------------------------------
