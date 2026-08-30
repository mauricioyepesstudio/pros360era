# EVOLUSA — Opportunity Start Flow

Implementation handoff for Milestone 04D at `/conexiones/nueva`.

## Boundary

The browser collects only `needId`, optional city, consultation mode, readiness, and the member's explicit consent categories. It may receive the allowlisted approved/public professional summary added by Milestone 04E, but never an internal professional identifier, the organic match score, or a database/provider error object. The database RPCs remain the authorization and matching boundary.

## Modules

- `components/opportunities/NewOpportunityFlow.tsx` owns async orchestration and phase transitions.
- `components/opportunities/start/OpportunityStartForm.tsx` renders the accessible submit form.
- `components/opportunities/start/OpportunityConsentStep.tsx` renders the explicit consent checklist.
- `components/opportunities/start/OpportunityStartResult.tsx` renders safe error/no-match/success outcomes.
- `lib/opportunities/start.ts` contains pure city normalization, consent selection, validation, and retry-state logic.
- `lib/opportunities/errors.ts` maps the small Server Action failure contract to safe Spanish copy.
- `tests/opportunity-start-flow.test.ts` protects the pure flow rules.

## Retry behavior

A creation failure returns to the initial form. A consent failure returns to the consent step for the same `opportunityId`; it must never restart creation and produce a duplicate `CREATED` opportunity.

## Data disclosure rule

`createQualifiedOpportunity` returns the opportunity ID, whether a match exists, and—when migration 0010 is available—the allowlisted public professional summary. `createOpportunityAction` explicitly reconstructs this result. `organic_match_score`, internal professional IDs, and raw Supabase errors stay server-side.

## Verification

The flow is covered by the repository-wide lint, TypeScript, unit-test, and production-build checks. Authenticated browser submission must use an approved test account/environment because submitting the form writes a real opportunity.
