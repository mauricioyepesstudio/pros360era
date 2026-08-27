-- NOT YET APPLIED. Must be reviewed (security-reviewer + owner) before
-- `apply_migration` against the live EVOLUSA Supabase project.
-- ---------------------------------------------------------------------------
-- Fix: insert_own_assistant_messages did not verify conversation_id
-- ownership.
--
-- The policy from 0002_evolusa_rls_policies.sql only checked that the
-- inserting user labeled the row with their own user_id column — it never
-- verified that conversation_id actually referred to a conversation owned
-- by that same user. A valid authenticated session (a raw REST/RPC call,
-- not through any current UI) could insert a message row against another
-- user's conversation_id while still satisfying RLS, since the check only
-- inspected the user_id column, not the foreign-key relationship.
--
-- Confirmed dormant at the time of this fix: no route, component, or lib
-- file anywhere in the repo reads or writes assistant_conversations or
-- assistant_messages — this schema exists ahead of the (still unbuilt)
-- EvolUSAia assistant feature. Not a live exposure today, but RLS — not
-- application code — is meant to be the actual boundary here, so this is
-- closed now while it's cheap, before any Assistant UI is wired up.
--
-- See docs/EVOLUSA-001-LAUNCH-READINESS-AUDIT.md, Finding S-2.
-- ---------------------------------------------------------------------------

drop policy if exists "insert_own_assistant_messages" on public.assistant_messages;

create policy "insert_own_assistant_messages" on public.assistant_messages
  for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.assistant_conversations c
      where c.id = conversation_id
        and c.user_id = (select auth.uid())
    )
  );
