# EVOLUSA-001 — Launch Readiness Audit (L1, Owner-Authorized)

**Repository**: `pros360era` (EVOLUSA) · **Branch**: `feat/evolusa-migration` · **HEAD at audit time**: `8faf65f` ("feat(evolusa): add member and professional opportunity experience")
**Audit date**: 2026-08-27 · **Auditor**: Claude Code, orchestrating four independent domain subagents (product, security, compliance, QA) plus direct verification of build/lint/test/git state.
**Constraints honored**: no product source code modified, no other repositories/worktrees inspected, no secrets/`.env` files read or written, no Supabase/Vercel linking, no `git pull`/`push`/`merge`/`rebase`, no deployment, no external outreach or spend. Read-only investigation plus one governance-doc write (this file) and, if approved, one local commit.

---

## Part 1 — Executive Summary

EVOLUSA's engineering foundation is genuinely solid: lint, `tsc --noEmit`, all 35 unit tests, and the production build are all clean, CI mirrors these checks exactly, and a static review of all 8 Supabase migrations found **no critical or high-severity security issues** — the two previously-documented "anon EXECUTE leak" and "REVOKE FROM PUBLIC no-op" bugs are correctly fixed everywhere they could recur. The opportunity-engine authorization model (RLS + `SECURITY DEFINER` RPCs) is well-designed and consistently implemented.

However, this audit found real, previously undocumented problems in three categories, and confirms the project is **not launch-ready**:

1. **The project's own authoritative handoff document, `CURRENT-STATE.md`, is internally self-contradictory** — it states two different "next exact tasks," claims 4 migrations exist (there are 8), claims 7/7 tests pass (there are 35/35), and describes a feature (`VerifiedBadge`) as unbuilt when it is actually implemented and live-wired. Anyone using this file to resume work — including a future AI session — would start from false premises. This is the single highest-leverage fix available: it's cheap, and everything downstream depends on this file being trustworthy.
2. **A real, exploitable email-enumeration bug exists in the signup flow today** (`components/account/AuthFoundation.tsx:12`), contradicting the project's own stated security requirement.
3. **Four unwired legacy marketing files contain fabricated testimonials and first-person claims of directly providing legal/tax/insurance/notary services** — categories the project's own compliance policy marks as disabled pending verification. They render to no one today, but sit in the tree as a landmine for the next person who touches `app/page.tsx`.

None of the previously known blockers (SMTP, Spanish email templates, legal/business placeholders in `config/brand.ts`) have been resolved since the last documented checkpoint — this audit independently reconfirms they are still open, and adds the three findings above plus several smaller ones (below).

**Verdict: NOT READY for real user signups or public launch.** Ready for: continued internal development, and a scoped pre-launch remediation pass (Part 9/10) that is small and well-defined.

---

## Part 2 — Scope, Method & Verification Trail

### What was requested vs. what exists

The audit was requested as an execution of `.ai/tasks/EVOLUSA-001.json` against `.ai/OPERATING_SYSTEM.md`, `.ai/PROJECT_MANIFEST.yaml`, `.ai/agents.yaml`, and `.ai/task.schema.json`, on branch `task/evolusa-001`.

**None of these exist in this repository.** There is no `.ai/` directory anywhere in the repo, and the current/only relevant branch is `feat/evolusa-migration` (confirmed via `git branch -a`: only `main` and `feat/evolusa-migration` exist locally and on `origin`). This was surfaced to the owner before proceeding; the owner directed the audit to proceed using direct methodology instead of the (non-existent) governance scaffolding. This document is therefore the audit's sole deliverable — there is no separate task-evidence file to update.

### Method

1. **Direct verification** (this session, via Bash): `git log`, `git status`, `git branch -a`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, plus reading `config/brand.ts`, `docs/CURRENT-STATE.md`, `docs/EVOLUSA-LAUNCH-CHECKLIST.md`, `package.json`, and the full `docs/`, `app/`, `components/`, `lib/`, `data/`, `supabase/` tree listing.
2. **Four independent, read-only subagents**, each briefed with the specific claims to verify against source (not against each other's or the docs' narrative):
   - **`evolusa-product-architect`** — implemented-vs-documented functionality map, doc staleness.
   - **`security-reviewer`** — static audit of all 8 migrations, RLS, grants, auth boundary, secrets.
   - **`compliance-reviewer`** — professional-services boundary review of all user-facing copy.
   - **`qa-engineer`** — independent re-run of lint/test/build, route-protection coverage, test-coverage gaps, orphan-route/dead-code check.
