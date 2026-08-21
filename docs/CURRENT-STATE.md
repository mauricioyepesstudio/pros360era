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

End-of-day portable handoff checkpoint, covering: the real Supabase account backend (Phase 2), its live end-to-end validation (Phase 2.5), and the Premium Public Experience V1 redesign of Header/Hero/StageSelector/Core Belief/Journey/Roadmap Preview.

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
