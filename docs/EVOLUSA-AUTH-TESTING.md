# EVOLUSA — Auth & End-to-End Testing Log

Record of the Phase 2.5 real-user lifecycle validation: what was tested, how, what blocked a fully "organic" test, and the exact production requirement that blocker points to.

## Auth configuration (confirmed, not guessed)

Read directly from Supabase's public GoTrue endpoint, `GET https://ovialqdazxkekvqqgdiu.supabase.co/auth/v1/settings` (no auth required, standard read-only endpoint):

```json
{
  "external": { "email": true, "...all social providers": false },
  "disable_signup": false,
  "mailer_autoconfirm": false,
  "phone_autoconfirm": false,
  "sms_provider": "twilio"
}
```

- Only the `email` provider is enabled — no social providers, as required.
- `disable_signup: false` — signup is open.
- `mailer_autoconfirm: false` — **email confirmation is genuinely required** before a new account can sign in. This isn't a guess or a misconfiguration to fix; it's the correct, safe default and should stay on for production.

## The blocker

Supabase's built-in (non-custom-SMTP) mailer is rate-limited — confirmed twice this session:

1. First signup attempt this project: `over_email_send_rate_limit` on the second attempt shortly after the first.
2. Phase 2.5 test: the first real signup (`evolusa.qa.validation.20260821@gmail.com`) succeeded and sent a confirmation email; a second signup attempt for a comparison test user hit `over_email_send_rate_limit` again immediately after.

This means: (a) I cannot reliably send more than one or two confirmation emails per hour without custom SMTP, and (b) even when a confirmation email does send, it goes to whatever address was used — I have no way to read an external inbox, so I cannot click a real confirmation link myself.

A related, separate finding from earlier in this phase: Supabase's signup endpoint rejects `example.com`-formatted addresses outright (`email_address_invalid`) — a deliberate anti-abuse check, not something to route around.

## The workaround used (approved by you before use)

For **one** clearly-labeled throwaway test account (`evolusa.qa.validation.20260821@gmail.com`, a fabricated address I don't control and never will), after real signup via the public API, I set `email_confirmed_at = now()` directly in `auth.users` via SQL. This is the same effect as Supabase's own `admin.createUser({ email_confirm: true })` API — a normal, sanctioned way to pre-confirm one specific account — and it does **not** change `mailer_autoconfirm` or any project-wide setting; every other signup still requires real confirmation.

A second attempt to fabricate a second logins-capable test user by hand-inserting `auth.identities` rows was **blocked by this session's own safety classifier** (it resembles identity-forgery, even with benign intent) — I did not attempt to route around that block. Instead, cross-user isolation was verified by directly impersonating a different `auth.uid()` via Postgres session variables (`role authenticated` + `request.jwt.claims`) against the real test user's real data — a narrower technique that never touches identity or confirmation state at all.

## What was actually tested, live, in a browser

1. **Signup** — real request to Supabase Auth, real user row created, real confirmation email dispatched. ✅ code path confirmed correct; but genuinely reaching "confirmed" required the workaround above, not an organic click. ⚠️
2. **Email confirmation** — not organically completed (no mailbox access); simulated via the approved one-account workaround. ⚠️
3. **Login** — real `signInWithPassword` against the pre-confirmed test account, succeeded, redirected to `/dashboard`. ✅
4. **Onboarding** — completed the full public `/onboarding` flow (stage: Emprende, time: 6–24 months, goal: crear un negocio, employment: trabajo por mi cuenta, business: quiero iniciar uno, needs: Negocio + Finanzas). ✅
5. **Profile persistence** — on first dashboard load post-login, `syncOnboardingAction` fired automatically (confirmed in server logs with the exact mapped payload) and the dashboard immediately showed stage "Emprende". ✅
6. **Roadmap generation** — the deterministic account roadmap engine correctly surfaced business- and finance-related "Ahora" items based on the persisted `businessStatus`/`selectedNeeds`, and correctly omitted the work-employment item (since employment was self-employed, not employed). ✅
7. **Task completion** — clicked "Marcar como completado" on "Ordena tus finanzas básicas"; it moved to the "Completado" column immediately. ✅
8. **Life event** — toggled "Quiero crear una empresa"; UI showed "1 cambio guardado en tu cuenta." ✅
9. **Dashboard reflects persisted state** — confirmed after a full page navigation (server round-trip, not client cache). ✅
10. **Logout** — clicked "Cerrar sesión"; subsequent visit to `/dashboard` redirected to `/login`, confirming the session was actually cleared server-side. ✅
11. **Login again** — same credentials, succeeded. ✅
12. **State persists across logout/login** — stage, completed task, and life event were all still present and correct after re-login. ✅
13. **Cross-user RLS isolation** — a different authenticated identity's `SELECT`/`UPDATE`/`DELETE` against the real test user's real `profiles`/`roadmap_items`/`life_events` rows all returned/affected zero rows; a cross-user `INSERT` attempt was hard-rejected (`42501`). Re-verified afterward that the real user's data (task still `COMPLETED`, life event still present) was untouched. ✅
14. **Cleanup** — the throwaway test user and all its cascaded rows (`profiles`, `roadmap_items`, `life_events`, `onboarding_responses`) were deleted. Project confirmed back to 0 rows across every table. ✅

## What production SMTP setup will require

To move past the default mailer's rate limit and reliably confirm real users:

1. Choose an email-sending provider (e.g. Resend, Postmark, SendGrid, Amazon SES) — a decision only you can make (cost, existing accounts, deliverability reputation).
2. Verify a sending domain with that provider (DNS records — SPF/DKIM/DMARC).
3. In the Supabase Dashboard → Project Settings → Auth → SMTP Settings, enter the provider's SMTP host/port/credentials and a "from" address on the verified domain.
4. Optionally customize the confirmation/magic-link/reset-password email templates (same settings area) to match EVOLUSA's Spanish-first voice — currently using Supabase's default English templates, which is a real, visible gap for launch (a Spanish-first product sending an English confirmation email) worth fixing before real users sign up.

None of this can be done via MCP/CLI — it requires the Supabase Dashboard and a decision on which provider to use, which is why it's listed as a blocker for you rather than something completed this session.
