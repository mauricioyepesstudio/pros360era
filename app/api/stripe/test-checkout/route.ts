import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { TEST_ACCOUNT_ID, TEST_PRICES, testBillingAllowed, testPlan } from "@/lib/stripe/professional-test-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!testBillingAllowed(process.env)) return new Response("Test billing disabled", { status: 503 });
  const origin = process.env.PROFESSIONAL_STRIPE_TEST_ORIGIN;
  if (!origin || new URL(origin).origin !== origin || request.headers.get("origin") !== origin) return new Response("Forbidden", { status: 403 });
  const auth = await createSupabaseServerClient();
  if (!auth) return new Response("Unavailable", { status: 503 });
  const { data: { user }, error: authError } = await auth.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });
  if (!testBillingAllowed(process.env, user.id)) return new Response("Forbidden", { status: 403 });
  let input: unknown;
  try { input = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
  const plan = testPlan(input && typeof input === "object" && "plan" in input ? input.plan : null);
  if (!plan) return new Response("Invalid plan", { status: 400 });
  const db = createSupabaseServiceRoleClient();
  if (!db) return new Response("Unavailable", { status: 503 });
  // This is a separate, explicitly provisioned test identity. Never enroll pilot rows.
  const { data: identity, error } = await db.from("professional_stripe_test_accounts").select("user_id,professional_profile_id,stripe_customer_id,stripe_subscription_id").eq("user_id", user.id).maybeSingle();
  if (error || !identity || identity.stripe_subscription_id) return new Response("Test identity unavailable", { status: 409 });
  const { data: ownedProfile, error: ownerError } = await db.from("professional_profiles").select("id").eq("id", identity.professional_profile_id).eq("user_id", user.id).maybeSingle();
  if (ownerError || !ownedProfile) return new Response("Forbidden", { status: 403 });
  const { data: exempt, error: exemptError } = await db.from("professional_subscriptions").select("billing_exempt").eq("professional_profile_id", identity.professional_profile_id).maybeSingle();
  if (exemptError || exempt?.billing_exempt !== false) return new Response("Billing exemption protected", { status: 403 });
  try {
    const stripe = new Stripe(process.env.STRIPE_PROFESSIONAL_TEST_KEY!);
    const account = await stripe.accounts.retrieve();
    if (account.id !== TEST_ACCOUNT_ID) return new Response("Wrong test account", { status: 503 });
    const price = await stripe.prices.retrieve(TEST_PRICES[plan].id);
    if (price.livemode || !price.active || price.currency !== "usd" || price.unit_amount !== TEST_PRICES[plan].cents || price.recurring?.interval !== "month" || price.recurring.interval_count !== 1) return new Response("Invalid test price", { status: 503 });
    let customerId: string = identity.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({}, { idempotencyKey: `evolusa-test-customer-${user.id}` });
      customerId = customer.id;
      const { error: saveError } = await db.from("professional_stripe_test_accounts").update({ stripe_customer_id: customerId }).eq("user_id", user.id);
      if (saveError) throw new Error("Customer persistence failed");
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/planes-profesionales?test_checkout=returned`,
      cancel_url: `${origin}/planes-profesionales?test_checkout=canceled`,
    }, { idempotencyKey: `evolusa-test-checkout-${user.id}` });
    if (session.livemode || !session.url) throw new Error("Invalid test session");
    return Response.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("Test checkout unavailable", { status: 502 });
  }
}
