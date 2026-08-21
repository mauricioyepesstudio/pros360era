# EVOLUSA — Data Model

## Sources of truth

- `data/compliance/claims.ts`: fulfillment types, service categories, claims, disclaimers, category defaults, and publishability guard.
- `data/journey/types.ts`: stable stage IDs and Journey contracts.
- `data/journey/stages.ts`: the six stages, content, services/resources, lead intent, questions, and CTA.
- `data/journey/intents.ts`: six customer-language selector choices and their stage/lead mapping.
- `data/services/types.ts`: service contract.
- `data/services/services.ts`: canonical service catalog and enabled-service view.
- `data/home/sections.ts`: non-interactive Home section content.
- `config/brand.ts`: provisional verified/placeholder brand, contact, locale, and token values.

Components consume these modules; they must not introduce parallel service or stage catalogs.

## Compliance model

`FulfillmentType` is `DIRECT`, `PARTNER`, `REFERRAL`, `EDUCATIONAL`, or `REQUIRES_VERIFICATION`. It describes delivery, not the marketing category. A regulated category remains disabled until provider, credentials, jurisdiction, scope, and disclosures are confirmed.

`isServicePublishable(category, verified)` is a base guard, not a complete authorization system. `service.enabled` remains an explicit publishing decision. Both must be satisfied in a future service-page loader.

Claims have `ALLOWED`, `REQUIRES_VERIFICATION`, or `PROHIBITED` status. Add a safe alternative when useful. Do not change status based solely on a marketing preference.

## Add a stage

1. Add its stable ID to `stageIds` and icon union in `data/journey/types.ts`.
2. Add a complete `JourneyStage` entry in order in `data/journey/stages.ts`.
3. Add or map customer intents only if the selector needs a new entry.
4. Add the icon mapping to `JourneyOverview`.
5. Create referenced services/resources before enabling links.
6. Add roadmap routing/rules and tests.
7. Review localization, analytics naming, and compliance.

Stage IDs are data keys and should not be casually renamed. Slugs may be localized separately later.

## Add a service

1. Choose a service category and review its compliance default.
2. Add an `EvolusaService` with unique ID/slug and valid stage IDs.
3. Set `fulfillmentType`, `requiresVerification`, and `enabled` independently and honestly.
4. Keep unverified or regulated offers disabled.
5. Define provider-neutral summary, full description, CTA, lead type, WhatsApp text, SEO, and relations.
6. Reference its ID from stages/rules only when useful.
7. Add tests for any roadmap behavior and validate all related IDs.

## Integrity rules

- One canonical record per stage and service.
- Use IDs for relationships, not duplicated objects.
- Never put sensitive personal data in static data modules.
- Never use placeholder contact values as outbound destinations.
- Validate relational integrity in a later automated data test before route generation.
