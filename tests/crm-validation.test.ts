import test from "node:test";
import assert from "node:assert/strict";
import { crmRoleAllowed, leadInput, contactInput, listInput } from "../lib/crm/validation.ts";
import { parseCRMDashboardResponse } from "../lib/crm/dashboard-response.ts";

test("lead capture cannot accept owner/status/score overrides or empty contacts", () => {
  for (const value of [null, {}, { source: "other" }, { source: "other", name: "   " }, { source: "other", name: "A", user_id: "spoof" }, { source: "other", name: "A", status: "converted" }, { source: "other", name: "A", qualification_score: 100 }, { source: "invalid", name: "A" }, { source: "other", email: "bad" }, { source: "other", name: "A", sourceUrl: "javascript:alert(1)" }]) assert.equal(leadInput.safeParse(value).success, false);
  assert.equal(leadInput.parse({ source: "referral", name: "  Ana  " }).name, "Ana");
});
test("contact capture cannot claim messaging consent or ownership", () => {
  assert.equal(contactInput.safeParse({ name: "Ana", opted_in_email: true }).success, false);
  assert.equal(contactInput.safeParse({ name: "Ana", user_id: "spoof" }).success, false);
  assert.equal(contactInput.safeParse({ name: "" }).success, false);
});
test("filters are bounded and unknown assignment/owner filters rejected", () => {
  for (const value of [{ page: "NaN" }, { page: "0" }, { pageSize: "101" }, { page: "1.2" }, { assignedTo: "other" }, { user_id: "other" }, { q: "x".repeat(101) }]) assert.equal(listInput.safeParse(value).success, false);
  assert.deepEqual(listInput.parse({}), { page: 1, pageSize: 20 });
});
test("CRM is professional/admin only; unfinished metrics explicitly null", () => {
  assert.equal(crmRoleAllowed("MEMBER"), false); assert.equal(crmRoleAllowed(undefined), false);
  assert.equal(crmRoleAllowed("PROFESSIONAL"), true); assert.equal(crmRoleAllowed("ADMIN"), true);
  assert.ok(parseCRMDashboardResponse({ totalLeads: 2, leadsThisMonth: 2, leadsBySource: { referral: 2 }, conversionRate: 0, conversationsByChannel: null, openConversations: null, tasksOverdue: null, tasksToday: null, opportunitiesInPipeline: null, pipelineValue: null }));
});
