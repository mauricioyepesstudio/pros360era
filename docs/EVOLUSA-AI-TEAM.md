# EVOLUSA — AI Development Team

Project-local Claude Code agents and skills that encode how EVOLUSA should be built, so direction doesn't have to be re-explained every session.

## Agents (`.claude/agents/`)

| Agent | Owns | Does not do |
| --- | --- | --- |
| `evolusa-product-architect` | Product vision, Journey/Roadmap coherence, feature-fragmentation prevention, UX-vs-real-need evaluation | Writes no implementation code; routes claim/compliance calls to `compliance-reviewer` |
| `supabase-architect` | Postgres schema, migrations, RLS design, server/client Supabase boundary | Never creates a project/org/branch or runs a destructive op without explicit chat approval |
| `frontend-engineer` | Next.js/React implementation, responsive/accessible UI, loading/error/empty states | Doesn't invent copy/claims or design its own auth check — consumes the security/supabase contract |
| `security-reviewer` | Reviews auth, RLS, secrets, session handling, data exposure | Reviews only — flags fixes back to the owning agent rather than implementing them |
| `compliance-reviewer` | Reviews claims/copy against `data/compliance/claims.ts`, disclaimers, trust-source labeling | Reviews only; escalates business/legal facts (provider identity, licenses) to the user |
| `qa-engineer` | Runs lint/tsc/test/build/`git diff --check`, responsive checks, auth-state checks, regression checks | Fixes only trivial/obviously-safe issues; otherwise reports back to the owning agent |

Each agent's full brief (ground rules, inputs/outputs) is in its own file — read the file, not this summary, before delegating to it.

## Skills (`.claude/skills/`)

| Skill | Encodes |
| --- | --- |
| `evolusa-product` | Where each kind of product concept canonically lives, and the procedure for adding one without fragmenting the model |
| `evolusa-compliance` | Step-by-step claim/copy check against the compliance boundary |
| `supabase-auth` | Required auth flows, server/client split, the public-first funnel |
| `postgres-rls` | Standard RLS policy pattern and the pre-migration checklist |
| `git-safe-workflow` | Branch/repo identity checks, forbidden git operations, pre-commit verification |

## How this team should be used going forward

- Route architecture/product-scope questions to `evolusa-product-architect` before building, not after.
- `supabase-architect` designs schema/RLS changes as reviewable SQL files under `supabase/migrations/` first; `security-reviewer` checks them before `apply_migration` ever runs against a real project.
- `compliance-reviewer` is a gate on any new copy or service listing that touches a regulated category — treat a `REQUIRES_VERIFICATION` or `PROHIBITED` verdict as blocking, not advisory.
- `qa-engineer`'s five-check pass (lint, tsc, test, build, `git diff --check`) is the bar for "done," not partial-pass-with-caveats.
- Do not have more than one agent editing the same file concurrently — the orchestrating session remains responsible for sequencing and final implementation decisions.
