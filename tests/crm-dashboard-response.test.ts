import test from "node:test";
import assert from "node:assert/strict";
import { CRMUnavailableError, parseCRMDashboardResponse, requireCRMQuery } from "../lib/crm/dashboard-response.ts";

const empty = { totalLeads: 0, leadsThisMonth: 0, leadsBySource: {}, conversationsByChannel: {}, openConversations: 0, tasksOverdue: 0, tasksToday: 0, opportunitiesInPipeline: 0, pipelineValue: 0, conversionRate: 0 };

test("database schema/access failures are not successful empty dashboards", async () => {
  await assert.rejects(requireCRMQuery(Promise.resolve({ data: null, count: null, error: { code: "42P01" } })), CRMUnavailableError);
  await assert.rejects(requireCRMQuery(Promise.resolve({ data: null, count: null, error: { code: "42501" } })), CRMUnavailableError);
});

test("genuine empty query results are valid", async () => {
  const result = { data: [], count: 0, error: null };
  assert.equal(await requireCRMQuery(Promise.resolve(result)), result);
  assert.deepEqual(parseCRMDashboardResponse(empty), empty);
});

test("error payloads and incomplete metrics never reach dashboard formatting", () => {
  for (const value of [null, { error: "Not configured" }, {}, { ...empty, conversionRate: undefined }, { ...empty, conversionRate: "0" }, { ...empty, pipelineValue: Infinity }, { ...empty, leadsBySource: [] }]) {
    assert.equal(parseCRMDashboardResponse(value), null);
  }
});

import { isGrowthAutomationReady } from "../lib/growth-automation/readiness.ts";
import { readFileSync } from "node:fs";

test("unfinished growth cannot initiate OAuth, exchange tokens, generate or publish content", () => {
  assert.equal(isGrowthAutomationReady(), false);
  for (const route of ["auth", "callback", "publish", "metrics", "content/generate", "content/schedule"]) {
    const source = readFileSync(new URL(`../app/api/growth-automation/${route}/route.ts`, import.meta.url), "utf8");
    assert.match(source, /export async function (GET|POST)\([^\n]*\) \{\s*if \(!isGrowthAutomationReady\(\)\)/);
    assert.match(source, /status: 503/);
  }
});
