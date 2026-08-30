# EVOLUSA — Launch Checklist

Consolidated from the product/compliance requirements in `docs/EVOLUSA-MVP.md` and everything learned building and validating the Phase 2 backend. Grouped by who can close each item — this session already closed what it could; everything below needs Mauricio, a business decision, or a future engineering pass.

## Blocking for any real user signup

- [ ] **Custom SMTP configured** in Supabase Auth settings (see `EVOLUSA-AUTH-TESTING.md` for the exact steps and provider decision). Without it, only ~1-2 real signups per hour are possible before the default mailer rate-limits.
- [ ] **Auth email templates translated to Spanish** — currently Supabase's English defaults; a Spanish-first product sending an English confirmation email is a real, visible gap.
- [ ] **Decide on Supabase region**: currently `us-west-2`. Free to move to `us-east-1` right now (database is empty) if South Florida latency matters enough to justify recreating the project; otherwise fine to keep as-is for MVP.

## Business/legal facts only Mauricio can supply (blocks compliant public copy)

Per `config/brand.ts`, still placeholders:

- [ ] Legal entity name (`legalName: "Por confirmar"`)
- [ ] Public phone number
- [ ] Public email address
- [ ] WhatsApp number
- [ ] Website domain
- [ ] Business hours

Per `docs/EVOLUSA-MVP.md` "Launch dependencies" (unchanged, still open):

- [ ] Verify legal entity and public brand name
- [ ] Verify ownership of domain, email, phone, WhatsApp
- [ ] Inventory direct services and fulfillment owner
- [ ] Verify professional/partner credentials, jurisdictions, referral terms/disclosures for any regulated service before it's ever enabled (`data/compliance/claims.ts`'s `requiresVerification` categories)
- [ ] Obtain image/testimonial consent and substantiate any claims before adding them
- [ ] Approve retention, deletion, privacy, consent, incident process
- [ ] Define lead owner, hours, response expectation, escalation
- [ ] Select CRM/booking/analytics after requirements and privacy review

## Engineering follow-ups (not blocking MVP, but tracked)

- [ ] Reconcile the onboarding UI's answer shape with the deterministic `lib/roadmap/rules.ts` engine, or formally retire one of the two roadmap paths — see "What's deliberately not done yet" in `CURRENT-STATE.md`.
- [ ] Build a UI for `UserGoal` collection (`user_goals` table exists, unused).
- [ ] Wire the assistant to a real provider once one is chosen — explicitly out of scope until decided.
- [ ] `tests/account-roadmap.test.ts` and `tests/roadmap.test.ts` both now run via `npm test`; keep adding tests here as new deterministic behavior is added (auth/RLS behavior itself is validated via the live database tests documented in `EVOLUSA-AUTH-TESTING.md`, not unit tests, since it depends on a real Postgres/Auth server).

## Already done and verified (do not re-block on these)

- [x] Removed the four unused legacy Home files containing unsubstantiated testimonials and direct-service claims for disabled regulated categories.
- [x] Supabase project provisioned, schema + RLS applied and advisor-clean.
- [x] Real signup/login/logout/session-restoration/protected-routes implemented and reaching the live Auth API.
- [x] Full real user lifecycle (signup → onboarding → persistence → task/life-event → logout/login → data still there) walked through live and confirmed — see `EVOLUSA-AUTH-TESTING.md`.
- [x] Cross-user RLS isolation verified twice against real live data, not just reviewed.
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` all clean.
- [x] Dev server runs on `localhost:3002` as required.
- [x] No secrets committed; `.env.local` gitignored, `.env.example` has placeholders only.

## Do not do without explicit approval (carried forward from every prior phase)

- Push, merge to `main`, or deploy.
- Create/delete/rename/pause the Supabase project, or touch BELONG Labs / `belong-platform`.
- Enable billing or upgrade the Supabase plan.
- Flip any regulated service category to enabled/direct without verified credentials.
- Connect a paid AI provider for the assistant.
- Configure Stripe or any other production financial system.
