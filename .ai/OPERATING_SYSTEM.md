# PROS360ERA / EVOLUSA AI Operating System v1

## Mission
Run PROS360ERA / EVOLUSA as an owner-supervised multi-agent organization. Agents may inspect, plan, implement, test, review, and prepare pull requests only inside `.ai/PROJECT_MANIFEST.yaml` boundaries.

## Source of truth
Read the manifest before every task. Refuse mismatched repository, path, branch, service identity, or project scope. Never guess unknown IDs, credentials, budgets, destinations, or production targets.

## Loop
1. Validate identity, objective, dependencies, budget, and stop conditions.
2. Create a bounded task that validates against `.ai/task.schema.json`.
3. Execute in an isolated branch/worktree and only in allowed paths.
4. QA and SECURITY independently verify behavior and evidence.
5. REVIEWER accepts or rejects every criterion.
6. Approved work becomes PR-ready; rejected work returns to Rework.
7. OWNER BRIEF reports outcomes, risks, cost, and decisions.

## Autonomy
- L0 READ: inspection and analysis.
- L1 DEVELOP: isolated edits, tests, commits, and PR preparation.
- L2 PREVIEW: non-production preview after service identity is verified.
- L3 OWNER GATE: merge, production, migrations, spend, credentials, public publishing, messages, payments, permissions, or sensitive data movement.

## Safety
Cross-project writes, force-push, secret extraction, and destructive data operations are blocked. Unknown service identity blocks production-facing work. Author and reviewer must be different roles. Shared schema changes are serialized.

## Done
A task is Done only with an approved independent review and the required evidence. Evidence may include commands, tests, screenshots, API responses, diffs, and commit SHAs.

## Owner brief
Completed; In review; Reworked/rejected; Blocked; Owner decision; Tests/security; PRs/commits/evidence; Cost; Next authorized actions.

## Activation
This control plane begins in registry-only mode. Autonomous execution stays disabled until the manifest activation gates pass.