3. Every finding below carries a file:line citation traceable to one of these five sources. No claim in this document is unsupported.

### What could NOT be verified (requires live access this session does not have)

- The actual state of the live Supabase project (`ovialqdazxkekvqqgdiu`) — grants, RLS, advisor output — is *consistent with* the migration files as reviewed, but was not queried directly (no Supabase linking permitted).
- Supabase Auth configuration (SMTP status, mailer rate limits, `mailer_autoconfirm`, leaked-password-protection toggle).
- Whether the deployment target (if any) has `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` set — this matters a lot (see Part 6, Finding S-3).
- Real signed-in browser behavior on any authenticated route (no dev server or live session was exercised).
- Real signup email delivery.

---

## Part 3 — Repository & Identity Verification

| Check | Result |
|---|---|
| Repository | `pros360era` (local path `C:\Users\graphics1\pros360era`) |
| Current branch | `feat/evolusa-migration` (tracking `origin/feat/evolusa-migration`) |
| Requested branch (`task/evolusa-001`) | Does not exist locally or on `origin` |
| Working tree | Clean at audit start and throughout (`git status --porcelain` empty) |
| `.ai/` governance scaffolding | Does not exist — confirmed via repo-root listing and glob search |
| Recent commits | `8faf65f` → `c6b085c` → `b8c5171` → `243bb58` → `4cb087b` (opportunity experience → lifecycle → visual worktree fix → routing engine → home master), consistent with `CURRENT-STATE.md`'s milestone narrative |
| Secrets | `.env.local` is gitignored and has never been committed (`git log --all -- .env.local` returns nothing); `.env.example` has placeholder keys only; no `service_role`/`sb_secret`/`sk_live` value found anywhere in tracked files |

---

## Part 4 — Implemented vs. Documented Functionality Map

### Accurate and verified live (code matches docs' claims, file:line evidence)

- 8 migrations (`0001`–`0008`) exist and their content matches the narrative in `CURRENT-STATE.md` precisely, including the two historical grant-bug fixes ([`0005_evolusa_professional_foundation.sql:298-308`](../supabase/migrations/0005_evolusa_professional_foundation.sql), [`0007_evolusa_opportunity_engine_v1.sql:303,414,501`](../supabase/migrations/0007_evolusa_opportunity_engine_v1.sql)).
- `/conexiones`, `/panel-profesional/oportunidades`, `/profesionales/[slug]` all exist, are role/auth-gated as documented, and are wired end-to-end to the RPCs described (`app/(account)/actions.ts:64,70,76`, `components/account/AccountShell.tsx:12-24`).
- Test counts are accurate: exactly 35 `test(...)` calls across 6 files, matching the "35/35" claim in `CURRENT-STATE.md:142`.
- `EvolusaPath.tsx` lint fix (Milestone 04A.1) matches its description exactly.
- Regulated-category policy (`data/compliance/claims.ts`, `data/professional/categories.ts`) is internally consistent — only `BUSINESS_MARKETING`/`FL` is live and non-regulated, exactly as claimed.
- `platform_events`, `SHARED_MAX_3`, sponsored placement, ML ranking, Appointments, Reviews, and every V2 schema table are correctly and consistently documented as design-only — none exist in any migration.

### Stale or self-contradictory documentation (new findings — the largest gap this audit found)

