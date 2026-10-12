-- Facebook Pages join Instagram and LinkedIn in social_connections (planner auto-publishing).
-- Same table, same RLS and column grants: the owner sees only their own row and never the
-- encrypted token. Facebook Page tokens don't expire, so token_expires_at stays null for them.
-- Includes 'linkedin' so it is correct whether or not 20261009210000 was applied first.
alter table public.social_connections drop constraint if exists social_connections_provider_check;
alter table public.social_connections add constraint social_connections_provider_check
  check (provider in ('instagram', 'linkedin', 'facebook'));
alter table public.social_connections drop constraint if exists social_connections_active_has_token;
alter table public.social_connections add constraint social_connections_active_has_token
  check (status <> 'ACTIVE' or (token_ciphertext is not null and (token_expires_at is not null or provider = 'facebook')));
