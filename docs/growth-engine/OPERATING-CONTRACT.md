# EVOLUSA Growth Engine — Operating contract (v1)

Date: 2026-11-11. Owner: Real Group Entertainment LLC. Scope: EVOLUSA only.

## What is implemented now

- Public /growth-engine catalog with 10 market segments and programmatic links to EVOLUSA contact.
- Four live-profile specialties in the existing /servicios-miami flow (marketing, notary, document support, finance/operations).
- Profile/CRM/opportunity/social functionality may exist in the current EVOLUSA application, **but an individual company's integration is not considered operational until tested with that company's consent and credentials**.
- No automated revenue attribution, multi-organization provisioning, partner vetting, cross-vertical matching, or guaranteed acquisition is claimed in this release.

## Non-negotiable isolation

- One legal client = an independent tenant ID and owner-controlled users/roles.
- No connection tokens, account identifiers, ad data, message history, customer contacts or opportunities are copied between Resource Living, EVOLUSA, or other customers.
- Shared technology can transfer only through source code, templates, tests, anonymized metrics or documented learnings that contain no customer data.
- Professionals own and approve publication to their connected channels. Laura and Miguel are listed in EVOLUSA only; do not post to their pages.
- Potentially regulated services need verified license or authorization appropriate to the activity and jurisdiction before opening delivery or collecting specialized fees.

## First production workflow to complete

1. Visitor selects one market and a specific business requirement.
2. EVOLUSA collects contact details only after displaying purpose, destination and a consent choice.
3. Server creates exactly one idempotent prospect inquiry with source, time, intended category and tenant scope.
4. Assign to one eligible, available business based on owner-approved routing rules; no hidden multi-recipient email.
5. Notify the assigned professional only; copy internal staff through explicitly configured CC (not parallel duplicate emails).
6. Track delivery accepted vs delivered vs opened vs contacted vs scheduled vs converted. Never conflate transport acceptance with delivery or revenue.
7. Every inquiry has a next action and owner, with a safe failure queue and retry policy.
8. A sale is counted only upon evidence of a completed transaction or an authorized confirmation; track gross revenue, expenses, and any legally permitted fee separately.

## Proposed entities before implementing storage

- organizations: id, legal name, business status, active plan.
- memberships: organization_id, user_id, role.
- growth_verticals: globally readable fixed industry catalog.
- organization_capabilities: organization_id, capability_id, enabled_at and configuration state.
- inbound_inquiries: organization_id, external_source_id (unique within origin), consent version, source, service, created_at.
- inquiry_assignments: inquiry_id, organization_id, assigned professional, consent scope, delivery status; single exclusive assignment by default.
- commercial_activities: inquiry_id, action, actor, created_at, next_action_at.
- conversions: inquiry_id, amount, currency, evidence reference, verified_at, legal fee terms.
- integrations: organization_id, provider, encrypted credentials reference, permission scopes, state.
- consent_events: consent version, subject, purpose, destination, recorded_at.

**Do not create these tables until ownership, RLS, permission boundaries, backfill and rollback have tests.** No client PII should be stored in this public catalog.

## Sector adaptations

- Marketing/business: proposals, campaign/source attribution, reporting.
- Notary: appointment request, document type, permitted service verification; no automated legal advice.
- Document support / immigration: strict distinction between document preparation and authorized legal guidance.
- Finance / insurance / real estate: verified professional authorization and permitted referral/payment models.
- Construction: service classification, service area, contractor qualification and exclusive vs consented routing.
- VIP transport: operator licensing, driver/vehicle insurance, service availability.
- Translation: languages, credential expectations, project quote.
- Relocation: local services, provider selection and consent-controlled introductions.

## Measure progress

- Acquired visitors, consented inquiries, qualified inquiries, successfully assigned inquiries.
- Attempts, delivery accepted, confirmed delivery when supported, contacted within SLA, appointments, wins.
- Customer acquisition cost (only when spend and conversions are attributable), revenue verified (not pipeline value), customer retention.
- Segment reporting scoped to its organization; no shared business intelligence built on private customer records.

## Deployment gate

A claim moves from `planned` to `pilot` only after it has a working code path, test evidence and authorized account access. A claim moves from `pilot` to `live` only after authenticated end-to-end tests, audit logs, failure handling and business-owner signoff.

## Hiring and purchasing gate

Potential collaborators: licensed industry compliance reviewer, product/UX designer, backend security engineer, CRM/email deliverability specialist, performance marketing operator. Recruit only for demonstrated gaps. Obtain scope, quote, data-access limits, NDA and owner's spending approval before offering a contract or transferring access.

## Immediate next engineering milestone

Build a tenant-scoped **inquiry + assignment + delivery audit** with RLS and idempotency, followed by an authenticated four-professional test. Keep open directory, marketing pages and CRM functional during migration. No more than one production recipient per exclusive opportunity unless the customer explicitly chooses otherwise.
