-- Add Threads only. Existing encryption, uniqueness, RLS and column grants remain unchanged.
-- Apply after security review and explicit owner approval; does not connect any account.
alter table public.social_connections drop constraint if exists social_connections_provider_check;
alter table public.social_connections add constraint social_connections_provider_check
  check (provider in ('instagram', 'linkedin', 'facebook', 'threads'));
