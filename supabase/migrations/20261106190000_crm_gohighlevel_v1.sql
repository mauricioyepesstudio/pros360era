-- GoHighLevel v1: optional connector that copies each new EVOLUSA CRM lead into
-- the professional's own GoHighLevel sub-account (lib/crm/gohighlevel*.ts).
-- The Private Integration token is AES-256-GCM ciphertext under SOCIAL_TOKEN_KEY
-- (lib/social/crypto.ts) and is never granted to anon or authenticated. Only the
-- service role writes (connect route after checking the session, the sync after
-- a new lead, the daily cron). The owner sees status only and may delete
-- (disconnect), which removes the ciphertext and the sync log with it.

begin;

create table public.crm_ghl_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  location_id text not null check (location_id ~ '^[A-Za-z0-9]{8,64}$'),
  location_name text check (location_name is null or char_length(location_name) <= 200),
  token_ciphertext text not null check (char_length(token_ciphertext) <= 4096),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INVALID')),
  last_error text check (last_error is null or char_length(last_error) <= 200),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_ghl_connections enable row level security;
revoke all on public.crm_ghl_connections from public, anon, authenticated;

-- The owner sees the status of their connection, never the token.
grant select (user_id, location_id, location_name, status, last_error, last_synced_at, created_at, updated_at)
  on public.crm_ghl_connections to authenticated;
create policy crm_ghl_connections_select_own on public.crm_ghl_connections for select to authenticated
  using (user_id = (select auth.uid()));

-- Disconnecting deletes the row, and the ciphertext with it.
grant delete on public.crm_ghl_connections to authenticated;
create policy crm_ghl_connections_delete_own on public.crm_ghl_connections for delete to authenticated
  using (user_id = (select auth.uid()));

-- One row per lead already sent (or failing) so a lead is never sent twice and
-- failures are retried a bounded number of times.
create table public.crm_ghl_lead_sync (
  lead_id uuid primary key references public.crm_leads(id) on delete cascade,
  user_id uuid not null references public.crm_ghl_connections(user_id) on delete cascade,
  status text not null check (status in ('SYNCED', 'FAILED')),
  ghl_contact_id text check (ghl_contact_id is null or char_length(ghl_contact_id) <= 64),
  attempts integer not null default 1 check (attempts between 1 and 100),
  last_error text check (last_error is null or char_length(last_error) <= 200),
  updated_at timestamptz not null default now(),
  constraint crm_ghl_lead_sync_synced_has_contact check (status <> 'SYNCED' or ghl_contact_id is not null)
);

create index crm_ghl_lead_sync_owner on public.crm_ghl_lead_sync (user_id, status);

alter table public.crm_ghl_lead_sync enable row level security;
revoke all on public.crm_ghl_lead_sync from public, anon, authenticated;

grant select (lead_id, user_id, status, attempts, last_error, updated_at) on public.crm_ghl_lead_sync to authenticated;
create policy crm_ghl_lead_sync_select_own on public.crm_ghl_lead_sync for select to authenticated
  using (user_id = (select auth.uid()));
-- No client insert/update: the service role is the only writer.

commit;
