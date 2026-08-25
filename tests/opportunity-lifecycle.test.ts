import test from "node:test";
import assert from "node:assert/strict";
import { getEffectiveStatus, isValidDeclineReason } from "../lib/opportunities/lifecycle.ts";

test("ROUTED with no expiresAt never shows as expired", () => {
  assert.equal(getEffectiveStatus("ROUTED", null), "ROUTED");
});

test("ROUTED with a future expiresAt is still ROUTED", () => {
  const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  assert.equal(getEffectiveStatus("ROUTED", future), "ROUTED");
});

test("ROUTED with a past expiresAt effectively shows as EXPIRED", () => {
  const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
  assert.equal(getEffectiveStatus("ROUTED", past), "EXPIRED");
});

test("CONTACTED past its original expiresAt is never shown as expired — expiry only ever gates ROUTED", () => {
  const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
  assert.equal(getEffectiveStatus("CONTACTED", past), "CONTACTED");
});

test("COMPLETED/DECLINED are never reclassified regardless of expiresAt", () => {
  const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
  assert.equal(getEffectiveStatus("COMPLETED", past), "COMPLETED");
  assert.equal(getEffectiveStatus("DECLINED", past), "DECLINED");
});

test("professional decline reasons are only valid for PROFESSIONAL", () => {
  assert.equal(isValidDeclineReason("PROFESSIONAL", "AT_CAPACITY"), true);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "OUTSIDE_SCOPE"), true);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "UNREACHABLE"), true);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "OTHER"), true);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "FOUND_HELP_ELSEWHERE"), false);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "NO_LONGER_NEEDED"), false);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "NOT_A_FIT"), false);
});

test("member decline reasons are only valid for MEMBER", () => {
  assert.equal(isValidDeclineReason("MEMBER", "FOUND_HELP_ELSEWHERE"), true);
  assert.equal(isValidDeclineReason("MEMBER", "NO_LONGER_NEEDED"), true);
  assert.equal(isValidDeclineReason("MEMBER", "NOT_A_FIT"), true);
  assert.equal(isValidDeclineReason("MEMBER", "OTHER"), true);
  assert.equal(isValidDeclineReason("MEMBER", "AT_CAPACITY"), false);
  assert.equal(isValidDeclineReason("MEMBER", "OUTSIDE_SCOPE"), false);
  assert.equal(isValidDeclineReason("MEMBER", "UNREACHABLE"), false);
});

test("an unrecognized reason string is invalid for either actor", () => {
  assert.equal(isValidDeclineReason("MEMBER", "MADE_UP_REASON"), false);
  assert.equal(isValidDeclineReason("PROFESSIONAL", "MADE_UP_REASON"), false);
});