**Finding D-1 (High priority to fix, trivial effort): `docs/CURRENT-STATE.md` contradicts itself.**
- Line 166 claims "4 applied" migrations; the same file's own Milestone 01/03/04A/04B sections (lines 44–128) describe 4 *more* migrations as "LIVE." The repo has 8.
- Lines 183–185 ("TEST STATUS") claim "7/7 pass"; line 142 of the *same file* claims "35/35 total passing." The repo has 35.
- Line 150 states "NEXT EXACT TASK: Milestone 04D — Start/Rematch Experience"; lines 198–200 state a *different* "NEXT EXACT TASK": extending Premium Experience tokens to six home sections. These are mutually exclusive, in the same document.
- Lines 154, 173, 209 claim `StageServices`/`HowItWorks`/`TrustAndTransparency`/`FAQ`/`CTA`/`Footer` are "still on old gold styling." **This is false today** — all six files were independently grepped for legacy gold/amber tokens (zero matches) and confirmed to use the current Premium Experience token set (`sections/home/FAQ.tsx:7`, `CTA.tsx:8-9`, `Footer.tsx:8`, `TrustAndTransparency.tsx:23-40`, `HowItWorks.tsx:36-39`, `StageServices.tsx:68-117`). **The "next task" the doc assigns has already shipped, undocumented** — meaning the doc's stale bottom section (lines 152–214) was never updated after Milestone 04A.1 or later.

**Finding D-2: `VerifiedBadge` is documented as unbuilt in two files but is actually implemented and live-wired.** Both `docs/CURRENT-STATE.md:74` and `docs/EVOLUSA-PROFESSIONAL-NETWORK.md:31` state the Verified badge UI "is not yet implemented." In fact, `components/professional/VerifiedBadge.tsx` (46 lines, complete) is imported and rendered at `components/professional/ProfessionalProfileView.tsx:10,58`. Cross-checked with the compliance subagent: the component is *safe* as built (returns `null` when unverified, pulls disclosure copy via `getVerificationDisclosure` at `data/professional/verification-types.ts:32-63`, and the one live professional, Daniela Torres, has `identity_verified = false` per docs — so nothing false renders today). This is a documentation-accuracy problem, not a safety problem — but it means the docs cannot currently be trusted to say what is or isn't built.

**Finding D-3: The Home-cluster resolution narrative is stale.** `CURRENT-STATE.md:98-106` frames an uncommitted visual-consolidation cluster as "left entirely alone... still unresolved pending an owner visual-approval decision." But the current tree (clean `git status`, commit `b8c5171` "restore clean build and reconcile visual worktree" sitting exactly where this resolution should be) matches the **pre-cluster baseline** — `PhotoSlot.tsx` has no `objectPositionClassName` prop, `StageSelector.tsx` takes zero props, and `Hero`/`HeroArtboard` still show the old split composition. The cluster was not "left alone" — it was effectively reverted. The doc should say so (or the owner should confirm that's what actually happened, since intent can't be reconstructed from code alone — see Part 12, Open Question 1).

**Finding D-4:** `docs/EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md` opens with "Architecture only — no migration applied, nothing implemented," but its own body accurately describes Milestones 04A/04B as live. Same self-contradiction pattern as D-1, smaller scope.

**Finding D-5:** `/profesionales/[slug]` renders dynamic (`ƒ`) in the build output because `getPublicProfessionalBySlug()` → `lib/supabase/server.ts` calls `cookies()`, a Next.js dynamic API — this is undocumented (the stale "BUILD STATUS" section only lists `/dashboard`, `/roadmap`, `/profile` as dynamic, predating the newer routes). Not a bug, just an omission.

---

## Part 5 — Security Findings

*Full method: static review of all 8 migrations, `proxy.ts`, `lib/supabase/*`, `lib/auth/config.ts`, `app/(account)/actions.ts`, persistence layers, and auth components. No live database access.*

### Confirmed safe (re-derived independently from SQL/TS, not from docs' narrative)
- The "anon EXECUTE leak" pattern is correctly fixed on **every** `SECURITY DEFINER` function in all 8 migrations (verified individually, function by function).
- The "REVOKE FROM PUBLIC no-op" grant bug on `professional_profiles_public` is correctly fixed.
- Every RLS policy across all 12 tables uses `auth.uid()` against an owned column — zero `USING (true)` policies found anywhere.
- `professional_verifications` is correctly default-deny (RLS enabled, zero policies, explicit revoke from `anon`/`authenticated`).
- `professional_profiles_public` view leaks no internal columns.
- No client-supplied authority field reaches any RPC — `professional_category`, matched-professional ID, and `organic_match_score` are all server-computed; `declined_by` is always derived from `auth.uid()`.
- `organic_match_score` never crosses into a Client Component (`OpportunityCard.tsx` is deliberately a Server Component).
- No secrets committed anywhere in the repo.
- The Need→category and regulatory-allowlist duplication between TypeScript and SQL (documented design debt) was checked for exploitability and found **not exploitable** — both are hardcoded, fail-closed literals in the SQL, immune to client or TypeScript-side tampering.

