-- EVOLUSA Phase 2 — fixes for findings from get_advisors (security + performance)
-- run immediately after 0001-0003.

-- SECURITY: pin search_path on set_updated_at (function_search_path_mutable).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- SECURITY: handle_new_user is a security definer trigger function that should
-- only ever run as a trigger, not be callable directly via PostgREST RPC by
-- anon/authenticated roles (anon_security_definer_function_executable,
-- authenticated_security_definer_function_executable).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- PERFORMANCE: wrap auth.uid() in a scalar subquery so it's evaluated once per
-- query instead of once per row (auth_rls_initplan).
alter policy "select_own_profile" on public.profiles using ((select auth.uid()) = id);
alter policy "insert_own_profile" on public.profiles with check ((select auth.uid()) = id);
alter policy "update_own_profile" on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

alter policy "select_own_user_goals" on public.user_goals using ((select auth.uid()) = user_id);
alter policy "insert_own_user_goals" on public.user_goals with check ((select auth.uid()) = user_id);
alter policy "update_own_user_goals" on public.user_goals using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "delete_own_user_goals" on public.user_goals using ((select auth.uid()) = user_id);

alter policy "select_own_onboarding_responses" on public.onboarding_responses using ((select auth.uid()) = user_id);
alter policy "insert_own_onboarding_responses" on public.onboarding_responses with check ((select auth.uid()) = user_id);
alter policy "update_own_onboarding_responses" on public.onboarding_responses using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "select_own_roadmap_items" on public.roadmap_items using ((select auth.uid()) = user_id);
alter policy "insert_own_roadmap_items" on public.roadmap_items with check ((select auth.uid()) = user_id);
alter policy "update_own_roadmap_items" on public.roadmap_items using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "delete_own_roadmap_items" on public.roadmap_items using ((select auth.uid()) = user_id);

alter policy "select_own_tasks" on public.tasks using ((select auth.uid()) = user_id);
alter policy "insert_own_tasks" on public.tasks with check ((select auth.uid()) = user_id);
alter policy "update_own_tasks" on public.tasks using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "delete_own_tasks" on public.tasks using ((select auth.uid()) = user_id);

alter policy "select_own_life_events" on public.life_events using ((select auth.uid()) = user_id);
alter policy "insert_own_life_events" on public.life_events with check ((select auth.uid()) = user_id);
alter policy "update_own_life_events" on public.life_events using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "delete_own_life_events" on public.life_events using ((select auth.uid()) = user_id);

alter policy "select_own_assistant_conversations" on public.assistant_conversations using ((select auth.uid()) = user_id);
alter policy "insert_own_assistant_conversations" on public.assistant_conversations with check ((select auth.uid()) = user_id);
alter policy "update_own_assistant_conversations" on public.assistant_conversations using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "delete_own_assistant_conversations" on public.assistant_conversations using ((select auth.uid()) = user_id);

alter policy "select_own_assistant_messages" on public.assistant_messages using ((select auth.uid()) = user_id);
alter policy "insert_own_assistant_messages" on public.assistant_messages with check ((select auth.uid()) = user_id);

-- PERFORMANCE: unindexed_foreign_keys on assistant_messages.user_id.
create index if not exists assistant_messages_user_id_idx on public.assistant_messages(user_id);
