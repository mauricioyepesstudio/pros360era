import test from "node:test";
import assert from "node:assert/strict";
import {
  getExpirationLabel,
  getMemberActions,
  getProfessionalActions,
  memberActionValues,
  professionalActionValues,
} from "../lib/opportunities/lifecycle.ts";
import { declineReasonsByActor, opportunityStatuses } from "../data/opportunities/types.ts";
import { declineReasonLabels, memberStateCopy, statusLabels } from "../data/opportunities/copy.ts";

const relevantStatuses = ["ROUTED", "CONTACTED", "COMPLETED", "DECLINED", "EXPIRED"] as const;

test("member state copy and status labels exist for every relevant status, with non-empty text", () => {
  for (const status of relevantStatuses) {
    assert.ok(memberStateCopy[status].headline.length > 0);
    assert.ok(memberStateCopy[status].supporting.length > 0);
    assert.ok(statusLabels[status].length > 0);
  }
});

test("every actor-scoped decline reason has a Spanish label, and OTHER is shared", () => {
  for (const reason of [...declineReasonsByActor.PROFESSIONAL, ...declineReasonsByActor.MEMBER]) {
    assert.ok(declineReasonLabels[reason]?.length > 0, `missing label for ${reason}`);
  }
  assert.equal(declineReasonLabels.OTHER, "Otra razón");
});

test("getExpirationLabel only applies while status is raw ROUTED", () => {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();
  const past = new Date(Date.now() - 1000).toISOString();

  assert.equal(getExpirationLabel("ROUTED", null), null);
  assert.equal(getExpirationLabel("ROUTED", future), "Expira en 2 días");
  assert.equal(getExpirationLabel("ROUTED", past), "Expiró");
  assert.equal(getExpirationLabel("CONTACTED", past), null);
  assert.equal(getExpirationLabel("COMPLETED", past), null);
  assert.equal(getExpirationLabel("DECLINED", past), null);
});

test("getExpirationLabel singularizes exactly one day remaining", () => {
  const almostOneDay = new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString();
  assert.equal(getExpirationLabel("ROUTED", almostOneDay), "Expira en 1 día");
});

test("member action availability matches the state machine, by effective status", () => {
  assert.deepEqual(getMemberActions("ROUTED"), ["DECLINE"]);
  assert.deepEqual(getMemberActions("CONTACTED"), ["CONFIRM_COMPLETION", "DECLINE"]);
  assert.deepEqual(getMemberActions("COMPLETED"), []);
  assert.deepEqual(getMemberActions("DECLINED"), ["START_NEW_SEARCH"]);
  assert.deepEqual(getMemberActions("EXPIRED"), ["START_NEW_SEARCH"]);
});

test("professional action availability matches the state machine, by effective status", () => {
  assert.deepEqual(getProfessionalActions("ROUTED"), ["MARK_CONTACTED", "DECLINE"]);
  assert.deepEqual(getProfessionalActions("CONTACTED"), ["DECLINE"]);
  assert.deepEqual(getProfessionalActions("COMPLETED"), []);
  assert.deepEqual(getProfessionalActions("DECLINED"), []);
  assert.deepEqual(getProfessionalActions("EXPIRED"), []);
});

test("the professional action vocabulary structurally has no completion action", () => {
  assert.equal(professionalActionValues.includes("CONFIRM_COMPLETION" as never), false);
  for (const status of opportunityStatuses) {
    assert.equal(getProfessionalActions(status).includes("CONFIRM_COMPLETION" as never), false);
  }
});

test("terminal states never offer an invalid action for either side", () => {
  assert.deepEqual(getMemberActions("COMPLETED"), []);
  assert.deepEqual(getProfessionalActions("COMPLETED"), []);
  assert.deepEqual(getProfessionalActions("DECLINED"), []);
  for (const action of getMemberActions("DECLINED")) {
    assert.ok((memberActionValues as readonly string[]).includes(action));
  }
});