### Confirmed issues

**Finding S-1 (Medium — real, user-facing, fix before any signup): Email enumeration in signup flow.**
`components/account/AuthFoundation.tsx:12` returns the distinct message *"Ya existe una cuenta con este correo. Intenta entrar."* when Supabase reports the email is already registered. This directly contradicts the project's own stated requirement that signup must never leak account existence via error wording. An attacker can submit candidate emails and learn which have accounts — a real enumeration/targeted-phishing vector, live today, independent of any live-database access to detect.
*Fix owner: frontend-engineer. Effort: small (one error-message branch).*

**Finding S-2 (Low/Medium — dormant, not yet exploitable, must fix before Assistant ships): `assistant_messages` INSERT policy doesn't verify `conversation_id` ownership.**
`supabase/migrations/0002_evolusa_rls_policies.sql:128-129` checks only `auth.uid() = user_id` on insert, never that `conversation_id` belongs to that user. Currently dormant — zero application code reads or writes this table (confirmed via repo-wide grep) — so this is not live-exploitable today. It must be closed with a `WITH CHECK` addition before the Assistant feature is wired to any UI.
*Fix owner: supabase-architect. Effort: small (one migration).*

**Finding S-3 (Operational risk, unverifiable from this session, must be checked before deploy): Auth gate silently disables if Supabase env vars are absent.**
`proxy.ts` returns `NextResponse.next()` (i.e., no protection at all) when `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset — intentional for local preview/demo mode, but means **every account route becomes unprotected with no error or warning** if the real deployment target is missing these two env vars. This cannot be verified from this sandbox and must be confirmed against whatever actually serves this branch before any real traffic reaches it.

No Critical or High severity issues were found.

---

## Part 6 — Compliance Findings

*Full method: read every compliance policy file plus every rendered and unwired user-facing copy source, cross-checked against `data/compliance/claims.ts`'s enabled/disabled category list.*

### Confirmed compliant (no action needed)
- `data/compliance/claims.ts` / `data/compliance/regulatory-policy.ts` correctly gate every regulated category (LEGAL, IMMIGRATION, TAX, INSURANCE, NOTARY, BOOKKEEPING, BUSINESS_FORMATION) as disabled/requires-verification; only MARKETING and BUSINESS_OPERATIONS are live/direct.
- `data/services/services.ts` matches this policy exactly, and disabled-service copy already uses correct hedged language ("sujeto a verificación," "no constituye asesoría fiscal").
- The **rendered** home page (everything actually imported by `app/page.tsx`) consistently discloses the referral/non-advice boundary: `StageServices.tsx` filters via `isServicePublishable()` with an explicit "no mostramos servicios regulados" empty state; `data/home/faqs.ts` directly states EVOLUSA does not give legal/immigration advice and that the roadmap engine is deterministic, not AI-driven; `TrustAndTransparency.tsx` surfaces the OFFICIAL > EVOLUSA_GUIDE > PROFESSIONAL trust hierarchy visibly.
- No fabricated testimonial, rating, or outcome claim exists anywhere in the *rendered* app.

### Confirmed issues

**Finding C-1 (High — not live, but a landmine; resolve before merge/launch): four unwired legacy files contain fabricated testimonials and direct-provision claims for disabled regulated categories.**
`sections/home/Testimonials.tsx`, `Services.tsx`, `Process.tsx`, and `Benefits.tsx` are **not imported by `app/page.tsx`** (confirmed via repo-wide grep — no import path resolves to them) and therefore render to no user today. However:
- `Testimonials.tsx:4-23` contains three fabricated named testimonials with fake star ratings, claiming EVOLUSA already delivered LLC formation, bookkeeping/tax, and insurance/notary services — all currently `enabled: false` / `REQUIRES_VERIFICATION` in `data/compliance/claims.ts`.
- `Services.tsx:12-55` and `Process.tsx:3-46` use first-person direct-provision language for LEGAL/TAX/NOTARY/INSURANCE with zero disclaimer — e.g. `Process.tsx:8` ("Creamos LLC, Corporaciones, EIN...") and `Services.tsx` ("Preparación de impuestos...").
- `Benefits.tsx:13-30` echoes near-verbatim the exact `REQUIRES_VERIFICATION` claim text already flagged as unsafe in `claims.ts:19`.
`docs/EVOLUSA-PRODUCT-ARCHITECTURE.md:104-110` already earmarks these files as needing rewrite — this audit confirms the earmark is correct and the risk is real: if anyone re-wires one of these into `page.tsx` without rerunning compliance review, the boundary breaks with zero additional code changes. **Recommendation: delete these four files, or move them out of `sections/` entirely, before this branch merges.**

**Finding C-2 (Low, documentation-only):** The stale "VerifiedBadge not implemented" claims (D-2 above) also appear in a code comment, `app/profesionales/[slug]/page.tsx:12-14`, which should be corrected alongside the docs.

---

## Part 7 — QA Findings

*Independently re-run by the QA subagent; all numbers below were confirmed twice (once by this session, once by the subagent).*

| Check | Result |
|---|---|
| `npm run lint` | Pass — 0 problems |
| `npx tsc --noEmit` | Pass — clean |
| `npm test` | Pass — 35/35, 0 skipped/todo |
| `npm run build` | Pass — dynamic: `/assistant`, `/conexiones`, `/dashboard`, `/panel-profesional/oportunidades`, `/profesionales/[slug]`, `/profile`, `/roadmap`; static: everything else |
| `git diff --check` | Pass — clean |
| CI (`.github/workflows/ci.yml`) | Exists, triggers on PR to `main` or `feat/evolusa-migration` and on push to `feat/evolusa-migration`, runs `npm ci → lint → tsc → test → build` — exactly matches local checks, no drift |
| Route-protection coverage (`proxy.ts`) | All 6 authenticated routes covered, no gaps, no over-gating |
| console.log/debugger leftovers | None found repo-wide |
| TODO/FIXME/XXX comments | None found repo-wide |

**Finding Q-1 (Medium): Orphan route.** `/profesionales/[slug]` has **zero inbound links** anywhere in the app — no directory page, no card, no button. It is reachable only by typing the exact URL. Likely intended to be reached from the opportunity-matching flow once that link is wired (tracked as gap "B" in `EVOLUSA-OPPORTUNITY-EXPERIENCE.md`), but currently unreachable in practice.

**Finding Q-2 (Medium): Zero automated test coverage on the three modules that actually mutate/read state for the feature being launched.** `lib/account/persistence.ts` (187 lines, 7 exported functions), `lib/opportunities/persistence.ts` (261 lines, 7 exported functions including the entire opportunity create/consent/route/contact/complete/decline path), and `lib/professional/public-profile.ts` (42 lines) have no corresponding test file. The 35 passing tests cover pure logic (eligibility, matching, lifecycle state transitions, roadmap rules) well, but the actual database read/write layer is unverified by automation — by design, since it needs a live Supabase session, but this is a real gap the owner should either accept explicitly or close with integration tests against a test project.

---

## Part 8 — Launch Blockers, Classified

### P0 — Must resolve before any real user signup

| # | Blocker | Evidence | Owner |
|---|---|---|---|
| P0-1 | Legal/business placeholders in `config/brand.ts` (`legalName: "Por confirmar"`, phone/email/WhatsApp/website/hours all null) | `config/brand.ts:4,20,24,27-30` | Owner (business decision, not engineering) |
| P0-2 | Custom SMTP not configured — default mailer rate-limits after ~1-2 signups/hour | `docs/EVOLUSA-LAUNCH-CHECKLIST.md:7`, reconfirmed still open (unverifiable live, not contradicted by anything found) | Owner + engineering |
| P0-3 | Auth email templates still English defaults on a Spanish-first product | `docs/EVOLUSA-LAUNCH-CHECKLIST.md:8` | Engineering (Supabase dashboard) |
| P0-4 | ~~Email-enumeration leak in signup error message (Finding S-1)~~ — **FIXED**, commit `5dceafe` | `components/account/AuthFoundation.tsx` | frontend-engineer |
| P0-5 | Confirm the real deployment target actually has both Supabase env vars set, or the entire auth gate silently no-ops (Finding S-3) | `proxy.ts` env-presence branch | Owner/DevOps, pre-deploy checklist item |
| P0-6 | **Delete leftover throwaway test data from the live production Supabase project** — a professional row `qa-throwaway-professional-20260825` (Orlando, FL) is currently live and publicly readable through `professional_profiles_public`, alongside the real professional Daniela Torres. This contradicts every "cleanup verified" claim in `docs/CURRENT-STATE.md` for prior live-testing sessions. Found 2026-08-27 while building the `/profesionales` directory page (see Addendum below). Requires Supabase access this session does not have — owner or a Supabase-connected session must delete this row. | Live `professional_profiles_public` view, slug `qa-throwaway-professional-20260825` | Owner / operator with Supabase access |

### P1 — Should resolve before broad/public launch

| # | Item | Evidence |
|---|---|---|
| P1-1 | ~~Delete or rewrite the 4 dead compliance-violating files (Finding C-1)~~ — **RESOLVED:** all four unused files were deleted after confirming they had no imports. | `sections/home/{Testimonials,Services,Process,Benefits}.tsx` removed |
| P1-2 | Fix `assistant_messages` RLS gap before the Assistant feature is wired to any UI (Finding S-2) | `supabase/migrations/0002_evolusa_rls_policies.sql:128-129` |
| P1-3 | Correct `CURRENT-STATE.md`'s self-contradictions (Findings D-1 through D-5) so the handoff doc is trustworthy again | `docs/CURRENT-STATE.md` (multiple lines, see Part 4) |
| P1-4 | Decide and wire (or explicitly defer) an inbound link to `/profesionales/[slug]` (Finding Q-1) | Product decision |
| P1-5 | Close or explicitly accept the test-coverage gap on `lib/{account,opportunities}/persistence.ts` and `lib/professional/public-profile.ts` (Finding Q-2) | Engineering decision |

### P2 — Tracked, not launch-blocking

- Need→category mapping and regulatory allowlist duplicated between TypeScript and SQL (confirmed non-exploitable design debt).
- `UserGoal` collection UI missing (table exists, unused).
- Assistant not wired to a real AI provider (explicitly out of scope until chosen).
- Onboarding UI / `lib/roadmap/rules.ts` engine reconciliation (pre-existing tracked split).
- `reviewed_by` FK missing a covering index (pre-traffic, expected).
- Milestone 04D (opportunity creation/rematch UI) not yet built — the demand-creation side of the marketplace has no real UI today; only the read/act side (`/conexiones`, `/panel-profesional/oportunidades`) exists.

---

## Part 9 — Prioritized Execution Backlog

1. **Fix the signup email-enumeration message** (P0-4) — smallest, highest-value security fix available; one string change plus flow adjustment in `AuthFoundation.tsx`.
2. **Verify/set production Supabase env vars** (P0-5) — a checklist item, not code; must happen before any deploy regardless of what else is done.
3. **Delete or fully rewrite the 4 dead compliance-violating files** (P1-1) — pure risk removal, no functional loss since nothing renders them today.
4. **Close the `assistant_messages` RLS gap** (P1-2) — cheap now (schema-only), expensive to remember later once the Assistant UI exists.
5. **Rewrite `CURRENT-STATE.md`'s stale bottom section** (P1-3) — a documentation task, but directly reduces the risk of a future session (human or AI) making decisions on false premises. While in this file, also correct `supabase/migrations/0002_evolusa_rls_policies.sql:1-2`'s stale header comment ("NOT YET APPLIED. Must be reviewed by security-reviewer before apply_migration.") — the same staleness pattern, just in a SQL file; the migration's actual policy content is correct and unaffected.
6. **Owner supplies legal/business facts** (P0-1) — blocks nothing else in engineering, but blocks all compliant public copy; can run in parallel with the above.
7. **Configure SMTP + Spanish auth templates** (P0-2, P0-3) — a Supabase-dashboard task, not a code change; do this once P0-1 is resolved so the templates can reference real contact info.
8. **Decide the `/profesionales/[slug]` linking question and either wire it or defer with a written reason** (P1-4).
9. **Add integration-level coverage (or an explicit accepted-risk note) for the three untested persistence modules** (P1-5) — lower priority than the above since the logic they call (eligibility/lifecycle/match) is already well-tested; the gap is in the DB I/O wrapper layer.
10. **Milestone 04D** (opportunity creation UI) — the next real product milestone, independent of and not blocked by anything above, but a prerequisite for any real revenue (see Part 10).

---

## Part 10 — First-Revenue Plan

This is a sequencing plan, not a projection — no revenue figures, timelines, or legal conclusions are asserted, since none are substantiated by anything in this repository.

**What already works end-to-end (verified live-tested per `docs/CURRENT-STATE.md`, code-verified by this audit):** member need → eligibility check → one explainable professional match → member consent → routed opportunity → professional contact → completion, for exactly one category/jurisdiction pair (`BUSINESS_MARKETING`/`FL`).

**What's missing before that loop can produce real revenue, in dependency order:**

1. **Legal identity** (P0-1) — a business cannot be represented publicly, collect payment, or hold a professional relationship without a confirmed legal entity name and real contact channels. This is the actual first blocker; everything else can proceed in parallel but nothing can go *public* without it.
2. **Real signup throughput** (P0-2, P0-3) — SMTP + Spanish templates, so more than ~1-2 people/hour can actually create an account.
3. **A real way for a member to *start* an opportunity** (Milestone 04D) — today the create/consent RPCs have only ever been called directly during testing; there is no page a real user could visit to trigger the flow that already works. Without this, the engine has no demand-side entry point.
4. **Real supply** — currently exactly one live professional profile exists (Daniela Torres, demo account, unverified). A real first-revenue attempt needs a small number of genuinely onboarded, approved `BUSINESS_MARKETING`/`FL` professionals willing to receive routed opportunities, since the matching engine has nothing to match against otherwise.
5. **Close P0/P1 security and compliance findings first** (Parts 5, 6, 8) — an enumeration bug and fabricated-testimonial files are the kind of thing that costs far more to fix after real users/professionals are already on the platform than before.
6. **Soft-launch narrowly**: one category (`BUSINESS_MARKETING`), one state (`FL`), a small explicit cohort, before considering any regulated category — expanding into LEGAL/IMMIGRATION/TAX/INSURANCE/NOTARY requires the credential-verification work `data/compliance/claims.ts` already gates on, which is unbuilt (correctly, per design) and is a substantially larger effort than anything in this backlog.

No claim is made here about how much revenue this would generate or how fast — that depends on business decisions (pricing, professional terms, category expansion) entirely outside this repository's scope.

---

## Part 11 — Risks & Assumptions

- This audit assumes the live Supabase project's actual grants/RLS/advisor state matches the migration files reviewed. `CURRENT-STATE.md` itself documents at least one historical case where a live hotfix was applied before being reconciled into the file — the owner should re-run `get_advisors` and a grants diff against the live project before treating this audit's security section as fully current.
- The P0-2/P0-3 (SMTP, Spanish templates) blockers are carried forward from `docs/EVOLUSA-LAUNCH-CHECKLIST.md` as still-open; this audit could not independently reconfirm their live status (no Supabase access) and relies on the absence of any contradicting evidence.
- Findings in Part 4 about documentation staleness reflect what the code *does*, not what was *intended* — where intent matters (e.g., was the Home-cluster revert deliberate?), this is flagged as an open question (Part 12), not asserted as fact.

---

## Part 12 — Open Questions for the Owner

1. **Home-cluster resolution**: did commit `b8c5171` deliberately revert the uncommitted Hero/Header consolidation cluster back to the `4cb087b` baseline, or was that accidental? `CURRENT-STATE.md` still describes this as an unresolved, pending decision (Finding D-3) — the tree says otherwise.
2. **VerifiedBadge wiring**: was shipping `VerifiedBadge` into `ProfessionalProfileView` (Finding D-2) an intentional, reviewed decision, or did it slip in as a side effect of other Milestone-04 work without the "separate decision" review `EVOLUSA-PROFESSIONAL-NETWORK.md` calls for? It's safe today (renders nothing for the one unverified live professional) but the process gap is worth confirming.
3. **`/profesionales/[slug]` linking** (Finding Q-1, backlog item 8): should this wait for Milestone 04D, or be wired sooner as a standalone directory/browse page?
4. **Dead compliance-violating files** (Finding C-1): confirm with whoever owns the Home-cluster disposition whether `Testimonials.tsx`/`Services.tsx`/`Process.tsx`/`Benefits.tsx` are pending cleanup (delete) or intended to return in some rewritten form (in which case they need a full compliance pass before ever being wired back in).
5. **Test-coverage risk acceptance** (Finding Q-2): is the current live-testing-only verification of `lib/{account,opportunities}/persistence.ts` an acceptable ongoing practice, or does the owner want integration tests added against a disposable Supabase test project before the next milestone?

---

## Part 13 — Recommendation & Sign-off

**Recommendation**: Do not open real user signups or deploy publicly until all P0 items (Part 8) are closed. P1 items should be closed or explicitly, individually deferred by the owner before broad launch — none of them require large engineering effort. The engineering foundation (tests, lint, types, build, CI, RLS/auth architecture) is strong enough that none of this audit's findings represent a rebuild — this is a short, well-scoped remediation pass, not a redesign.

**Independent review**: This document was reviewed by an independent Code Reviewer subagent, which re-ran `npm run lint`/`npx tsc --noEmit`/`npm test`/`npm run build` itself and independently re-verified the file:line evidence behind every numbered finding and every P0/P1/P2 classification against the actual source files, not against this document's or the domain subagents' narrative.

**Verdict: APPROVED WITH CORRECTIONS** — three citation-precision corrections (CI trigger wording, a disclosure-function line range, and a testimonial-quote attribution) were identified and have been applied above; no finding was retracted, no severity was changed, and no new material risk was found. The reviewer additionally noted one further doc-staleness artifact (a stale "NOT YET APPLIED" header comment in `supabase/migrations/0002_evolusa_rls_policies.sql:1-2`, same root cause as Findings D-1/D-4), folded into backlog item 5 (P1-3) above.

**Status**: `DONE` — audit complete, independently reviewed and approved, no product source code changed.

---

## Addendum (2026-08-27, post-audit follow-up work) — Live test data found in production

While implementing P1-4 (wiring an inbound link to `/profesionales/[slug]`, previously an orphan route per Finding Q-1), a new `/profesionales` directory page was built reading the same `professional_profiles_public` view the existing profile page already used. Running it against the real dev environment (`.env.local`, which points at the live EVOLUSA Supabase project) surfaced **two** public professional rows, not one:

- `daniela-torres-marketing` — the known, intentional live demo professional.
- `qa-throwaway-professional-20260825` (Orlando, FL, `BUSINESS_MARKETING`, `es`) — **not previously known to this session**, and not mentioned as a currently-live row anywhere in `docs/CURRENT-STATE.md`. The date embedded in the slug suggests it was created two days before this discovery.

This row was already technically public (RLS/grants on `professional_profiles_public` permit anonymous reads of any approved row; nothing about it depends on the new directory page), but it was previously only reachable by guessing or already knowing its exact slug. The new `/profesionales` directory page makes it directly discoverable to any visitor, which is why this was caught now rather than remaining an invisible loose end.

**This was not created or approved by this session** — no throwaway professional was created, no live Supabase write occurred, and no Supabase project was linked at any point in this engagement. This is pre-existing data found via a read-only query using the same anon-key pattern every other page in this codebase already uses.

**Action needed**: an operator with Supabase access should confirm whether this row is still needed for any in-progress work and, if not, delete it (and verify cleanup the same way prior milestones in `CURRENT-STATE.md` document: row counts back to exactly the expected baseline). Tracked as P0-6 above. The `/profesionales` directory page itself was still shipped — it doesn't create this exposure, only reveals a pre-existing one, and withholding a real audit-driven fix would not have reduced the actual risk.
