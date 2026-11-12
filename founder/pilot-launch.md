# EvolUSA — Pilot launch and verification gates
Date opened: 2026-11-12
Owner: Real Group / EvolUSA
Scope: staging first, then limited invited real customers. This is a validation protocol, not evidence of customers already created.

## 0. Protected test identities
- Use fictional identities only in isolated `/demo/profesionales` and clearly mark all sample content.
- Use separate seed datasets with `is_demo=true` or an equivalent isolated namespace and RLS; never fake approved professionals in the real `professional_profiles_public` view.
- For actual E2E auth testing, create dedicated test accounts in nonproduction with distinct emails and private credentials handled outside Git. Never use the existing professional's real credentials for a test.
- A demo account cannot message, book, charge, share private data, post to socials or trigger external notifications.
- Delete test data with a documented cleanup procedure and check no orphaned leads remain.

## 1. Product quality gate (blocking)
- Verify 8 demos load, show different category-specific modules and no invented real outcomes.
- Verify actual public profiles Laura, Miguel, Marie, Mauricio, Daniela and brand correctly show their approved fields, authorized images and contact links. Avoid tracking image URLs with expiring signed tokens.
- Desktop/mobile QA: image framing, overflow, typography, contrast and contact CTA.
- Public intake must collect name, email or phone, service need, city/region (where appropriate), language, consent, and intended professional; store data only behind authenticated server validation and scoped RLS.
- Every lead must generate a unique idempotency key, avoid duplicate delivery, assign one authorized recipient and show status `new -> assigned -> contacted -> qualified -> won/lost`.
- Verify notification delivery via provider event/receipt, not just SMTP submission; provide opt-out and retention controls.
- For regulated categories do not expose booking, legal advice, insurance quote or license claims before real verification.

## 2. First real-world commercial test
- Initial narrow offer: marketing/operations providers first (currently supported in matching) with a working profile + tracked inquiry + follow-up.
- Onboard 3 invited real professionals with explicit consent; free pilot for existing participants. Separate potential paying prospects from current pilot professionals.
- Present *draft* price ranges only as hypotheses, never advertised as available plans; collect willingness-to-pay and onboarding objections through interviews.
- Test target (not observed): 3 invited professionals completing onboarding and 10 legitimate inquiries across test period, with 100% correct ownership/routing and zero duplicates or disclosure to other recipients.
- If technical acceptance fails, pause external marketing and resolve before increasing traffic.

## 3. Metrics (define event schema before collecting)
- profile_view (consented/aggregated)
- cta_click (profile, service and destination type; avoid PII in analytics payload)
- lead_created (server-side, unique)
- lead_assigned (recipient/tenant, auditable)
- first_contact_at and contact_latency
- opportunity_stage_changed
- consultation_booked and customer_won (only when verified)
- subscription_started, canceled, monthly cost per tenant, support hours
Primary measures: view-to-inquiry rate, inquiry-to-contact rate, inquiry-to-customer rate, percent duplicate leads, cost-to-serve per tenant and paid conversion.

## 4. Founder Skill review
Source: https://github.com/Jakeschincariol/founder-skill (MIT; Claude Code plugin, 11 skills).
Install target (later, after review): project-local `.claude/skills/` under `pros360era`, pinned to a reviewed commit, not arbitrary upstream latest.
Prioritize board -> competitors -> consumer quick (20 simulated buyers) -> pricing -> offer -> CFO -> launch. Use synthetic buyer answers as research, not proof of demand.
Before use: inspect all SKILL.md and Python helper files, check licenses, command safety, project permissions and tool output behavior; do not execute remote install scripts or allow writes to production.
No actual financial go/no-go verdict until costs, pricing and real buyer results are available.

## 5. Release criteria
- Green build plus actual desktop/mobile smoke tests.
- No leakage of test identities into public directory; real listings only for approved accounts.
- Lead E2E evidence: form -> database -> correct professional -> status update -> notification receipt.
- Billing tests in Stripe test mode only, no charge to existing pilot profiles.
- Explicit legal/compliance check for notary, migration-document support, realtor, tax and insurance content.
- Review weekly after first 7, 14, 30 days of launch (relative to actual launch date, TBD).

## Decisions
- First paid test should be narrow, not launch all 8 demos as active professions.
- Real customer creation is an E2E test only if accounts have authorized owners, verification and no spurious outbound communications.
- Initial objective is verified paid willingness-to-pay and cost of service, not vanity signups.
