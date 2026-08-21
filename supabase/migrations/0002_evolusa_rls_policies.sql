-- EVOLUSA Phase 2 — Row Level Security.
-- NOT YET APPLIED. Must be reviewed by security-reviewer before `apply_migration`.
-- Default posture: a user can access only rows where user_id = auth.uid().
-- No broad authenticated-read policies on personal data anywhere below.

-- ---------------------------------------------------------------------------
-- profiles (owner = the row's own id, not a separate user_id column)
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);

create policy "insert_own_profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No delete policy: profile deletion happens via auth.users cascade only.

-- ---------------------------------------------------------------------------
-- user_goals
-- ---------------------------------------------------------------------------
alter table public.user_goals enable row level security;

create policy "select_own_user_goals" on public.user_goals
  for select using (auth.uid() = user_id);

create policy "insert_own_user_goals" on public.user_goals
  for insert with check (auth.uid() = user_id);

create policy "update_own_user_goals" on public.user_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_user_goals" on public.user_goals
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- onboarding_responses
-- ---------------------------------------------------------------------------
alter table public.onboarding_responses enable row level security;

create policy "select_own_onboarding_responses" on public.onboarding_responses
  for select using (auth.uid() = user_id);

create policy "insert_own_onboarding_responses" on public.onboarding_responses
  for insert with check (auth.uid() = user_id);

create policy "update_own_onboarding_responses" on public.onboarding_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No delete policy: onboarding history is kept as an audit trail.

-- ---------------------------------------------------------------------------
-- roadmap_items
-- ---------------------------------------------------------------------------
alter table public.roadmap_items enable row level security;

create policy "select_own_roadmap_items" on public.roadmap_items
  for select using (auth.uid() = user_id);

create policy "insert_own_roadmap_items" on public.roadmap_items
  for insert with check (auth.uid() = user_id);

create policy "update_own_roadmap_items" on public.roadmap_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_roadmap_items" on public.roadmap_items
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy "select_own_tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "insert_own_tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "update_own_tasks" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- life_events
-- ---------------------------------------------------------------------------
alter table public.life_events enable row level security;

create policy "select_own_life_events" on public.life_events
  for select using (auth.uid() = user_id);

create policy "insert_own_life_events" on public.life_events
  for insert with check (auth.uid() = user_id);

create policy "update_own_life_events" on public.life_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_life_events" on public.life_events
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- assistant_conversations / assistant_messages
-- ---------------------------------------------------------------------------
alter table public.assistant_conversations enable row level security;

create policy "select_own_assistant_conversations" on public.assistant_conversations
  for select using (auth.uid() = user_id);

create policy "insert_own_assistant_conversations" on public.assistant_conversations
  for insert with check (auth.uid() = user_id);

create policy "update_own_assistant_conversations" on public.assistant_conversations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_assistant_conversations" on public.assistant_conversations
  for delete using (auth.uid() = user_id);

alter table public.assistant_messages enable row level security;

create policy "select_own_assistant_messages" on public.assistant_messages
  for select using (auth.uid() = user_id);

create policy "insert_own_assistant_messages" on public.assistant_messages
  for insert with check (auth.uid() = user_id);

-- No update/delete policy: messages are an immutable conversation log.
