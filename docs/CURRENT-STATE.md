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

**Milestone 04A — Live Opportunity Engine Verified.** The demand-engine vertical slice (member need → eligibility → one explainable professional match → user consent → qualified opportunity) is **live, hardened, and authorization-tested** in the EVOLUSA Supabase project. See "Milestone 04A status: LIVE" below for full detail — this is the first of the Milestone 04 family to actually ship code/schema, not just architecture.

Prior: Milestone 04 (Intelligence, Demand & Match Architecture) — pure design pass, still accurate as the target shape for everything 04A didn't yet build (lifecycle beyond `ROUTED`, `platform_events`, sponsored placement, ML, regulated categories). Prior to that: Platform Blueprint V1 — architecture/design only. Defines the product family (EvolUSAia, EVOLUSA Network/Verified/Match/Appointments), the Member/Professional account model, the AI trust-layer and escalation model, the professional-category compliance extension, a proposed V2 schema, and MVP/Phase 2/Phase 3 scope. See the blueprint docs below.

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

**Everything above except Milestone 01/03/04A (below) is still design-only.** The three Milestone 04 docs describe the full target architecture; Milestone 04A (below) implements a deliberately narrow, live slice of it (`opportunities`/`consent_receipts` + 3 RPCs, `BUSINESS_MARKETING`/`FL` only) — the rest (lifecycle beyond `ROUTED`, `platform_events`, `SHARED_MAX_3`, sponsored placement, ML, regulated categories) remains design-only exactly as documented. Treat the undelivered parts of this section like the rest of `docs/` before Phase 2 was implemented: a plan to build against, not a status report.

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

Not yet built: the Verified badge UI (discussed at design level during Milestone 03 but not implemented — no component, no rendering of `identity_verified` anywhere in `ProfessionalProfileView`), any admin UI, self-service professional signup, Match/Appointments/Reviews/EvolUSAia.

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

