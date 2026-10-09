-- Social inbox v1: comments and direct messages pulled from a professional's
-- connected Instagram account into their CRM (lib/social/instagram-inbox.ts).
-- Only the service role writes (daily cron and the owner's "Traer ahora"
-- route, both after verifying who owns the connection). The owner reads their
-- own rows. Deleting the connection (disconnect or Meta data deletion) deletes
-- the imported items with it; leads already saved in crm_leads stay in the
-- professional's CRM.

create table public.social_inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.social_connections(id) on delete cascade,
  provider text not null check (provider in ('instagram')),
  kind text not null check (kind in ('comment', 'message')),
  external_id text not null check (char_length(external_id) between 1 and 256),
  author_id text check (author_id is null or char_length(author_id) <= 256),
  author_username text not null check (author_username ~ '^[a-z0-9._]{1,30}$'),
  body text not null check (char_length(body) between 1 and 2000),
  permalink text check (permalink is null or (char_length(permalink) <= 2048 and permalink ~ '^https://(www\.)?instagram\.com/')),
  occurred_at timestamptz not null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint social_inbox_items_once unique (user_id, provider, kind, external_id)
);

create index social_inbox_items_owner_recent on public.social_inbox_items (user_id, occurred_at desc);
create index social_inbox_items_connection on public.social_inbox_items (connection_id);
create index social_inbox_items_lead on public.social_inbox_items (lead_id) where lead_id is not null;

alter table public.social_inbox_items enable row level security;
revoke all on public.social_inbox_items from public, anon, authenticated;

grant select on public.social_inbox_items to authenticated;
create policy social_inbox_items_select_own on public.social_inbox_items for select to authenticated
  using (user_id = (select auth.uid()));
-- No client insert/update/delete: the service role is the only writer.

-- When the inbox was last pulled, so "Traer ahora" can't hammer Instagram.
alter table public.social_connections add column inbox_synced_at timestamptz;
grant select (inbox_synced_at) on public.social_connections to authenticated;

-- One CRM lead per Instagram profile per professional, even if two syncs race.
create unique index crm_leads_instagram_profile_unique on public.crm_leads (user_id, source_url)
  where source = 'instagram' and source_url is not null;
