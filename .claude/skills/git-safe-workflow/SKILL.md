---
name: git-safe-workflow
description: Safe git workflow rules specific to the EVOLUSA repo (pros360era) — required branch, forbidden operations, and pre-commit checks. Use before any git operation in this repo.
---

# EVOLUSA git-safe workflow

## Identity checks (run before any edit)

```bash
pwd                        # must be the pros360era working tree
git branch --show-current  # must be feat/evolusa-migration (or a branch you created off it)
git status                 # review before touching anything
```

Never work directly on `main`. Never touch the BELONG, mauricio-portfolio, marketing-ai-platform, meta-ads-deploy, or any other repository from an EVOLUSA session.

## Forbidden without explicit user approval in chat, every time

- `git push` (including `--force`)
- `git merge` into `main`
- `git reset --hard`, `git checkout --`/`restore` that discards uncommitted work, `git clean -f`
- `git commit --amend` on anything already pushed
- Deleting a branch

## Before any command that could discard uncommitted work

Run `git status` first. If there's anything present, stash (`git stash -u`) or commit it before proceeding — never assume it's disposable.

## Before committing

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm test`
4. `npm run build`
5. `git diff --check` (whitespace/conflict markers)
6. `git status` after `git add` — confirm only intended files are staged, and check contents of anything unfamiliar before it's committed (never commit `.env.local`, keys, or credentials).

## Commit style

Create new commits rather than amending. Follow the existing repo convention (`type(scope): summary`, e.g. `feat(evolusa): ...`). Never skip hooks (`--no-verify`) without explicit user instruction.
