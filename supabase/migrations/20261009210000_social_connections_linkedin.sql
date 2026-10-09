-- Lets social_connections hold a LinkedIn personal-profile connection
-- (lib/social/linkedin.ts) next to Instagram. Same rules: one per network per
-- professional, encrypted token never granted to clients.
alter table public.social_connections drop constraint if exists social_connections_provider_check;
alter table public.social_connections add constraint social_connections_provider_check
  check (provider in ('instagram', 'linkedin'));
