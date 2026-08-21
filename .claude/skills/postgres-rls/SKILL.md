---
name: postgres-rls
description: How EVOLUSA designs and writes Row Level Security policies for user-owned Postgres tables in Supabase. Use when adding a table or reviewing RLS before applying a migration.
---

# EVOLUSA Postgres RLS procedure

## Default posture

A user can access their own personal records and cannot access another user's private records. No broad "any authenticated user can read" policy on personal data. No client ever supplies its own `user_id` for a write — it's always taken from `auth.uid()` server-side.

## Standard pattern for a user-owned table

```sql
alter table public.<table> enable row level security;

create policy "select_own_<table>" on public.<table>
  for select using (auth.uid() = user_id);

create policy "insert_own_<table>" on public.<table>
  for insert with check (auth.uid() = user_id);

create policy "update_own_<table>" on public.<table>
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_<table>" on public.<table>
  for delete using (auth.uid() = user_id);
```

Only add the operations the app actually performs — don't add a `delete` policy for a table nothing ever deletes from.

## Checklist before a migration is considered ready

1. Every new table has `enable row level security` in the same migration that creates it (never a separate later step — a table with RLS off between migrations is a real exposure window).
2. Every column that identifies the owner is `user_id uuid not null references auth.users(id) on delete cascade`.
3. No policy uses `using (true)` on a personal-data table.
4. Any table that legitimately needs shared/public read (e.g. a future public resources table with no personal data) states so explicitly and is reviewed by security-reviewer as an intentional exception, not a default.
5. Service-role-only operations (admin tooling, background jobs) are never exposed through a policy meant for the anon/authenticated role — they bypass RLS by using the service role in a server-only context instead.

## Where migrations live

Plain numbered SQL files under `supabase/migrations/`, reviewed before being applied to any real project with `apply_migration`. Never apply directly to `belong-platform` — EVOLUSA has its own project.
