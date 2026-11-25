export const TEST_ACCOUNT_ID = "acct_1NucqoQbuB2Vh5F4";
export const TEST_PRICES = {
  starter: { id: "price_1UYF3JQbuB2Vh5F4dSIlAg59", cents: 2900 },
  professional: { id: "price_1UYF3uQbuB2Vh5F4OuoyPRkR", cents: 7900 },
  business: { id: "price_1UYF4IQbuB2Vh5F4MpAwaqAy", cents: 14900 },
} as const;
export type TestPlan = keyof typeof TEST_PRICES;

export function testBillingAllowed(env: Record<string, string | undefined>, userId?: string) {
  return env.PROFESSIONAL_STRIPE_TEST_ENABLED === "true"
    && env.VERCEL_ENV !== "production"
    && /^(sk|rk)_test_/.test(env.STRIPE_PROFESSIONAL_TEST_KEY ?? "")
    && (!userId || (env.PROFESSIONAL_STRIPE_TEST_USERS ?? "").split(",").map(s => s.trim()).includes(userId));
}

export function testPlan(value: unknown): TestPlan | null {
  return typeof value === "string" && Object.hasOwn(TEST_PRICES, value) ? value as TestPlan : null;
}

type SubscriptionSnapshot = {
  livemode: boolean; status: string;
  items: { data: { price: { id: string }; current_period_end: number }[] };
};

export function testSubscriptionState(subscription: SubscriptionSnapshot) {
  if (subscription.livemode || subscription.items.data.length !== 1) throw new Error("Unsupported subscription");
  const item = subscription.items.data[0];
  const plan = (Object.keys(TEST_PRICES) as TestPlan[]).find(key => TEST_PRICES[key].id === item.price.id);
  if (!plan || !Number.isFinite(item.current_period_end)) throw new Error("Unknown price or period");
  return { plan, status: subscription.status, current_period_end: new Date(item.current_period_end * 1000).toISOString() };
}
