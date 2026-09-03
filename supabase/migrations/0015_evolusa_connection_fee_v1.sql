-- EVOLUSA — Connection fee v1. PROPOSED ONLY. NOT APPLIED. Must be reviewed
-- (supabase-architect, security-reviewer) and explicitly approved by the
-- project owner before apply_migration. Never apply against BELONG.
--
-- Closes the actual first-revenue gap: until now, ROUTED -> CONTACTED was
-- free and unconditional (mark_opportunity_contacted, 0008). This migration
-- adds a paid path (mark_opportunity_contacted_paid) that only the Stripe
-- webhook can call, and closes the free path's `authenticated` grant so a
-- professional cannot bypass payment by calling the old RPC directly.
--
-- Money never touches this database directly -- Stripe is the source of
-- truth for whether a charge succeeded. This migration only records the
-- outcome (fee amount, payment intent id) after Stripe's webhook has
-- already verified the charge server-side via signature check.

alter table public.opportunities
  add column connection_fee_cents integer,
  add column connection_fee_status text not null default 'UNPAID'
    check (connection_fee_status in ('UNPAID', 'PAID')),
  add column stripe_payment_intent_id text;

comment on column public.opportunities.connection_fee_cents is
  'Amount actually charged via Stripe for this connection, in cents. Null until paid.';
comment on column public.opportunities.connection_fee_status is
  'UNPAID until the Stripe webhook confirms payment; never set by any client-writable path.';
comment on column public.opportunities.stripe_payment_intent_id is
  'Stripe payment_intent id for the connection-fee charge, for reconciliation/refunds. Never a client-supplied value.';

-- ---------------------------------------------------------------------------
-- Close the free bypass: a professional could otherwise call
-- mark_opportunity_contacted directly (it is still a valid function) and
-- skip payment entirely. Revoking `authenticated` here makes the paid path
-- the only reachable one, without deleting the function or its audit trail.
-- ---------------------------------------------------------------------------
revoke execute on function public.mark_opportunity_contacted(uuid) from authenticated;

-- ---------------------------------------------------------------------------
-- mark_opportunity_contacted_paid — ROUTED -> CONTACTED, payment-confirmed
-- path. Deliberately has NO `authenticated`/`anon` grant at all: the only
-- way to reach this function is a service-role connection, which bypasses
-- grants entirely. That means the only real caller is the Stripe webhook
-- route (app/api/stripe/webhook/route.ts), which has independently verified
-- the Stripe signature before ever touching this RPC. No auth.uid() check
-- here by design -- there is no user session in a webhook request; the
-- authority is "Stripe told us this specific opportunity_id was paid",
-- established entirely outside Postgres.
-- ---------------------------------------------------------------------------
create or replace function public.mark_opportunity_contacted_paid(
  p_opportunity_id uuid,
  p_stripe_payment_intent_id text,
  p_fee_cents integer
)
returns public.opportunities
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
begin
  select * into v_opportunity from public.opportunities where id = p_opportunity_id;
  if v_opportunity.id is null then
    raise exception 'opportunity not found';
  end if;

  if v_opportunity.status <> 'ROUTED' then
    raise exception 'opportunity is not in a contactable state';
  end if;

  update public.opportunities
  set status = 'CONTACTED',
      contacted_at = now(),
      connection_fee_cents = p_fee_cents,
      connection_fee_status = 'PAID',
      stripe_payment_intent_id = p_stripe_payment_intent_id
  where id = v_opportunity.id
  returning * into v_opportunity;

  return v_opportunity;
end;
$$;

comment on function public.mark_opportunity_contacted_paid(uuid, text, integer) is
  'The only path from ROUTED to CONTACTED as of 0015. Callable only via service-role (the Stripe webhook) -- deliberately not granted to authenticated or anon. See this migration''s header for why there is no auth.uid() check.';

revoke all on function public.mark_opportunity_contacted_paid(uuid, text, integer) from public, anon, authenticated;
