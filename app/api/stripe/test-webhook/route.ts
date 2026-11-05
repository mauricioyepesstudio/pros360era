import Stripe from "stripe";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { testBillingAllowed, testSubscriptionState } from "@/lib/stripe/professional-test-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!testBillingAllowed(process.env)) return new Response("Test billing disabled", { status: 503 });
  const secret = process.env.STRIPE_PROFESSIONAL_TEST_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret) return new Response("Webhook unavailable", { status: 503 });
  if (!signature) return new Response("Missing signature", { status: 400 });
  const stripe = new Stripe(process.env.STRIPE_PROFESSIONAL_TEST_KEY!);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.livemode || event.account) return new Response("Wrong environment", { status: 400 });
  let subscriptionId: string | null = null;
  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.resumed"].includes(event.type)) {
    subscriptionId = (event.data.object as Stripe.Subscription).id;
  } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const subscription = (event.data.object as Stripe.Invoice).parent?.subscription_details?.subscription;
    subscriptionId = typeof subscription === "string" ? subscription : subscription?.id ?? null;
  } else if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription") subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
  }
  if (!subscriptionId) return new Response("ignored", { status: 200 });
  try {
    // Re-read authoritative current state; never grant access from the redirect or metadata.
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const db = createSupabaseServiceRoleClient();
    if (!db) return new Response("Unavailable", { status: 503 });
    const { data: identity, error: identityError } = await db.from("professional_stripe_test_accounts").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    if (identityError) throw identityError;
    if (!identity) return new Response("ignored", { status: 200 });
    const state = testSubscriptionState(subscription);
    const { error } = await db.rpc("record_professional_stripe_test_event", {
      p_event_id: event.id, p_event_created: event.created,
      p_customer_id: customerId, p_subscription_id: subscription.id,
      p_plan: state.plan, p_status: state.status, p_period_end: state.current_period_end,
    });
    if (error) throw error;
    return new Response("ok", { status: 200 });
  } catch { return new Response("Test synchronization failed", { status: 500 }); }
}
