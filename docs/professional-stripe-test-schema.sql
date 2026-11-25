-- Review/apply only in a preview test database. No pilot subscription writes.
begin;
create table public.professional_stripe_test_accounts (
  user_id uuid primary key references auth.users(id),
  professional_profile_id uuid not null unique references public.professional_profiles(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('starter','professional','business')),
  status text,
  current_period_end timestamptz,
  last_event_created bigint not null default 0
);
alter table public.professional_stripe_test_accounts enable row level security;
revoke all on public.professional_stripe_test_accounts from anon, authenticated;
grant select on public.professional_stripe_test_accounts to authenticated;
create policy own_test_billing on public.professional_stripe_test_accounts for select to authenticated using ((select auth.uid()) = user_id);
grant all on public.professional_stripe_test_accounts to service_role;
create table public.professional_stripe_test_events (event_id text primary key, received_at timestamptz not null default now());
alter table public.professional_stripe_test_events enable row level security;
revoke all on public.professional_stripe_test_events from anon, authenticated;
grant all on public.professional_stripe_test_events to service_role;
create function public.record_professional_stripe_test_event(
  p_event_id text, p_event_created bigint, p_customer_id text, p_subscription_id text,
  p_plan text, p_status text, p_period_end timestamptz
) returns void language plpgsql security invoker set search_path = '' as $$
declare v_profile_id uuid;
begin
  if current_user <> 'service_role' then raise exception 'Service only'; end if;
  select professional_profile_id into v_profile_id from public.professional_stripe_test_accounts
    where stripe_customer_id = p_customer_id for update;
  if v_profile_id is null then raise exception 'Unknown test customer'; end if;
  if not exists (select 1 from public.professional_subscriptions where professional_profile_id = v_profile_id and billing_exempt = false)
    then raise exception 'Exemption protected'; end if;
  insert into public.professional_stripe_test_events(event_id) values (p_event_id) on conflict do nothing;
  if not found then return; end if;
  update public.professional_stripe_test_accounts set
    stripe_subscription_id = p_subscription_id, plan = p_plan, status = p_status,
    current_period_end = p_period_end, last_event_created = p_event_created
    where stripe_customer_id = p_customer_id and last_event_created <= p_event_created
      and (stripe_subscription_id is null or stripe_subscription_id = p_subscription_id);
end;
$$;
revoke all on function public.record_professional_stripe_test_event(text,bigint,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_professional_stripe_test_event(text,bigint,text,text,text,text,timestamptz) to service_role;
commit;
