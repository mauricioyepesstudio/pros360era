---
name: evolusa-compliance
description: Repeatable check for any EVOLUSA copy, service listing, claim, or assistant-facing text against the professional-services compliance boundary. Use before publishing marketing copy, a new service entry, or assistant response templates.
---

# EVOLUSA compliance check procedure

Source of truth: `data/compliance/claims.ts` — `fulfillmentTypes`, `claims` (status `ALLOWED` / `REQUIRES_VERIFICATION` / `PROHIBITED`), `disclaimers`, `serviceCompliance`, and `isServicePublishable()`.

## What EVOLUSA must never claim to be

A law firm, an attorney, an immigration authority, a CPA firm, an insurer, a financial institution, or a government agency.

## Procedure for any new or changed claim/copy

1. **Search `claims.ts` for an existing entry** matching the substance of the claim (not just exact text — e.g. any wording that implies a guaranteed outcome maps to `guaranteed-outcome`, which is `PROHIBITED`).
2. If no entry exists, classify it yourself using this rule of thumb:
   - States a fact about EVOLUSA's own scope/process, non-absolute → likely `ALLOWED`.
   - Implies a licensed professional's individualized judgment, credential, or determination (legal, immigration, tax, insurance eligibility) → `REQUIRES_VERIFICATION` at best, often `PROHIBITED` until a real verified professional/provider is attached.
   - Uses absolute/guaranteed language ("garantizado", "100%", "siempre calificarás") → `PROHIBITED`.
3. **For `REQUIRES_VERIFICATION` claims**: do not ship them. Either use the `safeAlternative` field if one exists, or hold and ask the user for the missing verification (professional identity, license, jurisdiction) — this is a business fact, not something to infer or fabricate.
4. **For services in a regulated category** (`LEGAL`, `IMMIGRATION`, `TAX`, `INSURANCE`, `NOTARY`, `BOOKKEEPING`, `BUSINESS_FORMATION`): confirm `serviceCompliance` still has `requiresVerification: true` and `enabledByDefault: false` unless the user has explicitly confirmed verification is complete for that specific offering.
5. **Check disclaimer coverage**: any content in a category listed under a `Disclaimer.appliesTo` must actually render that disclaimer nearby (`general-education`, `regulated-services`, `roadmap-guidance`).
6. **Check trust-source labeling**: content must be visibly attributed to one of `OFFICIAL` (government/official program), `EVOLUSA_GUIDE` (EVOLUSA's own educational guidance), or `PROFESSIONAL` (a named, verified professional/partner) — never blur these into one undifferentiated "we" voice.
7. **Referral transparency**: any `PARTNER`/`REFERRAL` fulfillment type discloses the third party's identity and the nature of the relationship — never present a referral as if EVOLUSA performed the service directly.
8. **No fabricated proof**: reject invented statistics, testimonials, ratings, team size/experience claims, or "trusted by X" language that isn't backed by something the user has verified is true.

## Output format

For each claim/copy reviewed: `ALLOWED` / `REQUIRES_VERIFICATION (blocked — needs: ...)` / `PROHIBITED (reason, safe alternative if any)`.
