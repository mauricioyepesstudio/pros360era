import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

/**
 * The only place a connection-fee payment turns into a CONTACTED status
 * change. Verifies the Stripe signature before trusting anything in the
 * body, then calls the dedicated mark_opportunity_contacted_paid RPC (0015)
 * via the service-role client — that RPC has no `authenticated` grant at
 * all, so this is the only caller that can ever reach it. Never trusts the
 * success_url redirect on its own; that page is cosmetic only.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.type === "connection_fee" && session.metadata.opportunity_id) {
      const supabase = createSupabaseServiceRoleClient();
      if (!supabase) {
        return new Response("Service unavailable", { status: 500 });
      }

      const { error } = await supabase.rpc("mark_opportunity_contacted_paid", {
        p_opportunity_id: session.metadata.opportunity_id,
        p_stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        p_fee_cents: session.amount_total ?? 0,
      });

      if (error) {
        return new Response(`Failed to record payment: ${error.message}`, { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
