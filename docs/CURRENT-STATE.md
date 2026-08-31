# EVOLUSA — Current State

Authoritative handoff snapshot. Trust `git log` and the code over this if they ever disagree — this file is updated at milestone/checkpoint boundaries, not continuously.

## PROJECT

EVOLUSA

## REPOSITORY

`mauricioyepesstudio/pros360era`

## ACTIVE BRANCH

`feat/evolusa-migration`

## LOCAL PORT

`3002` (`npm run dev` runs `next dev --port 3002` — always this port, never 3000/3001)

## LAST COMPLETED MILESTONE

**Milestone 04D — Start/Rematch Experience.** `/conexiones/nueva` is the first real UI for `create_qualified_opportunity`/`consent_and_route_opportunity` (0007) — until now those RPCs had only ever been called directly during live testing. A member picks a Need, city, consultation mode, and readiness; on a match, a per-category consent checklist routes the opportunity. No new SQL, no new RLS. Both previously-dead "start over" links (`/conexiones`'s empty state, `MemberActions`'s "Buscar otra opción") now point here instead of `/roadmap`. See "Milestone 04D status: DONE" below.

Prior: Milestone 04C — Opportunity Experience, built on the verified Milestone 04B lifecycle. Two authenticated routes — `/conexiones` (member) and `/panel-profesional/oportunidades` (professional) — turned the Opportunity Engine + Lifecycle into a real guided UI, with zero new schema or RPCs. See "Milestone 04C status: DONE" below and [EVOLUSA-OPPORTUNITY-EXPERIENCE.md](./EVOLUSA-OPPORTUNITY-EXPERIENCE.md) for full detail.

Prior: Milestone 04B — Opportunity Lifecycle, live and authorization-tested. `ROUTED → CONTACTED → COMPLETED`, with `DECLINED` as an alternate terminal outcome from either party and an explicit, never-persisted `expires_at` boundary, live in the EVOLUSA Supabase project on top of Milestone 04A's Opportunity Engine. See "Milestone 04B status: LIVE" below and [EVOLUSA-OPPORTUNITY-LIFECYCLE.md](./EVOLUSA-OPPORTUNITY-LIFECYCLE.md).

Prior to that: Milestone 04A.1 — build recovery (fixed a real `eslint-plugin-react-hooks` error in `EvolusaPath.tsx`) + repository hygiene audit of an uncommitted Home/public-experience visual cluster, deliberately left unresolved pending an owner visual-approval decision (still unresolved — see "WHAT IS FUNCTIONAL NOW" below). Prior to that: Milestone 04A — Live Opportunity Engine Verified (member need → eligibility → one explainable professional match → user consent → qualified opportunity), the first of the Milestone 04 family to ship code/schema rather than only architecture. Prior to that: Milestone 04 (Intelligence, Demand & Match Architecture) — pure design pass, still accurate as the target shape for everything not yet built (`platform_events`, sponsored placement, ML, regulated categories). Prior to that: Platform Blueprint V1 — architecture/design only, defining the product family (EvolUSAia, EVOLUSA Network/Verified/Match/Appointments), the Member/Professional account model, the AI trust-layer and escalation model, the professional-category compliance extension, a proposed V2 schema, and MVP/Phase 2/Phase 3 scope. See the blueprint docs below.

Earlier still: end-of-day portable handoff checkpoint, covering the real Supabase account backend (Phase 2), its live end-to-end validation (Phase 2.5), and the Premium Public Experience V1 redesign of Header/Hero/StageSelector/Core Belief/Journey/Roadmap Preview.

## PLATFORM ARCHITECTURE (V2, DESIGN ONLY — NOT BUILT)

- [EVOLUSA-PLATFORM-BLUEPRINT.md](./EVOLUSA-PLATFORM-BLUEPRINT.md) — product family, user types, professional categories, north-star metric, business-model assumptions.
- [EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md) — AI response model (extends the existing `TrustSource`/`guidance_label` trust hierarchy), context model, source architecture, escalation engine.
- [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md) — Verified, Match, Appointments, Reviews.
- [EVOLUSA-TRUST-COMPLIANCE.md](./EVOLUSA-TRUST-COMPLIANCE.md) — extends `data/compliance/claims.ts` to professional categories; new two-party/public-view RLS patterns needed beyond today's single-owner pattern.
- [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md) — scope cuts, proposed schema (not migrated), risks, recommended first implementation slice.
- [EVOLUSA-INTELLIGENCE-MATCH.md](./EVOLUSA-INTELLIGENCE-MATCH.md) — Milestone 04: Need/Intent/Eligibility/Match contracts, geolocation strategy, event taxonomy, outcome engine, supply/demand intelligence.
- [EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md](./EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md) — Milestone 04: Opportunity lifecycle, consent receipts, routing, trust/anti-abuse threat model, minimum data-model decision, security red-team.
- [EVOLUSA-REGULATORY-POLICY.md](./EVOLUSA-REGULATORY-POLICY.md) — Milestone 04: category × jurisdiction regulatory contract, monetization guardrails, "trust is never for sale."

**Everything above except Milestone 01/03/04A/04B/04C/04D (below) is still design-only.** The three Milestone 04 docs describe the full target architecture; Milestones 04A–04D (below) implement a deliberately narrow, live slice of it (`opportunities`/`consent_receipts` + 7 RPCs total, `BUSINESS_MARKETING`/`FL` only, full lifecycle `CREATED → ROUTED → CONTACTED → COMPLETED`/`DECLINED`, now with a real member and professional UI at `/conexiones`, `/conexiones/nueva`, and `/panel-profesional/oportunidades`) — the rest (`platform_events`, `SHARED_MAX_3`, sponsored placement, ML, regulated categories) remains design-only exactly as documented. Treat the undelivered parts of this section like the rest of `docs/` before Phase 2 was implemented: a plan to build against, not a status report.

