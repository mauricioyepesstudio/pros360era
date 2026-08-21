-- EVOLUSA Phase 2 — auto-create a profiles row when a user signs up.
-- Without this, a fresh auth.users row has no corresponding public.profiles
-- row and getCurrentProfile() would have nothing to read, making the
-- dashboard/roadmap/profile pages fall back to preview data forever for a
-- real signed-up user. security definer is required here: the inserting
-- context is the auth server, not the new user's own session, so RLS's
-- `auth.uid() = id` check would otherwise block the insert.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
