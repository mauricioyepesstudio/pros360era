import test from "node:test";
import assert from "node:assert/strict";
import { generateRoadmap } from "../lib/roadmap/generateRoadmap.ts";

function ids(items: ReturnType<typeof generateRoadmap>["now"]) { return items.map((item) => item.id); }

test("newly arrived user without a business gets orientation", () => {
  const result = generateRoadmap({ timeInUs: "under_6_months", hasBusiness: "no", primaryPriority: "settle" });
  assert.equal(result.primaryStage, "LLEGA");
  assert.ok(ids(result.now).includes("organize-next-steps"));
  assert.match(result.disclaimer, /no constituye asesoría/i);
});

test("user who wants to create a company gets business readiness", () => {
  const result = generateRoadmap({ hasBusiness: "no", primaryPriority: "start_business" });
  assert.equal(result.primaryStage, "EMPRENDE");
  assert.ok(ids(result.now).includes("business-readiness"));
  assert.ok(result.upcoming.some((item) => item.id === "business-registration"));
});

test("existing business without digital presence gets growth actions", () => {
  const result = generateRoadmap({ hasBusiness: "yes", businessRegistered: "yes", hasWebsite: "no", hasGoogleBusiness: "no", getsCustomersConsistently: "no", primaryPriority: "get_customers" });
  assert.equal(result.primaryStage, "CRECE");
  assert.ok(ids(result.now).includes("website"));
  assert.ok(ids(result.now).includes("customer-system"));
  assert.ok(result.upcoming.some((item) => item.id === "google-business"));
});

test("existing business needing organization gets bookkeeping", () => {
  const result = generateRoadmap({ hasBusiness: "yes", hasBookkeeping: "no", primaryPriority: "organize_business" });
  assert.equal(result.primaryStage, "PROTEGETE");
  assert.ok(ids(result.now).includes("bookkeeping"));
});

test("incomplete answers return a safe useful default", () => {
  const result = generateRoadmap({});
  assert.equal(result.primaryStage, "ESTABLECETE");
  assert.deepEqual(ids(result.now), ["organize-next-steps"]);
  assert.equal(result.version, "1.0.0");
});
