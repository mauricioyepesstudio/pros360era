# EVOLUSA — Home Computer Setup

Concise, executable resume process for continuing EVOLUSA work on Mauricio's home Windows machine. Supabase is remote/shared — it is not computer-specific, so nothing about the backend needs to change between machines.

## 1. Get the code

**If the repo already exists on this machine:**

```powershell
cd C:\Users\17543\pros360era
git fetch origin
git checkout feat/evolusa-migration
git pull origin feat/evolusa-migration
npm install
```

**If the repo does not exist yet on this machine:**

```powershell
cd C:\Users\17543
git clone https://github.com/mauricioyepesstudio/pros360era.git
cd pros360era
git checkout feat/evolusa-migration
npm install
```

## 2. Create local environment file

Create `.env.local` in the project root (this file is gitignored — it is never in the repository and never documented with real values):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Get the real values from the Supabase dashboard: project ref `ovialqdazxkekvqqgdiu` (org **EVOLUSA**) → Project Settings → API. Never paste these values into a chat message, a committed file, or any document — only into `.env.local` directly.

## 3. Start the dev server

```powershell
npm run dev
```

Expected: `http://localhost:3002` (the project always uses port 3002, never 3000/3001).

## 4. Open Claude Code

- Open the local `pros360era` folder in Claude Code.
- Expected branch: `feat/evolusa-migration`.
- Project-local agents (`.claude/agents/`) and skills (`.claude/skills/`) are already versioned in Git — no separate setup needed, they arrive with `git pull`.
- `CLAUDE.md` and `AGENTS.md` are also versioned and will load automatically.

### Exact first prompt to use at home

```
Read CLAUDE.md, AGENTS.md and docs/CURRENT-STATE.md, verify branch
feat/evolusa-migration, then continue the NEXT EXACT TASK without
redoing completed work.
```

This tells Claude Code to orient itself from the committed documentation rather than re-deriving context or repeating work already done — `docs/CURRENT-STATE.md`'s "NEXT EXACT TASK" section names the specific next milestone.

## 5. What NOT to do without explicit approval

- Do not merge `feat/evolusa-migration` into `main`.
- Do not push anywhere except `origin feat/evolusa-migration`.
- Do not deploy to production.
- Do not touch the BELONG Labs Supabase org/project, or any other repository (`mauricio-portfolio`, `marketing-ai-platform`, `meta-ads-deploy`).
- Do not create a new Supabase project or organization without checking first — the EVOLUSA org already has a project provisioned (`ovialqdazxkekvqqgdiu`).

## 6. If something looks out of date

`docs/CURRENT-STATE.md` is a point-in-time snapshot, refreshed at checkpoint boundaries — if it disagrees with `git log` or the code itself, trust the code and git history over this document.
