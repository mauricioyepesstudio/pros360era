# Professional subscription test integration

This change prepares test-only Checkout and signed webhook routes. It does not enable professional billing, change pilot entitlements, migrate existing users, or modify the connection-fee webhook.

## Routes

- POST `/api/stripe/test-checkout`, JSON `{ "plan": "starter" | "professional" | "business" }`. Requires a real Supabase session, exact matching Origin, an explicitly allowlisted test user, an operator-provisioned test identity and a non-exempt professional subscription row. The Stripe account, price currency, amount and monthly interval are checked before creating Checkout. Repeated requests use Stripe idempotency keys. The success redirect never changes access.
- POST `/api/stripe/test-webhook`. Uses the raw body and Stripe SDK signature verification with the separate test signing secret. Rejects live/Connect events. Processes subscription lifecycle, Checkout completion, invoice paid and invoice payment failed by retrieving the current Subscription. Resolves ownership by a persisted Stripe customer ID. Persists state through a service-only, transactional, deduplicated RPC; older event timestamps cannot overwrite newer ones. State is observational test data, not paid entitlements. Equal-second events may require reconciliation; this is not production billing.

## Preview setup still required

1. Review `docs/professional-stripe-test-schema.sql` and apply it to the preview test database. This is a reviewable SQL setup script, not a claimed/applied migration. It deliberately does not provision test users or touch the seven exempt rows.
2. Provision a separate authenticated test user and owned professional profile, with a non-exempt subscription row. Insert its user/profile mapping into `professional_stripe_test_accounts`. Never use an existing exempt pilot profile.
3. Store a restricted Stripe test API key and webhook signing secret in sensitive preview environment variables. Do not commit credentials. Required values:
   - `PROFESSIONAL_STRIPE_TEST_ENABLED=true` (unset by default)
   - `PROFESSIONAL_STRIPE_TEST_USERS=<test-user-uuid>`
   - `PROFESSIONAL_STRIPE_TEST_ORIGIN=https://<exact-preview-origin>` (no trailing slash)
   - `STRIPE_PROFESSIONAL_TEST_KEY=<restricted-test-key>`
   - `STRIPE_PROFESSIONAL_TEST_WEBHOOK_SECRET=<test-endpoint-signing-secret>`
   - existing Supabase server configuration and service-role secret
4. Register the test webhook URL in the confirmed Real Group Studio account. Subscribe only to handled events: `customer.subscription.created`, `.updated`, `.deleted`, `.paused`, `.resumed`, `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`.
5. Complete hosted Checkout using Stripe test payment details. Confirm the test table receives the correct plan/status. Exercise failed payment, cancellation, signature rejection, retries and stale events. Verify the seven exempt rows and disabled production billing again.

Both routes reject Vercel production. Keep all test flags absent from production. Do not merge/enable production billing based on this preparation. Refund/dispute/fraud handling and reconciliation are not implemented for production.

## Catalog verified in Stripe shared test mode

Account `acct_1NucqoQbuB2Vh5F4` (Real Group Studio), explicitly chosen by the user for these existing tests:

| Plan | USD/month | Price |
|---|---:|---|
| Starter | 29 | price_1UYF3JQbuB2Vh5F4dSIlAg59 |
| Professional | 79 | price_1UYF3uQbuB2Vh5F4OuoyPRkR |
| Business | 149 | price_1UYF4IQbuB2Vh5F4MpAwaqAy |

## Validation

Local Node 24: three policy tests pass (disabled/default/production/live-key restrictions, catalog input validation, lifecycle snapshot mapping and rejection of live or unknown prices). These are unit tests, not hosted Checkout, real signature verification, SQL/RLS, or end-to-end validation. Full repository lint, typecheck, tests and build must be checked in CI.

Supabase read-only baseline: seven `professional_subscriptions` rows are `pilot`/`pilot`, all `billing_exempt=true`, none linked to Stripe customers/subscriptions. No remote SQL changes or test payments have been performed by this change.

Before any future live launch, review Stripe Tax registrations and the recurring payment tax setup: https://docs.stripe.com/billing/taxes/collect-taxes . Tax collection is not enabled by this test change.
