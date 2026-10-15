import test from "node:test";
import assert from "node:assert/strict";
import { canUseGoogleOAuth } from "../lib/auth/provider-capability.ts";

const env = { url: "https://project.example", anonKey: "public-test-key" };
const json = (value: unknown) => (async () => Response.json(value)) as typeof fetch;

test("Google requires an explicit boolean true in provider settings", async () => {
  for (const value of [null, [], {}, { external: null }, { external: {} },
    { external: { google: false } }, { external: { google: "true" } },
    { external: { google: 1 } }]) {
    assert.equal(await canUseGoogleOAuth(env, new AbortController().signal, json(value)), false);
  }
  assert.equal(await canUseGoogleOAuth(env, new AbortController().signal, json({ external: { google: true } })), true);
});

test("missing configuration and cancelled checks never request settings", async () => {
  let calls = 0;
  const request = (async () => { calls++; return Response.json({ external: { google: true } }); }) as typeof fetch;
  const controller = new AbortController();
  assert.equal(await canUseGoogleOAuth(null, controller.signal, request), false);
  controller.abort();
  assert.equal(await canUseGoogleOAuth(env, controller.signal, request), false);
  assert.equal(calls, 0);
});

test("HTTP failure, invalid JSON and network errors keep Google unavailable", async () => {
  for (const request of [
    async () => new Response("denied", { status: 403 }),
    async () => new Response("not-json"),
    async () => { throw new Error("offline"); },
  ]) assert.equal(await canUseGoogleOAuth(env, new AbortController().signal, request as typeof fetch), false);
});

test("a response arriving after cancellation cannot enable Google", async () => {
  const controller = new AbortController();
  const request = (async () => {
    controller.abort();
    return Response.json({ external: { google: true } });
  }) as typeof fetch;
  assert.equal(await canUseGoogleOAuth(env, controller.signal, request), false);
});

test("settings lookup passes only public API key and cancellation signal", async () => {
  const signal = new AbortController().signal;
  const request = (async (url, options) => {
    assert.equal(url, "https://project.example/auth/v1/settings");
    assert.deepEqual(options, { headers: { apikey: "public-test-key" }, signal });
    return Response.json({ external: { google: true } });
  }) as typeof fetch;
  assert.equal(await canUseGoogleOAuth(env, signal, request), true);
});