**Next exact milestone**: resolve the Home-cluster disposition with Mauricio directly (keep as the new direction / revert to `4cb087b`'s approved state / view live first) before any further Home work — then Milestone 04B (Opportunity Lifecycle, designed below, not yet implemented).

## WHAT IS FUNCTIONAL NOW

- Public marketing home page (`app/page.tsx`) — new premium visual system on Header/Hero/StageSelector/Core Belief/Journey/Roadmap Preview; Services/HowItWorks/Trust/FAQ/CTA/Footer sections unchanged from before this round (still on the old gold-accented styling — see `EVOLUSA-LAUNCH-CHECKLIST.md` follow-ups).
- Public onboarding flow (`/onboarding`) — works anonymously, no account required, hands off answers to a signed-in account on first login via `sessionStorage` + `OnboardingSync`.
- Real Supabase email/password auth: signup, login, logout, session restoration, protected-route redirect (`proxy.ts`), Spanish error states.
- Real per-user persistence: profile, roadmap item completion, life events all read/write through `lib/account/persistence.ts` and `app/(account)/actions.ts`, verified live end-to-end (see `EVOLUSA-AUTH-TESTING.md`).
- Dashboard/Roadmap/Profile pages (`app/(account)/...`) show real signed-in user data, falling back to preview data only when signed out or Supabase is unconfigured.

## SUPABASE

- **Organization**: EVOLUSA (`eaxhsobbvufhnybrpozs`) — separate from BELONG Labs; never touch BELONG's org or its `belong-platform` project.
- **Project ref**: `ovialqdazxkekvqqgdiu` (repurposed from its default name "InMigration" — this is the real EVOLUSA backend now)
- **Region**: `us-west-2` — kept as-is for MVP; free to move to `us-east-1` later if South Florida latency matters enough (see `EVOLUSA-DATABASE.md`), but that means a new project since Supabase can't change region in place.
- **Migrations status**: 4 applied (`0001` schema, `0002` RLS, `0003` profile auto-provisioning trigger, `0004` advisor fixes) — `supabase/migrations/` in this repo matches exactly what's live.
- **Auth status**: real email/password auth working; `mailer_autoconfirm: false` (confirmation genuinely required); default built-in mailer is rate-limited — custom SMTP is the next real blocker for production signup volume (see `EVOLUSA-AUTH-TESTING.md`).
- **RLS status**: enabled on all 8 tables, owner-only policies, verified live twice with real cross-user isolation tests (zero cross-user read/write leakage, confirmed at the database level — see `EVOLUSA-SECURITY.md`).
- **Zero secrets in documentation** — every doc in this repo references the project ref/org id (not secret) but never the anon key or any credential value.

## CURRENT VISUAL STATUS

Premium Experience V1 shipped on Header, Hero, StageSelector, Core Belief (new section), Journey (now features the reusable `EvolusaPath` component), and Roadmap Preview. New design tokens in `app/globals.css` (Deep Navy / Progress Blue / EVOL USA Red / Warm White / Educational Sky / Progress Green / Muted). A real accessibility bug was caught and fixed this round: Progress Blue text directly on Deep Navy measured 2.94:1 contrast (fails WCAG AA); a lighter `--brand-blue-on-dark` tint (7.2:1) now covers every blue-on-navy text usage. StageServices, HowItWorks, TrustAndTransparency, FAQ, CTA, and Footer were intentionally left untouched and still show the old gold accent — a visible, tracked seam, not an oversight.

## CURRENT ACCOUNT STATUS

Real auth end-to-end, code-complete and live-verified once via a pre-confirmed throwaway test account (workaround needed because the default mailer can't be organically tested without a real inbox — see `EVOLUSA-AUTH-TESTING.md` for exactly why and how). No real production users exist yet.

## CURRENT BACKEND STATUS

Schema, RLS, and the profile auto-provisioning trigger are all live and advisor-clean. Persistence functions (`lib/account/persistence.ts`) and server actions (`app/(account)/actions.ts`) are wired into the dashboard/roadmap/profile pages and the onboarding-to-account handoff.

## TEST STATUS

`npm test` — 7/7 pass (deterministic roadmap engine + account roadmap engine tests). Lint and `tsc --noEmit` clean.

## BUILD STATUS

`npm run build` clean. `/dashboard`, `/roadmap`, `/profile` are dynamically rendered (session-aware, as expected); everything else is static.

## CURRENT BLOCKERS

- Custom SMTP not configured — production signup volume needs a provider decision (Resend recommended — see `EVOLUSA-LAUNCH-CHECKLIST.md` and the SMTP recommendation in conversation history).
- Auth email templates are still Supabase's English defaults, not Spanish.
- Business/legal facts still placeholders in `config/brand.ts` (legal name, phone, email, WhatsApp, website, hours) — blocks compliant public copy, not code.
- No Vercel project currently connected to this repository (confirmed via the Vercel API this session — only unrelated `taxmind-ai`/`taxmind-mvp` projects exist in the connected account). No preview deployment exists to inspect.

## NEXT EXACT TASK

Extend the Premium Experience V1 token/Path system down through the remaining home sections (StageServices, HowItWorks, TrustAndTransparency, FAQ, CTA, Footer) so the whole home page reads as one consistent system instead of a redesigned top half + unchanged bottom half.

## FILES/AREAS MOST RELEVANT TO NEXT TASK

| Concern | File |
| --- | --- |
| Design tokens | `app/globals.css` |
| Shared primitives already updated | `components/ui/{Button,ButtonLink,Heading,ProgressStep}.tsx` |
| Reusable path motif | `components/evolusa/EvolusaPath.tsx` |
| Sections still on old styling | `sections/home/{StageServices,HowItWorks,TrustAndTransparency,FAQ,CTA,Footer}.tsx` |
| Supabase env/client/server | `lib/supabase/{env,client,server}.ts` |
| Route protection | `proxy.ts` |
| Persistence functions | `lib/account/persistence.ts` |
| Server actions | `app/(account)/actions.ts` |
| Migrations (source of truth for what's applied) | `supabase/migrations/0001`–`0004` |

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