### Milestone 01 status: LIVE — applied, hardened, and authorization-tested

`supabase/migrations/0005_evolusa_professional_foundation.sql` is **applied** to the EVOLUSA Supabase project (`ovialqdazxkekvqqgdiu`) — `profiles.role` (`MEMBER`/`PROFESSIONAL`/`ADMIN`), `professional_profiles`, and the `professional_profiles_public` safe view all exist live. `data/professional/{types,categories}.ts` provides the matching code catalog (one MVP category, `BUSINESS_MARKETING`).

**A real grant bug was found and fixed live, same session, before any authorization test ran**: the migration's original `revoke all on professional_profiles_public from public` was a no-op (`REVOKE ... FROM PUBLIC` only strips privileges granted to the `PUBLIC` pseudo-role; Supabase grants a new view's privileges directly to the *named* roles `anon`/`authenticated` at creation time) — `anon`/`authenticated` briefly held full INSERT/UPDATE/DELETE/TRUNCATE grants on the view, not just `SELECT`. Corrected with a follow-up `revoke all ... from anon, authenticated; grant select ... to anon, authenticated;`, verified via `information_schema.role_table_grants` before and after, and the local migration file updated to match what's actually live.

**21 live authorization tests, all passing** (throwaway `auth.users` identities, created and fully deleted within the same session — cleanup verified: 0 remaining test users, 0 remaining `professional_profiles` rows, the 1 pre-existing real profile untouched throughout):
- 13 negative: MEMBER→PROFESSIONAL/ADMIN self-promotion, PROFESSIONAL→ADMIN self-promotion, self-changing `category`/`is_approved`/`user_id`, self-service INSERT/DELETE, cross-professional row reads, anon reading the base table, MEMBER reading another user's row, anon reading an *unapproved* professional through the public view, anon mutating the public view — all blocked, several at the GRANT layer before RLS/triggers even evaluate.
- 8 positive: operator role assignment, profile creation, category assignment, approval, owner editing all 9 allowed fields (with `category`/`is_approved` confirmed untouched by that edit), anonymous + authenticated reads of an approved professional through the public view, and both the raw-operator-connection and explicit `service_role` JWT provisioning paths.

