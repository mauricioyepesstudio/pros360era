import test from "node:test";
import assert from "node:assert/strict";
import { beginGoogleAccountLink, completeGoogleAccountLink, googleLinkReturnPath } from "../lib/account/google-linking.ts";

function starter(userId: string | null = "owner") {
  const calls: unknown[] = [];
  const client = {
    getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }),
    linkIdentity: async (input: unknown) => { calls.push(input); return { data: { url: "https://accounts.google.com/o/oauth2/v2/auth?state=opaque" }, error: null }; },
  };
  return { client, calls };
}

test("Google is linked to the current owner with PKCE callback and explicit account choice", async () => {
  const { client, calls } = starter();
  const result = await beginGoogleAccountLink(client, "owner", "https://evolusa.vercel.app");
  assert.equal(result.ok, true);
  const request = calls[0] as { provider: string; options: { redirectTo: string; queryParams: { prompt: string }; skipBrowserRedirect: boolean } };
  assert.equal(request.provider, "google");
  assert.equal(request.options.queryParams.prompt, "select_account");
  assert.equal(request.options.skipBrowserRedirect, true);
  const callback = new URL(request.options.redirectTo);
  assert.equal(callback.origin, "https://evolusa.vercel.app");
  assert.equal(callback.pathname, "/auth/callback");
  assert.equal(callback.searchParams.get("next"), googleLinkReturnPath);
  assert.equal(callback.searchParams.get("intent"), "link_google");
});

for (const userId of [null, "another-user"]) {
  test(`missing or changed session cannot initiate a link (${userId})`, async () => {
    const { client, calls } = starter(userId);
    assert.equal((await beginGoogleAccountLink(client, "owner", "https://evolusa.vercel.app")).ok, false);
    assert.equal(calls.length, 0);
  });
}

test("disabled manual linking is actionable without exposing provider messages", async () => {
  const { client } = starter();
  const result = await beginGoogleAccountLink({ ...client, linkIdentity: async () => ({ data: { url: null }, error: { code: "manual_linking_disabled", message: "sensitive-provider-details" } }) }, "owner", "https://evolusa.vercel.app");
  assert.equal(result.ok, false);
  if (!result.ok) { assert.match(result.message, /administrador/); assert.ok(!result.message.includes("sensitive-provider")); }
});

test("an already-linked identity is not merged or replaced", async () => {
  const { client } = starter();
  const result = await beginGoogleAccountLink({ ...client, linkIdentity: async () => ({ data: { url: null }, error: { code: "identity_already_exists" } }) }, "owner", "https://evolusa.vercel.app");
  assert.equal(result.ok, false);
});

test("a foreign redirect or a session changed during authorization is refused", async () => {
  const { client } = starter();
  const foreign = { ...client, linkIdentity: async () => ({ data: { url: "https://malicious.example/" }, error: null }) };
  assert.equal((await beginGoogleAccountLink(foreign, "owner", "https://evolusa.vercel.app")).ok, false);
  let reads = 0;
  const switched = { ...client, getUser: async () => ({ data: { user: { id: ++reads === 1 ? "owner" : "another" } }, error: null }) };
  assert.equal((await beginGoogleAccountLink(switched, "owner", "https://evolusa.vercel.app")).ok, false);
});

function callback(beforeId: string | null, afterId: string | null) {
  let exchanges = 0, signouts = 0;
  return {
    client: {
      getUser: async () => ({ data: { user: beforeId ? { id: beforeId } : null }, error: null }),
      exchangeCodeForSession: async () => { exchanges++; return { data: { user: afterId ? { id: afterId } : null }, error: null }; },
      signOut: async (options: { scope: "local" }) => { assert.equal(options.scope, "local"); signouts++; return { error: null }; },
    },
    counts: () => ({ exchanges, signouts }),
  };
}

test("callback keeps the original account and cannot sign in as a different user", async () => {
  const same = callback("owner", "owner");
  assert.equal(await completeGoogleAccountLink(same.client, "code"), true);
  assert.deepEqual(same.counts(), { exchanges: 1, signouts: 0 });
  const different = callback("owner", "another");
  assert.equal(await completeGoogleAccountLink(different.client, "code"), false);
  assert.deepEqual(different.counts(), { exchanges: 1, signouts: 1 });
  const missing = callback(null, "owner");
  assert.equal(await completeGoogleAccountLink(missing.client, "code"), false);
  assert.deepEqual(missing.counts(), { exchanges: 0, signouts: 0 });
});
