# EVOLUSA — Roadmap Engine

## Purpose

The v1 Roadmap is a deterministic educational/operational routing engine. It accepts a small `Partial<RoadmapAnswers>` object and returns `completed`, `now`, and `upcoming` items plus a primary stage, version, and mandatory disclaimer.

It does not use AI and must not offer individualized legal, immigration, tax, financial, or insurance advice.

## Implementation

- `lib/roadmap/types.ts`: answers, questions, items, rules, and result contracts.
- `lib/roadmap/questions.ts`: short question bank with conditional visibility.
- `lib/roadmap/rules.ts`: reusable items and ordered deterministic rules.
- `lib/roadmap/generateRoadmap.ts`: evaluation, deduplication, precedence, limits, fallback, and stage inference.
- `tests/roadmap.test.ts`: five required behavior scenarios using `node:test`.

## Evaluation behavior

1. Evaluate rules in declared order.
2. Place matching items into their requested result bucket.
3. Add safe orientation when `now` is empty.
4. Remove completed items from `now` and `upcoming`.
5. Remove current items from `upcoming`.
6. Deduplicate by stable item ID.
7. Limit current priorities to three and upcoming items to five.
8. Return version `1.0.0` and the educational disclaimer.

The engine tolerates incomplete answers. `unsure` is not silently interpreted as `no`; the fallback offers orientation.

## Add a question

1. Add the key/value type to `RoadmapAnswers` and, if a stage references it, `RoadmapQuestionId`.
2. Add the prompt/options to `roadmapQuestions`.
3. Use `showWhen` only for clear dependency logic.
4. Explain why optional contextual data is requested.
5. Do not request sensitive identifiers or detailed immigration facts in the MVP.

## Add a rule

1. Define/reuse a `RoadmapItem` with stable ID, stage, priority, optional service, disclaimer, and safe CTA.
2. Add an ordered `RoadmapRule` with a pure `when` predicate.
3. Avoid professional conclusions; recommend review/connection when licensure may apply.
4. Test a positive match, a non-match, precedence, and incomplete inputs.
5. Increment the rules/result version when behavior changes materially.

Rules must be explainable from answers and should never depend on analytics, CRM state, or hidden profiling.

## Tests

Run `npm run test:roadmap`. Scenarios cover a newly arrived user without a business, an aspiring founder, an existing business without digital presence, an existing business needing organization, and incomplete answers.

Before production, add schema validation at the request boundary and a validation test ensuring all service/stage IDs resolve.
