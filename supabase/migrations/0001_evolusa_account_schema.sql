-- EVOLUSA Phase 2 — account, roadmap, and persistence schema.
-- NOT YET APPLIED to any Supabase project. Review with supabase-architect and
-- security-reviewer, then apply with `apply_migration` once the EVOLUSA-specific
-- Supabase project exists. Never apply against the BELONG project.
--
-- Maps directly to the existing TypeScript domain model:
--   data/account/types.ts   -> UserProfile, UserGoal, Task, LifeEvent, RoadmapItem
--   data/journey/types.ts   -> StageId
--   lib/roadmap/types.ts    -> RoadmapAnswers
--   lib/assistant/service.ts -> AssistantPrompt/AssistantResponse
--
-- Static catalogs (stage/service/roadmap-rule content, life-event definitions)
-- stay in code as the single source of truth (see docs/EVOLUSA-DATA-MODEL.md,
-- "Integrity rules"). Tables here persist per-user STATE, not catalog content.

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, mirrors UserProfile scalar fields.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en')),
  state text,
  current_stage text not null default 'LLEGA'
    check (current_stage in ('LLEGA', 'ESTABLECETE', 'EMPRENDE', 'PROTEGETE', 'CRECE', 'EVOLUCIONA')),
  business_status text not null default 'NONE'
    check (business_status in ('NONE', 'WANTS_TO_START', 'OWNER')),
  employment text not null default 'PREFER_NOT_TO_SAY'
    check (employment in ('EMPLOYED', 'SELF_EMPLOYED', 'NOT_WORKING', 'PREFER_NOT_TO_SAY')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- user_goals: UserGoal rows a user has selected/added.
-- ---------------------------------------------------------------------------
create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  category text not null check (category in (
    'WORK', 'HOUSING', 'DOCUMENTS', 'FINANCES', 'TAX', 'BUSINESS', 'INSURANCE',
    'EDUCATION', 'ENGLISH', 'TRANSPORT', 'CREDIT', 'FAMILY', 'MARKETING', 'GENERAL'
  )),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- onboarding_responses: raw RoadmapAnswers plus the selectedNeeds set, versioned
-- against the deterministic rules that produced the first roadmap result.
-- ---------------------------------------------------------------------------
create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  selected_needs text[] not null default '{}',
  roadmap_version text not null default '1.0.0',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- roadmap_items: per-user completion/status state against the static catalog
-- defined in lib/account/roadmap-engine.ts and lib/roadmap/rules.ts. The
-- catalog item's title/description/stage/category stay in code; this table
-- only tracks what's true for this user about that catalog item.
-- ---------------------------------------------------------------------------
create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_item_id text not null,
  status text not null default 'UPCOMING'
    check (status in ('COMPLETED', 'NOW', 'UPCOMING', 'LATER')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, catalog_item_id)
);

-- ---------------------------------------------------------------------------
-- tasks: user-owned completable action items (Task type). May optionally
-- trace back to a roadmap catalog item for context, or be freeform.
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  category text not null check (category in (
    'WORK', 'HOUSING', 'DOCUMENTS', 'FINANCES', 'TAX', 'BUSINESS', 'INSURANCE',
    'EDUCATION', 'ENGLISH', 'TRANSPORT', 'CREDIT', 'FAMILY', 'MARKETING', 'GENERAL'
  )),
  roadmap_catalog_item_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- life_events: which static LifeEvent catalog entries (data/account/foundation.ts)
-- a user has reported, plus freeform "other" events.
-- ---------------------------------------------------------------------------
create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_event_id text not null,
  category text not null check (category in (
    'WORK', 'HOUSING', 'DOCUMENTS', 'FINANCES', 'TAX', 'BUSINESS', 'INSURANCE',
    'EDUCATION', 'ENGLISH', 'TRANSPORT', 'CREDIT', 'FAMILY', 'MARKETING', 'GENERAL'
  )),
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- assistant_conversations / assistant_messages: typed foundation for the
-- future EVOLUSA Assistant. No LLM provider is wired in this phase — this
-- only persists conversation shape so the UI and context-passing contract
-- are ready ahead of time.
-- ---------------------------------------------------------------------------
create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  guidance_label text check (guidance_label in ('OFFICIAL', 'EVOLUSA_GUIDE', 'PROFESSIONAL')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.roadmap_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.assistant_conversations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes for the access patterns the app actually uses.
-- ---------------------------------------------------------------------------
create index if not exists user_goals_user_id_idx on public.user_goals(user_id);
create index if not exists onboarding_responses_user_id_idx on public.onboarding_responses(user_id);
create index if not exists roadmap_items_user_id_idx on public.roadmap_items(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists life_events_user_id_idx on public.life_events(user_id);
create index if not exists assistant_conversations_user_id_idx on public.assistant_conversations(user_id);
create index if not exists assistant_messages_conversation_id_idx on public.assistant_messages(conversation_id);
