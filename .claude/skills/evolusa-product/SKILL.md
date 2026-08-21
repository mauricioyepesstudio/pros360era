---
name: evolusa-product
description: Repeatable procedure for adding or changing anything in EVOLUSA's product surface (stage, service, roadmap item, life event, or account screen) without fragmenting the product model. Use before adding a route, a data entry, or a new account concept.
---

# EVOLUSA product change procedure

EVOLUSA's product is one domain model — stages, milestones/services, roadmap items, life events, tasks — that powers marketing, qualification, and the account experience. There must be exactly one canonical source for each concept.

## Before adding anything, locate its canonical home

| Concept | Canonical file |
| --- | --- |
| Journey stage | `data/journey/types.ts` (IDs), `data/journey/stages.ts` (content) |
| Selector intent (customer language) | `data/journey/intents.ts` |
| Service/offering | `data/services/types.ts`, `data/services/services.ts` |
| Compliance/claims/fulfillment type | `data/compliance/claims.ts` |
| Account domain types (goals, roadmap item, task, life event, user profile) | `data/account/types.ts` |
| Account seed/fixture data | `data/account/foundation.ts` |
| Deterministic roadmap rules | `lib/roadmap/rules.ts`, `lib/roadmap/generateRoadmap.ts` |
| Account-level roadmap engine (persistence-aware) | `lib/account/roadmap-engine.ts` |

If the thing you want to add doesn't fit one of these, it needs a new typed module — not a hardcoded value in a component.

## Procedure

1. **Classify** the change: is it a new stage, service, roadmap category, task, life event, or UX-only change? Each has a different canonical file (table above).
2. **Extend the type first.** Add/change the TypeScript type before writing any UI or copy. `RoadmapCategory`, `RoadmapStatus`, `TrustSource` in `data/account/types.ts` are the enums most new concepts should slot into — don't invent parallel ones.
3. **Check compliance status.** If the change touches a regulated category (`LEGAL`, `IMMIGRATION`, `TAX`, `INSURANCE`, `NOTARY`, `BOOKKEEPING`, `BUSINESS_FORMATION`), it must default to disabled/referral per `data/compliance/claims.ts` — do not flip this without explicit business sign-off (see `evolusa-compliance` skill).
4. **Wire the deterministic rule**, if the change affects what the roadmap recommends — add a rule to `lib/roadmap/rules.ts` and a test in `tests/`. Never route this decision through an LLM; the roadmap engine must stay deterministic and explainable.
5. **Reuse UI primitives** from `components/ui/` before adding a new one.
6. **Verify journey coherence**: every new roadmap item/stage/task must map to one of the six fixed stages (LLEGA → ESTABLÉCETE → EMPRENDE → PROTÉGETE → CRECE → EVOLUCIONA). If it doesn't fit any of them, that's a signal the change is out of scope for this phase — flag it rather than forcing a fit.
7. **Add/extend a test** under `tests/` for any new deterministic behavior.
8. **Update the relevant `docs/EVOLUSA-*.md`** doc so the model stays documented, not just implemented.

## Hard no's

- No second/parallel catalog of stages or services in a component — always import from `data/`.
- No forcing account creation before a user has seen a useful preliminary roadmap result.
- No collecting SSN, passport numbers, immigration case details, medical information, bank credentials, or government passwords anywhere in this product.
