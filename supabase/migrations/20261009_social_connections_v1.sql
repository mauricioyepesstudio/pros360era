-- Social connections v1: one Instagram professional account per EVOLUSA professional.
-- Tokens are AES-256-GCM ciphertext (lib/social/crypto.ts) and are never granted to
-- anon or authenticated; only the service role (OAuth callback, refresh cron,
-- Meta deauthorize/data-deletion callbacks) reads or writes them.

create table public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('instagram')),
  provider_account_id text not null check (char_length(provider_account_id) between 1 and 64),
  username text not null check (char_length(username) between 1 and 64),
  account_type text check (account_type is null or char_length(account_type) <= 32),
  scopes text[] not null default '{}',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'EXPIRED', 'REVOKED')),
  token_ciphertext text check (token_ciphertext is null or char_length(token_ciphertext) <= 4096),
  token_expires_at timestamptz,
  token_refreshed_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_connections_one_per_user unique (user_id, provider),
  constraint social_connections_one_owner unique (provider, provider_account_id),
  constraint social_connections_active_has_token check (status <> 'ACTIVE' or (token_ciphertext is not null and token_expires_at is not null))
);

create index social_connections_refresh_idx on public.social_connections (token_expires_at) where status = 'ACTIVE';

alter table public.social_connections enable row level security;
revoke all on public.social_connections from public, anon, authenticated;

-- The owner sees their connection's status, never the token.
grant select (id, user_id, provider, username, account_type, scopes, status, token_expires_at, last_error, created_at, updated_at)
  on public.social_connections to authenticated;
create policy social_connections_select_own on public.social_connections for select to authenticated
  using (user_id = (select auth.uid()));

-- Disconnecting deletes the row, and the ciphertext with it.
grant delete on public.social_connections to authenticated;
create policy social_connections_delete_own on public.social_connections for delete to authenticated
  using (user_id = (select auth.uid()));

-- Meta data-deletion requests: kept so the person can check the status URL Meta shows them.
-- Stores only a one-way hash of the Instagram-scoped id, never the id itself.
create table public.social_data_deletion_requests (
  confirmation_code text primary key check (confirmation_code ~ '^[a-f0-9]{24}$'),
  provider text not null check (provider in ('instagram')),
  provider_account_hash text not null check (provider_account_hash ~ '^[a-f0-9]{64}$'),
  connections_deleted integer not null default 0 check (connections_deleted >= 0),
  created_at timestamptz not null default now()
);

alter table public.social_data_deletion_requests enable row level security;
revoke all on public.social_data_deletion_requests from public, anon, authenticated;
-- No table grants or policies: service role only.

-- The public status page (/privacidad/eliminacion) learns only when a given code ran.
create function public.social_deletion_request_date(p_confirmation_code text)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select created_at from public.social_data_deletion_requests
  where confirmation_code = p_confirmation_code and p_confirmation_code ~ '^[a-f0-9]{24}$';
$$;
revoke all on function public.social_deletion_request_date(text) from public, anon, authenticated;
grant execute on function public.social_deletion_request_date(text) to anon, authenticated;
