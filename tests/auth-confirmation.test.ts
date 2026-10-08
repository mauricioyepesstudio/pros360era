import test from "node:test";
import assert from "node:assert/strict";
import { authEntryDestination, confirmationRequestMessage, isExistingSignup, isUnconfirmedEmail, normalizeAuthEmail, requestConfirmation } from "../lib/auth/confirmation.ts";

test("confirmed/obfuscated signup copy does not claim delivery or disclose account existence", () => {
  assert.equal(isExistingSignup({ code: "user_already_exists", message: "opaque" }), true);
  assert.equal(isExistingSignup({ message: "User already registered" }), true);
  assert.match(confirmationRequestMessage, /Si hay una cuenta pendiente/);
  assert.doesNotMatch(confirmationRequestMessage, /[Tt]e enviamos|no existe|ya est[áa] registrada/);
  assert.equal(normalizeAuthEmail("  TEST@EXAMPLE.COM "), "test@example.com");
});
test("cooldown and invalid email do not make resend requests", async () => {
  let calls = 0; const client = { resend: async () => { calls++; return { error: null }; } };
  assert.equal((await requestConfirmation(client, "test@example.com", 1)).requested, false);
  assert.equal((await requestConfirmation(client, "not-email", 0)).requested, false);
  assert.equal(calls, 0);
});
test("resend uses real signup API and neutral acceptance without changing a role", async () => {
  let credentials: unknown;
  const result = await requestConfirmation({ resend: async (input) => { credentials = input; return { error: null }; } }, "  Test@Example.com ", 0);
  assert.deepEqual(credentials, { type: "signup", email: "test@example.com" });
  assert.equal(result.requested, true); assert.equal(result.message, confirmationRequestMessage);
});
test("resend rate/error/network failures never report requested success", async () => {
  const limited = await requestConfirmation({ resend: async () => ({ error: { code: "over_email_send_rate_limit", message: "limited" } }) }, "a@example.com", 0);
  assert.equal(limited.requested, false); assert.match(limited.message, /límite temporal/);
  const hidden = await requestConfirmation({ resend: async () => ({ error: { message: "User not found" } }) }, "a@example.com", 0);
  assert.equal(hidden.requested, false); assert.doesNotMatch(hidden.message, /not found|no existe/);
  const network = await requestConfirmation({ resend: async () => { throw new Error("network"); } }, "a@example.com", 0);
  assert.equal(network.requested, false);
});
test("unconfirmed login offers recovery and professional entry cannot elevate roles", () => {
  assert.equal(isUnconfirmedEmail({ code: "email_not_confirmed", message: "opaque" }), true);
  assert.equal(isUnconfirmedEmail({ message: "Invalid login credentials" }), false);
  assert.equal(authEntryDestination("/dashboard/professional", "MEMBER"), "/dashboard/professional");
  assert.equal(authEntryDestination("/dashboard/professional", "PROFESSIONAL"), "/panel-profesional");
  assert.equal(authEntryDestination("/dashboard/professional", undefined), "/dashboard/professional");
  assert.equal(authEntryDestination("https://attacker.invalid/", "PROFESSIONAL"), "/dashboard");
  assert.equal(authEntryDestination("/dashboard", "MEMBER"), "/dashboard");
});


test("admin professional entry uses the professional panel without changing default member entry", () => {
  assert.equal(authEntryDestination("/dashboard/professional", "ADMIN"), "/panel-profesional");
  assert.equal(authEntryDestination("/dashboard", "ADMIN"), "/dashboard");
});
