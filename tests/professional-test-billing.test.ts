import assert from "node:assert/strict";
import { test } from "node:test";
import { TEST_PRICES, testBillingAllowed, testPlan, testSubscriptionState } from "../lib/stripe/professional-test-policy.ts";

const env = { PROFESSIONAL_STRIPE_TEST_ENABLED: "true", STRIPE_PROFESSIONAL_TEST_KEY: "rk_test_fixture", PROFESSIONAL_STRIPE_TEST_USERS: "tester" };
test("test billing fails closed and cannot run in production or with live credentials", () => {
  assert.equal(testBillingAllowed({}), false);
  assert.equal(testBillingAllowed(env, "tester"), true);
  assert.equal(testBillingAllowed(env, "other"), false);
  assert.equal(testBillingAllowed({ ...env, VERCEL_ENV: "production" }, "tester"), false);
  assert.equal(testBillingAllowed({ ...env, STRIPE_PROFESSIONAL_TEST_KEY: "rk_live_fixture" }), false);
});
test("only the server catalog can select a plan", () => {
  for (const key of Object.keys(TEST_PRICES)) assert.equal(testPlan(key), key);
  for (const value of [null, "pilot", "__proto__", "constructor", "price_arbitrary", 29]) assert.equal(testPlan(value), null);
});
test("verified subscription snapshots preserve lifecycle states without granting entitlements", () => {
  for (const status of ["active", "past_due", "canceled", "incomplete", "unpaid", "paused"]) {
    const snapshot = { livemode: false, status, items: { data: [{ price: { id: TEST_PRICES.starter.id }, current_period_end: 1796000000 }] } };
    assert.deepEqual(testSubscriptionState(snapshot), { plan: "starter", status, current_period_end: new Date(1796000000000).toISOString() });
    assert.throws(() => testSubscriptionState({ ...snapshot, livemode: true }));
    assert.throws(() => testSubscriptionState({ ...snapshot, items: { data: [] } }));
    assert.throws(() => testSubscriptionState({ ...snapshot, items: { data: [{ price: { id: "price_other" }, current_period_end: 1 }] } }));
  }
});