**Post-apply advisors**: one expected finding, `security_definer_view` on `professional_profiles_public` (ERROR level) — this is the intended mechanism (the view runs with its creator's privileges specifically so `anon`/`authenticated` can read through it while the base table itself grants them nothing), documented in-migration via `COMMENT ON VIEW`, and must be acknowledged, not "fixed" by adding `security_invoker = true` (doing so would silently break the entire public directory). No other new finding; the only other advisor items (`auth_leaked_password_protection` WARN, an unrelated pre-existing `unused_index` INFO) predate this migration.

**Milestone 02 built** `/profesionales/[slug]` (public professional profile route, reads only `professional_profiles_public`) — locally validated with fixtures, then **Milestone 02B** live-verified the entire operator/owner/public flow end-to-end against one real approved row: **Daniela Torres** (`daniela-torres-marketing`, `BUSINESS_MARKETING`, non-regulated), created as a clearly-labeled controlled account and kept live as the MVP demo professional (owner's explicit decision, not a default). Full operator flow (MEMBER → PROFESSIONAL → row created → pre-approval invisible → approved → visible), all 9 owner-editable fields, all 4 protected-field blocks, and the live route (200/404, zero private-field leak) were all verified against this real row, not a fixture.

### Milestone 03 status: LIVE — EVOLUSA Verified V1 (trust foundation) applied and authorization-tested

`supabase/migrations/0006_evolusa_verified_v1.sql` is **applied** to the EVOLUSA Supabase project. This is a deliberately minimal slice of the full Verified design in [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#evolusa-verified) — see that doc's "V1 status: LIVE" note for exactly what shipped versus what's still design-only (10 verification types, credential identifiers, evidence metadata, expiration).

**Core principle enforced structurally, not by convention**: "profile approved" (`professional_profiles.is_approved`, public-visibility permission) and "identity verified" (`professional_verifications`, an evidence-backed trust state) are separate tables connected only by a read-only derived expression — approving a profile can never create or imply a verification, and vice versa. Proven live across 4 independence cases (unapproved+verified → no public row at all; approved+pending/revoked → public row with `identity_verified = false`; approved+verified → `identity_verified = true`).

`professional_profiles_public` now has **11 columns** (the 10 from Milestone 01 plus a trailing derived `identity_verified boolean`, computed via `EXISTS` against `professional_verifications` — never a stored/copied value). `professional_verifications` is fully locked to `service_role`/operator access only: `anon`/`authenticated` have zero table-level and zero column-level grants, RLS is enabled with zero policies (default-deny), and even the owning professional cannot read their own row (they learn their status the same way the public does, via the derived boolean). A `verified_status_requires_verified_at` CHECK constraint makes a `VERIFIED` row with a NULL `verified_at` impossible at the database level.

**16 live tests, all passing**, against a throwaway professional (`throwaway-milestone03-test`, created and fully deleted within the session via cascade from a throwaway `auth.users` row — cleanup verified: 0 remaining verification rows, 1 `professional_profiles` row, back to Daniela only):
- 5 positive lifecycle: PENDING create, `VERIFIED`+NULL `verified_at` rejected by the new CHECK constraint, `VERIFIED`+timestamp → public `true`, `REVOKED` (timestamp retained, public `false`), `REJECTED` → public `false`.
- 12 negative: PROFESSIONAL/MEMBER/ANON each attempting SELECT/INSERT/UPDATE/DELETE on `professional_verifications` — all denied with `42501 permission denied`, blocked at the GRANT layer before RLS is even evaluated. A 13th test confirmed `identity_verified` is structurally non-updatable through `professional_profiles_public` (Postgres error `0A000`, not an RLS block) since it's a derived expression, not a base column — there is no RPC or other exposed path that touches verification at all.

**Post-apply advisors**: same two expected findings as Milestone 01 (`security_definer_view` on `professional_profiles_public`, `auth_leaked_password_protection` WARN — pre-existing) plus one new expected INFO (`rls_enabled_no_policy` on `professional_verifications` — intentional default-deny) and one new, previously-unflagged performance INFO: `reviewed_by`'s foreign key has no covering index. Not fixed in this milestone — no query pattern needs it yet; a candidate for a small follow-up migration if operator-side "verifications reviewed by X" queries become real.

**Daniela Torres remains unverified**: `is_approved = true`, `identity_verified = false`, zero rows in `professional_verifications` for her — confirmed both before and after the migration, untouched throughout. Verifying her is a separate, explicit, owner-authorized operator action (see the runbook in `0006`'s trailing comments), not a side effect of this migration.

**Correction (found during the 2026-08-27 launch-readiness audit, docs/EVOLUSA-001-LAUNCH-READINESS-AUDIT.md Finding D-2): the line below was wrong.** `components/professional/VerifiedBadge.tsx` exists, is imported and rendered in `ProfessionalProfileView.tsx`, and is safe as built (renders nothing when `identityVerified` is `false`, which is Daniela's real current state). It shipped at some point after this section was originally written, without this file being updated — treat any "not yet built" claim about it, here or in `EVOLUSA-PROFESSIONAL-NETWORK.md`, as stale.

Not yet built: any admin UI, self-service professional signup, Match/Appointments/Reviews/EvolUSAia.

### Milestone 04A status: LIVE — Qualified Opportunity Engine, hardened and authorization-tested

`supabase/migrations/0007_evolusa_opportunity_engine_v1.sql` is **applied** to the EVOLUSA Supabase project. It proves the smallest real demand-engine loop end to end — member need → eligibility → one explainable professional match → user consent → qualified opportunity — for exactly one reviewed `(category, jurisdiction)` pair, `BUSINESS_MARKETING`/`FL`. No Appointments, ML, `SHARED_MAX_3`, payments, sponsored placement, professional analytics, or new regulated category.

**Schema**: two new tables, `opportunities` and `consent_receipts`, plus three `SECURITY DEFINER` RPCs — `create_qualified_opportunity` (client supplies only `need_id`/`city`/`preferred_consultation_mode`/`readiness`; every authoritative field — `professional_category`, member `state`/`language`, `matched_professional_profile_id`, `organic_match_score` — is server-computed from `auth.uid()`, never a client parameter), `consent_and_route_opportunity` (re-validates every eligibility fact and the regulatory allowlist against live data before writing an immutable `consent_receipts` row and transitioning `CREATED → ROUTED` atomically), and `get_my_routed_opportunities` (parameterless, professional-facing read surface gating every personal-data field independently by consented category). `authenticated` has zero INSERT/UPDATE grant on either table — every write goes through one of the two mutation RPCs.

**A real live grant bug was found and fixed during apply, before any authorization test ran** — the second time this exact class of bug has hit this project (the first was `professional_profiles_public` in Milestone 01): `revoke all on function ... from public` does not strip the separate, direct `EXECUTE` grant Supabase's schema-level default privileges give to the *named* roles `anon`/`authenticated` on function creation. `anon` briefly held `EXECUTE` on all three new functions. Fixed live with a follow-up migration (`evolusa_opportunity_engine_anon_execute_fix`) explicitly revoking `EXECUTE` from `anon` on all three, verified via `has_function_privilege`, and reconciled into the canonical `0007` file so a fresh apply from this repo alone reproduces the correct final state without depending on the follow-up. See `docs/EVOLUSA-SECURITY.md`'s "Reusable security rule" section for the general pattern this establishes for every future `SECURITY DEFINER` RPC in this project.

**Owner-approved, first-for-this-codebase exception**: `get_my_routed_opportunities()` reads `auth.users.email` (the only place a member's email exists in this schema) to deliver consented contact info to a matched professional. Fully documented in `docs/EVOLUSA-SECURITY.md` with all 16 controls, why access is required, exactly where it occurs, and why it's never exposed more broadly — not a general relaxation of the standing "never read `auth.users`" rule.

**Live-tested against throwaway fixtures only** (one FL member, one GA member, one throwaway professional — created and fully deleted within the session): positive flow (create → consent → route → professional read) succeeded end to end; per-category consent gating proven independently for `NAME`, `CONTACT_EMAIL`, `CITY`, `STATE`, `NEED_SUMMARY` (a field renders `null` unless its own specific category was consented — no blanket check); double-consent on an already-`ROUTED` opportunity correctly rejected (`opportunity is not in a consentable state`, receipt count confirmed still exactly 1); cross-professional and member-self isolation both confirmed via `get_my_routed_opportunities()` returning zero rows; the regulatory fail-closed gate correctly rejected a non-`FL` member's request; `anon` confirmed unable to execute any of the three functions or read either table directly; direct client `INSERT`/`UPDATE` on both tables confirmed blocked at the grant layer (`42501`).

**A real professional (Daniela) was legitimately matched once during testing** — she's a genuine eligible `BUSINESS_MARKETING`/FL/Miami candidate, so the matching query correctly selected her ahead of the still-untested throwaway professional on a same-city tie-break. That opportunity was left un-consented and un-routed (no `consent_receipts` row was ever created referencing her) and was deleted during cleanup along with everything else — her `professional_profiles` row was never written to.

**Cleanup verified**: `professional_profiles = 1`, `professional_verifications = 0`, `opportunities = 0`, `consent_receipts = 0`, `profiles = 2` — back to exactly Daniela + the real owner account. Daniela's `is_approved`/`is_accepting_clients`/`identity_verified`/`state`/`city`/`category` confirmed byte-identical to her pre-migration baseline.

**Advisors**: the two pre-existing findings (unrelated), plus expected `authenticated_security_definer_function_executable` WARNs on all three new functions (intentional — that's their entire purpose; not weakened) and fresh `unused_index` INFOs on the two new `member_id` indexes (pre-traffic, expected).

**Known technical debt** (see `docs/EVOLUSA-SECURITY.md`'s "Known design debt" section for the full reasoning and proposed future single-source-of-truth strategy): (A) `Need → professional_category` mapping duplicated between TypeScript and a hardcoded SQL `case`; (B) the regulatory allowlist duplicated between TypeScript and a hardcoded SQL condition in both RPCs; (C) no lifecycle writer yet for `CONTACTED`/`COMPLETED`/`DECLINED`/`EXPIRED` — `opportunities.status` can only reach `CREATED` or `ROUTED` today.

Not yet built: `platform_events`, `SHARED_MAX_3` routing, sponsored placement, any second `Need`/professional category, payments, rate limiting, the professional-facing UI that would actually call `get_my_routed_opportunities()`, and everything past `ROUTED` in the lifecycle (Milestone 04B).

### Milestone 04A.1 status: DONE — build recovery + repository hygiene

**`components/evolusa/EvolusaPath.tsx` fixed and committed.** Root cause: `Node`/`Row` were declared as nested function components inside `EvolusaPath`'s render body, tripping `eslint-plugin-react-hooks`'s `static-components` rule (a new function identity on every render). This was an ESLint-only finding — `npm run build`/TypeScript were never broken by it — but real lint debt on an already-committed, approved visual file (last touched in `4cb087b`, part of the approved Premium Experience base, not any rejected direction). Fixed by moving `Node`/`Row` to module scope with an explicit `tokens` prop replacing their previous closure over `EvolusaPath`'s locals — a pure internal restructuring; both consumers (`Hero.tsx`, `JourneyOverview.tsx`) only use the existing public props and needed no changes. `npm run lint` is now clean (0 problems), alongside `npm test` (19/19) and `npm run build`.

**Uncommitted Home/public-experience work audited, not resolved.** A cluster of files sitting modified-but-uncommitted in the tree — `sections/home/Hero.tsx`, `sections/home/HeroArtboard.tsx` (proposed deletion), `components/layout/SiteHeader.tsx`, `sections/home/ProductReveal.tsx`, `sections/home/ProductRevealPanel.tsx`, `components/ui/Container.tsx`, `data/photography/slots.ts`, `app/page.tsx` — reads as one coherent, well-documented, self-consistent piece of work: consolidating the previously-split mobile-`Hero`/desktop-`HeroArtboard` composition into a single responsive `Hero`, retiring the fixed-artboard concept, giving `ProductReveal`/`StageSelector` one universal render path instead of a duplicated one, and reordering desktop section order via CSS `order` (not DOM order, so mobile's approved source order is untouched — the same fix pattern already reasoned through and self-corrected once earlier in this project's history). The code quality and internal documentation are high, but **whether this specific visual result is the one Mauricio actually approved, versus a superseded/rejected direction, is a design judgment call this session cannot make from code alone** — the git history shows earlier checkpoints explicitly titled "lock approved desktop hero composition" and "match approved home master," so there is a real prior approved state this cluster would replace. **Left entirely alone**: neither committed nor reverted, exactly as found. Two small, unambiguously safe pieces from the same diff were evaluated independently and found genuinely decision-independent: `components/evolusa/PhotoSlot.tsx`'s new `objectPositionClassName`/`alt` props (backward-compatible, enables responsive art direction + real alt text) and `sections/home/StageSelector.tsx`'s new optional `className` prop (purely additive) — both are safe, reusable capability additions regardless of which Hero direction wins, but were **also left uncommitted** this pass since they're small enough not to warrant a separate partial commit ahead of the Hero decision; nothing is lost by resolving them together.

**Currently authoritative visual state**: exactly what's committed at `HEAD` (last Home-affecting commit `4cb087b`) — the fixed-artboard desktop `HeroArtboard` + mobile-only `Hero` split, unchanged. The uncommitted cluster above is not live in any built/deployed sense and was never staged.

**Correction (found during the 2026-08-27 audit, Finding D-3): the paragraph above is stale.** The commit immediately after this one, `b8c5171` ("fix(evolusa): restore clean build and reconcile visual worktree"), left the tree matching exactly this pre-cluster baseline — `PhotoSlot.tsx` has no `objectPositionClassName` prop, `StageSelector.tsx` takes no `className` prop, `Hero`/`HeroArtboard` still show the old split. In other words, the cluster was not "left entirely alone" as this section still claimed — it was effectively reverted by the time `b8c5171` landed. Whether that revert was a deliberate decision or incidental cleanup is not confirmed by anything in git history alone (see the audit's Open Question 1); either way, this is no longer an open decision blocking Home work — the tree already reflects one clear, committed state.

### Milestone 04B status: LIVE — Opportunity Lifecycle, hardened and authorization-tested

`supabase/migrations/0008_evolusa_opportunity_lifecycle_v1.sql` is **applied** to the EVOLUSA Supabase project. It extends Milestone 04A's Opportunity Engine past `ROUTED` with the four transitions a real connection needs: `ROUTED → CONTACTED` (matched professional only), `CONTACTED → COMPLETED` (member only — the professional has no completion action, structurally; no `mark_opportunity_completed` function exists anywhere in this schema), `ROUTED`/`CONTACTED` → `DECLINED` (either party, with `declined_by` always server-derived from `auth.uid()`, never a client-supplied label), and effective (never persisted) expiration. Full detail in [EVOLUSA-OPPORTUNITY-LIFECYCLE.md](./EVOLUSA-OPPORTUNITY-LIFECYCLE.md).

**Schema**: `opportunities` gains `expires_at`, `contacted_at`, `completed_at`, `declined_at`, `declined_by` (CHECK'd to `MEMBER`/`PROFESSIONAL`), `decline_reason`, plus a dual-layer `opportunities_decline_reason_actor_check` CHECK constraint enforcing actor-appropriate decline reasons independently of the RPC. Three new `SECURITY DEFINER` RPCs (`mark_opportunity_contacted`, `complete_opportunity`, `decline_opportunity`) plus a widened `get_my_routed_opportunities()` (adds a computed `effective_status`, never a stored one).

**A read stays a read**: `expires_at` is set exactly once, at `ROUTED` time (`routed_at + 7 days`), inside `consent_and_route_opportunity`. `effective_status = 'EXPIRED'` is a pure `CASE`-expression derivation computed identically in SQL and in `lib/opportunities/lifecycle.ts#getEffectiveStatus` — the stored `status` column is never mutated by a read. This was an explicit owner correction to an earlier "lazy write from a read" proposal.

**One real Postgres limitation discovered live**: `CREATE OR REPLACE FUNCTION` cannot change a `RETURNS TABLE` function's output row shape (`42P13`) — `get_my_routed_opportunities()` needed an explicit `DROP FUNCTION` immediately before `CREATE FUNCTION`, safe within the same migration transaction. Reapplied successfully on retry with no partial-commit risk (Supabase migrations are transactional).

**The `anon`-EXECUTE-leak rule (found live in Milestone 04A) was applied proactively this time, not reactively**: all four new/modified functions included the explicit `revoke execute ... from anon` line from the start. Verified live immediately after apply via `has_function_privilege` — zero incident.

**Live-tested against throwaway fixtures only — Daniela was not used at all this time** (stricter than 04A, which had used her incidentally and read-only): two throwaway members, two throwaway professionals, four throwaway opportunities. Positive: full happy path (create → consent → contact → complete); professional decline from `ROUTED`; member decline from `CONTACTED`; matched professional sees member-confirmed `COMPLETED`; a manually-backdated `expires_at` (set directly via raw SQL, never through any RPC) correctly surfaces `effective_status = 'EXPIRED'` while stored `status` stays `ROUTED`. Negative: member cannot mark `CONTACTED`; unrelated professional cannot mark `CONTACTED`; matched professional cannot complete (structurally impossible — `complete_opportunity` checks `member_id`); unrelated member cannot complete; completing from `ROUTED` (never contacted) rejected; contacting an expired `ROUTED` opportunity rejected; double-`CONTACTED`/double-`COMPLETED` rejected; professional using a member-only decline reason rejected and vice versa; unrecognized decline reason rejected; `anon` cannot execute any of the four RPCs; direct client `UPDATE` on `opportunities` (including all new columns) remains denied at the grant layer; cross-professional read isolation holds for the new columns.

**Cleanup verified**: baseline `professional_profiles = 1`, `professional_verifications = 0`, `opportunities = 0`, `consent_receipts = 0`, `profiles = 2` before and after — identical. Daniela's row confirmed byte-identical throughout, never touched.

**Advisors**: expected `authenticated_security_definer_function_executable` WARNs on the three new/modified functions (intentional), no new unexpected findings.

**Technical debt update**: item C from Milestone 04A's design-debt list ("no lifecycle writer yet for `CONTACTED`/`COMPLETED`/`DECLINED`/`EXPIRED`") is now resolved, with `EXPIRED` deliberately remaining a computed, never-persisted value per the owner's explicit correction. Items A and B (the `Need`→category mapping and the regulatory allowlist, each duplicated between TypeScript and SQL) remain open, joined by a third instance of the same pattern: decline-reason validation now also exists in both places. All three tracked in `docs/EVOLUSA-SECURITY.md`'s "Known design debt" section with the same proposed future single-source-of-truth strategy, deliberately not solved in this milestone.

Not yet built (at the time 04B shipped): notifications of any kind, persisted `EXPIRED` rows, automatic rematching after decline/expiration, a freeform notes/message channel between member and professional, `platform_events`, any UI consuming these four new RPCs, rate limiting. **The UI gap is now closed by Milestone 04C, immediately below** — everything else in this list remains true.

### Milestone 04C status: DONE — Opportunity Experience, no new schema

Two new authenticated routes turn the Milestone 04A/04B backend into a real UI: `/conexiones` (member) and `/panel-profesional/oportunidades` (professional, gated by `profiles.role === 'PROFESSIONAL'` at the page level). Full detail in [EVOLUSA-OPPORTUNITY-EXPERIENCE.md](./EVOLUSA-OPPORTUNITY-EXPERIENCE.md).

**Zero new migration.** The member's read is a plain RLS-scoped `select` on `opportunities`/`consent_receipts` (0007's existing policies already permit it); the professional's read is a thin mapper over the existing `get_my_routed_opportunities()` RPC. Three new server-action wrappers (`markContactedAction`, `completeOpportunityAction`, `declineOpportunityAction` in `app/(account)/actions.ts`) call the three existing 0008 RPCs — no new authorization logic anywhere in the UI layer; the RPCs remain the sole authority.

**New pure logic** in `lib/opportunities/lifecycle.ts`: `getMemberActions`/`getProfessionalActions` (which action buttons are legal to render, by effective status — structurally excludes a professional completion action, matching that no such RPC exists) and `getExpirationLabel` (a static day-count derivation, never a live countdown).

**No internal scoring exposed**: `organic_match_score` is present in the member's raw `opportunities` row but is never rendered and never crosses into a Client Component — `OpportunityCard` stays a Server Component specifically to keep it out of the RSC payload sent to the browser, not just out of the visible JSX. The professional's RPC-based read never receives that column at all, by construction.

**Consented contact info is actually rendered, not just labeled**: found during this checkpoint's diff review — the first draft of `ProfessionalOpportunityCard` only showed which categories were consented (via `ConsentSummary`'s badges) without ever displaying the resolved name/email/location values, which would have made "mark as contacted" unusable in practice. Fixed before commit: `memberName`/`contactEmail`/`city`/`state` are now rendered as plain text whenever present, with no extra client-side gating needed — `get_my_routed_opportunities()`'s own `CASE` expressions already null out any field the member didn't consent to, so "the value is non-null" and "it was consented" are the same fact by construction.

**8 new tests** (`tests/opportunity-experience.test.ts`) covering state-copy completeness, expiration-label text, member/professional action availability per state, and that the professional action vocabulary structurally has no completion option — 35/35 total passing, build and lint clean.

**Two intentional gaps, deliberately not solved here**:
- **A.** No real UI yet for `create_qualified_opportunity`/`consent_and_route_opportunity` (0007) — both have only ever been called directly via RPC during live testing, never from any page. "Buscar otra opción" (shown on `DECLINED`/effectively-`EXPIRED` cards) links to `/roadmap` for now, not a dedicated rematch flow, because none exists.
- **B.** The member's card cannot yet show richer safe professional identity (e.g. a name/link to the public profile) because the current public professional surface (`professional_profiles_public`) doesn't expose a joinable identifier back to `matched_professional_profile_id` (0005's SECURITY BOUNDARY design) — closing this is a schema decision, correctly out of scope for a "no new migration unless a genuine blocker" milestone.

**Live verification**: both new routes were confirmed live (dev server on port 3002) to correctly redirect an unauthenticated visitor to `/login?next=...` via the widened `proxy.ts` protected-prefix list. No throwaway live users were created and no real account was signed into for this milestone — verification relied on the 8 new unit tests plus this one unauthenticated redirect check, per the explicit "prefer unit/integration boundaries first" instruction for this milestone.

### Milestone 04D status: DONE — Start/Rematch Experience

`app/(account)/conexiones/nueva/page.tsx` (server) + `components/opportunities/NewOpportunityFlow.tsx` (client) close gap A from Milestone 04C: there is now a real UI for both `create_qualified_opportunity` and `consent_and_route_opportunity`. Two new server actions in `app/(account)/actions.ts` — `createOpportunityAction`, `consentAndRouteOpportunityAction` — are thin wrappers with the exact same shape as the existing 04C action wrappers; neither performs its own authorization check, since the RPCs themselves remain the sole authority, unchanged from 0007.

**No schema, RLS, or RPC change.** The form collects only genuine user input (need, optional city, consultation mode, readiness) and a consent-category checklist restricted to the fixed five-value `ConsentDataCategory` enum — no freeform field, no professional-selection input. Gap B from Milestone 04C remains open by design: the member still never sees the matched professional's name or a link to their public profile, since `professional_profiles_public` still doesn't expose a joinable identifier back to `matched_professional_profile_id` (0005's SECURITY BOUNDARY) — resolving that is still a schema decision, not something this milestone should do incidentally. The "compatible match" copy shown after a successful match is the same static, always-true-once-matched sentence already used in `/conexiones`'s `ROUTED` state (`data/opportunities/copy.ts`), not a fetched detail — `organic_match_score` and any professional-specific data still never reach a Client Component.

**Verification**: `npm run lint`/`npx tsc --noEmit`/`npm test` (35/35)/`npm run build` all clean. Live-checked in a browser against the real dev environment: the unauthenticated case was previously verified for other `/conexiones/*` routes via the shared `proxy.ts` prefix match (no separate re-check needed, since `/conexiones/nueva` falls under the existing `/conexiones` protected prefix). The authenticated render was confirmed against a real, already-signed-in session found in the dev browser — the form was visually confirmed to render correctly, but was deliberately never submitted, to avoid writing real data to production Supabase under a real account without being explicitly asked to.

Not yet built: any UI-level rate limiting, a real professional-identity reveal (gap B above), notifications when a new opportunity is created, and everything else already listed as deferred in Milestone 04C.

## WHAT IS FUNCTIONAL NOW

- Public marketing home page (`app/page.tsx`) — Premium Experience V1 tokens now cover the whole page, not just the top half. **Correction (2026-08-27 audit, Finding D-1): the previous claim that StageServices/HowItWorks/TrustAndTransparency/FAQ/CTA/Footer were "unchanged... still on the old gold accent" was stale and false as of the audit** — all six were independently grepped and confirmed to use the current token set (`var(--brand-navy)`, `var(--brand-blue)`, etc.), not the legacy gold. Whoever did that migration and when is not recorded anywhere in this file; treat it as done.
- Public professional directory (`/profesionales`) and profile pages (`/profesionales/[slug]`) — reads `professional_profiles_public` directly, linked from the footer.
- Public onboarding flow (`/onboarding`) — works anonymously, no account required, hands off answers to a signed-in account on first login via `sessionStorage` + `OnboardingSync`.
- Real Supabase email/password auth: signup, login, logout, session restoration, protected-route redirect (`proxy.ts`), Spanish error states. Signup no longer leaks account existence via its error message (fixed 2026-08-27 per the audit's Finding S-1).
- Real per-user persistence: profile, roadmap item completion, life events all read/write through `lib/account/persistence.ts` and `app/(account)/actions.ts`, verified live end-to-end (see `EVOLUSA-AUTH-TESTING.md`).
- Dashboard/Roadmap/Profile pages (`app/(account)/...`) show real signed-in user data, falling back to preview data only when signed out or Supabase is unconfigured. The account Roadmap engine (`lib/account/roadmap-engine.ts`) now has real recommendation content for every selectable need category (housing, transport, credit, insurance, education, English, family, business formation) — previously several of these categories were selectable but produced zero recommendations.
- `/conexiones` (member), `/conexiones/nueva` (start a new opportunity — Milestone 04D), and `/panel-profesional/oportunidades` (professional, role-gated) — the full opportunity lifecycle now has a real UI end to end, from creation through consent, contact, and completion. Confirmed live to require authentication; the authenticated render of `/conexiones/nueva` was visually confirmed against a real signed-in session, but the form was deliberately never submitted to avoid writing real production data.

## SUPABASE

- **Organization**: EVOLUSA (`eaxhsobbvufhnybrpozs`) — separate from BELONG Labs; never touch BELONG's org or its `belong-platform` project.
- **Project ref**: `ovialqdazxkekvqqgdiu` (repurposed from its default name "InMigration" — this is the real EVOLUSA backend now)
- **Region**: `us-west-2` — kept as-is for MVP; free to move to `us-east-1` later if South Florida latency matters enough (see `EVOLUSA-DATABASE.md`), but that means a new project since Supabase can't change region in place.
- **Migrations status**: `0001`–`0009` are applied and live (schema, RLS, profile provisioning, advisor fixes, professional foundation, Verified V1, Opportunity Engine, Opportunity Lifecycle, assistant_messages RLS ownership fix). `0009` (closing audit Finding S-2) was security-reviewed and owner-authorized 2026-08-31, then applied live — `get_advisors` immediately after showed zero new findings, only the pre-existing expected WARNs already documented below.
- **Auth status**: real email/password auth working; `mailer_autoconfirm: false` (confirmation genuinely required); default built-in mailer is rate-limited — custom SMTP is the next real blocker for production signup volume (see `EVOLUSA-AUTH-TESTING.md`).
- **RLS status**: enabled on all 8 tables, owner-only policies, verified live twice with real cross-user isolation tests (zero cross-user read/write leakage, confirmed at the database level — see `EVOLUSA-SECURITY.md`).
- **Zero secrets in documentation** — every doc in this repo references the project ref/org id (not secret) but never the anon key or any credential value.

## CURRENT VISUAL STATUS

Premium Experience V1 shipped on Header, Hero, StageSelector, Core Belief (new section), Journey (now features the reusable `EvolusaPath` component), and Roadmap Preview. New design tokens in `app/globals.css` (Deep Navy / Progress Blue / EVOL USA Red / Warm White / Educational Sky / Progress Green / Muted). A real accessibility bug was caught and fixed this round: Progress Blue text directly on Deep Navy measured 2.94:1 contrast (fails WCAG AA); a lighter `--brand-blue-on-dark` tint (7.2:1) now covers every blue-on-navy text usage. **Correction (2026-08-27 audit, Finding D-1): the sentence that used to be here — "StageServices, HowItWorks, TrustAndTransparency, FAQ, CTA, and Footer were intentionally left untouched and still show the old gold accent" — is false as of the audit.** All six sections were independently verified to already use the current token set. The gold-accent seam this file used to track as open no longer exists in the code; nothing further is needed here.

## CURRENT ACCOUNT STATUS

Real auth end-to-end, code-complete and live-verified once via a pre-confirmed throwaway test account (workaround needed because the default mailer can't be organically tested without a real inbox — see `EVOLUSA-AUTH-TESTING.md` for exactly why and how). No real production users exist yet.

## CURRENT BACKEND STATUS

Schema, RLS, and the profile auto-provisioning trigger are all live and advisor-clean. Persistence functions (`lib/account/persistence.ts`) and server actions (`app/(account)/actions.ts`) are wired into the dashboard/roadmap/profile pages and the onboarding-to-account handoff.

## TEST STATUS

`npm test` — 35/35 pass (roadmap engine, account roadmap engine, opportunity eligibility, opportunity experience, opportunity lifecycle, opportunity match). Lint and `tsc --noEmit` clean. **Correction (2026-08-27 audit, Finding D-1): this line previously said "7/7," which was stale and contradicted this same file's own Milestone 04C section, which already said "35/35."**

## BUILD STATUS

`npm run build` clean. Dynamic (session-aware): `/assistant`, `/conexiones`, `/conexiones/nueva`, `/dashboard`, `/panel-profesional/oportunidades`, `/profesionales`, `/profesionales/[slug]`, `/profile`, `/roadmap`. Everything else is static.

## CURRENT BLOCKERS

- Custom SMTP not configured — production signup volume needs a provider decision (Resend recommended — see `EVOLUSA-LAUNCH-CHECKLIST.md` and the SMTP recommendation in conversation history).
- Auth email templates are still Supabase's English defaults, not Spanish.
- Business/legal facts still placeholders in `config/brand.ts` (legal name, phone, email, WhatsApp, website, hours) — blocks compliant public copy, not code.
- A Vercel project named `pros360era` IS connected to this repo, but under a different Vercel account/login than the one reachable via this session's Vercel MCP connector (which only sees an unrelated "Mauricio's projects" team with `taxmind-ai`/`taxmind-mvp`). Production (`pros360era.vercel.app`) still serves an old `main`-branch commit; the real preview lives under "Recent Previews" for `feat/evolusa-migration` in that other account's dashboard. Owner needs to either set `feat/evolusa-migration` as the Production Branch there, or merge to `main`, to get a stable link.
- **Live production data hygiene**: a leftover throwaway test professional (`qa-throwaway-professional-20260825`) is currently public in the live Supabase project alongside Daniela Torres — found 2026-08-27 while building `/profesionales`, needs an operator with Supabase access to delete it. See `docs/EVOLUSA-001-LAUNCH-READINESS-AUDIT.md` P0-6.
- Five public-experience photo slots (arrival, stability, entrepreneurship, growth, achievement in `data/photography/slots.ts`) have no image at all — owner decision pending on AI-generated placeholder vs. licensed stock vs. waiting for a real shoot.
- Four legacy home sections (`sections/home/{Testimonials,Services,Process,Benefits}.tsx`) contain fabricated testimonials and direct-provision claims for disabled regulated categories. Not imported anywhere live, but flagged for deletion or full rewrite before merge — owner decision pending.

## NEXT EXACT TASK

**Correction (2026-08-27 audit, Finding D-1): the task previously listed here (extending Premium Experience tokens to the remaining home sections) is already done** — see "CURRENT VISUAL STATUS" above. The authoritative next-steps list is now `docs/EVOLUSA-001-LAUNCH-READINESS-AUDIT.md`, Part 9 (Prioritized Execution Backlog) — check that document rather than this section before picking up new work. As of this correction, the remaining items needing the owner directly are: legal/business facts for `config/brand.ts`, an SMTP provider decision, the photo-slot decision above, and the dead-file deletion decision above. The remaining engineering-only item is Milestone 04C's gap B (showing the matched professional's identity to the member), which needs a schema decision before it can be built.

## FILES/AREAS MOST RELEVANT TO NEXT TASK

| Concern | File |
| --- | --- |
| Design tokens | `app/globals.css` |
| Shared primitives already updated | `components/ui/{Button,ButtonLink,Heading,ProgressStep}.tsx` |
| Reusable path motif | `components/evolusa/EvolusaPath.tsx` |
| Opportunity creation flow (Milestone 04D) | `components/opportunities/NewOpportunityFlow.tsx`, `app/(account)/conexiones/nueva/page.tsx` |
| Supabase env/client/server | `lib/supabase/{env,client,server}.ts` |
| Route protection | `proxy.ts` |
| Persistence functions | `lib/account/persistence.ts` |
| Server actions | `app/(account)/actions.ts` |
| Migrations (source of truth for what's applied) | `supabase/migrations/0001`–`0008` applied, `0009` authored-not-applied |

## IMPORTANT DECISIONS

- Primary CTA color is Progress Blue, not the EVOL USA Red — red is deliberately restrained to the brand mark and rare accents (per the approved creative direction).
- `InMigration` was repurposed as the real EVOLUSA backend rather than creating a new Supabase project, because the account had already hit Supabase's 2-free-projects-per-owner limit.
- Onboarding's answer collection intentionally does not call the separate deterministic `lib/roadmap/rules.ts` engine — that's a pre-existing architectural split, tracked, not fixed this round (see "What's deliberately not done yet" history in git blame of this file).

## DO NOT TOUCH / SAFETY NOTES

- Never touch BELONG Labs org or the `belong-platform` Supabase project.
- Never touch `mauricio-portfolio`, `marketing-ai-platform`, `meta-ads-deploy`, or any other repository.
- Never merge this branch to `main`, push anywhere but `origin feat/evolusa-migration`, or deploy without explicit approval.
- Never commit `.env.local` or any Supabase credential value — `.env.example` holds placeholder names only.
- Don't flip any regulated service category (`data/compliance/claims.ts`) to enabled/direct without verified real-world credentials — that's a business decision, not an engineering one.

## HOME-COMPUTER RESUME STEPS

See [HOME-SETUP.md](./HOME-SETUP.md) for the full executable process.
