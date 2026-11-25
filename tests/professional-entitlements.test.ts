import assert from "node:assert/strict";
import { test } from "node:test";
import { hasProfessionalEntitlement } from "../lib/professional-entitlements.ts";

test("unassigned accounts receive no entitlements", () => {
  assert.equal(hasProfessionalEntitlement(null, "public_profile"), false);
});
test("pilot can access basic inbox but not paid CRM", () => {
  const pilot = { plan: "pilot", status: "pilot", pilotEndsAt: "2026-12-01T00:00:00Z" } as const;
  assert.equal(hasProfessionalEntitlement(pilot, "lead_inbox", new Date("2026-11-04")), true);
  assert.equal(hasProfessionalEntitlement(pilot, "crm", new Date("2026-11-04")), false);
  assert.equal(hasProfessionalEntitlement(pilot, "lead_inbox", new Date("2026-12-02")), false);
});
test("paid selection cannot bypass disabled billing", () => {
  assert.equal(hasProfessionalEntitlement({ plan: "business", status: "active" }, "agents"), false);
});

test("grandfathered professionals retain pilot access after nominal expiry", () => {
  const existing = { plan: "pilot", status: "pilot", pilotEndsAt: "2026-01-01T00:00:00Z", billingExempt: true } as const;
  assert.equal(hasProfessionalEntitlement(existing, "lead_inbox", new Date("2027-01-01")), true);
  assert.equal(hasProfessionalEntitlement(existing, "agents", new Date("2027-01-01")), false);
});
