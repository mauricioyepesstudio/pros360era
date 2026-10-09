-- Social publications v1: one row per planner post published (or being
-- published) to a professional's own connected account
-- (lib/social/publish-service.ts). The unique key is what stops a double click
-- from posting twice. FAILED (the network clearly refused) may be retried;
-- UNKNOWN (timeout or server error on the final call, so it may be live) never
-- is, so a retry can't post it twice. Only the service role writes, from
-- /api/social/publish after checking the session owns the post. The owner
-- reads their own rows to see what went out and the link to it. Disconnecting
-- the account (or a Meta data deletion) removes these rows with it; the post
-- itself stays on the network and the planner keeps it marked as published.

create table public.social_publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.social_connections(id) on delete cascade,
  provider text not null check (provider in ('instagram', 'linkedin')),
  planner_post_id text not null check (planner_post_id ~ '^[a-z0-9-]{1,64}$'),
  status text not null default 'PUBLISHING' check (status in ('PUBLISHING', 'PUBLISHED', 'FAILED', 'UNKNOWN')),
  external_id text check (external_id is null or char_length(external_id) between 1 and 256),
  permalink text check (permalink is null or (char_length(permalink) <= 2048 and permalink ~ '^https://(www\.)?(instagram|linkedin)\.com/')),
  error_code text check (error_code is null or char_length(error_code) <= 200),
  attempted_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint social_publications_once unique (user_id, provider, planner_post_id)
);

create index social_publications_connection on public.social_publications (connection_id);

alter table public.social_publications enable row level security;
revoke all on public.social_publications from public, anon, authenticated;

grant select on public.social_publications to authenticated;
create policy social_publications_select_own on public.social_publications for select to authenticated
  using (user_id = (select auth.uid()));
-- No client insert/update/delete: the service role is the only writer.
