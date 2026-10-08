import test from "node:test";
import assert from "node:assert/strict";
import { resolveAccountIdentity, isMissingSession, resolveSessionAccountIdentity } from "../lib/account/identity.ts";

const user = { id: "own-account", email: "owner@example.com" };
test("identity reads only the authenticated profile and preserves its real role", async () => {
  for (const role of ["MEMBER", "PROFESSIONAL", "ADMIN"] as const) {
    assert.deepEqual(await resolveAccountIdentity(user, async (id) => {
      assert.equal(id, user.id);
      return { role, error: false };
    }), { status: "ready", role, email: user.email });
  }
});
test("errors, absent rows and invalid roles never masquerade as MEMBER", async () => {
  for (const result of [{ role: "ADMIN", error: true }, { role: undefined, error: false }, { role: "OWNER", error: false }]) {
    assert.deepEqual(await resolveAccountIdentity(user, async () => result), { status: "role_unavailable", email: user.email });
  }
  assert.equal((await resolveAccountIdentity(user, async () => { throw new Error("offline"); })).status, "role_unavailable");
});
test("signed-out identity never performs a role lookup", async () => {
  assert.deepEqual(await resolveAccountIdentity(null, async () => { throw new Error("must not read"); }), { status: "signed_out", email: null });
});

test("absent sessions are distinguished from auth service failures", () => {
  assert.equal(isMissingSession({ name: "AuthSessionMissingError" }), true);
  assert.equal(isMissingSession({ code: "session_not_found" }), true);
  assert.equal(isMissingSession({ name: "AuthRetryableFetchError" }), false);
  assert.equal(isMissingSession(null), false);
});

test("session loader redirects missing session but fails closed on provider errors", async () => {
  const lookup = async () => { throw new Error("must not read role"); };
  assert.equal((await resolveSessionAccountIdentity(async () => ({ user: null, error: { name: "AuthSessionMissingError" } }), lookup)).status, "signed_out");
  assert.equal((await resolveSessionAccountIdentity(async () => ({ user: null, error: { name: "AuthRetryableFetchError" } }), lookup)).status, "role_unavailable");
  assert.equal((await resolveSessionAccountIdentity(async () => { throw new Error("network"); }, lookup)).status, "role_unavailable");
  assert.deepEqual(await resolveSessionAccountIdentity(async () => ({ user, error: null }), async () => ({ role: "ADMIN", error: false })), { status: "ready", role: "ADMIN", email: user.email });
});
