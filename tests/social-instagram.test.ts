import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { decryptToken, encryptToken, parseSignedRequest, readSocialTokenKey, signState, verifyState } from "../lib/social/crypto.ts";
import {
  cleanAuthCode,
  exchangeCodeForLongLivedToken,
  fetchInstagramAccount,
  getInstagramConfig,
  instagramAuthorizeUrl,
  INSTAGRAM_SCOPES,
} from "../lib/social/instagram.ts";
import { needsRefresh } from "../lib/social/refresh-policy.ts";

const rawKey = randomBytes(32).toString("base64");
const key = readSocialTokenKey(rawKey)!;
const env = { INSTAGRAM_APP_ID: "1234567890", INSTAGRAM_APP_SECRET: "app-secret", SOCIAL_TOKEN_KEY: rawKey } as unknown as NodeJS.ProcessEnv;

test("the token key must be exactly 32 bytes", () => {
  assert.equal(readSocialTokenKey(undefined), null);
  assert.equal(readSocialTokenKey(randomBytes(16).toString("base64")), null);
  assert.ok(key);
});

test("tokens round-trip encrypted and any tampering fails closed", () => {
  const sealed = encryptToken("IGQV-secret-token", key, "178");
  assert.ok(!sealed.includes("IGQV"));
  assert.equal(decryptToken(sealed, key, "178"), "IGQV-secret-token");
  assert.equal(decryptToken(sealed, key, "999"), null, "bound to its account");
  assert.notEqual(encryptToken("IGQV-secret-token", key, "178"), sealed, "a fresh IV each time");
  const parts = sealed.split(".");
  parts[3] = Buffer.from("other").toString("base64url");
  assert.equal(decryptToken(parts.join("."), key, "178"), null);
  assert.equal(decryptToken(sealed, readSocialTokenKey(randomBytes(32).toString("base64"))!, "178"), null);
  assert.equal(decryptToken("garbage", key, "178"), null);
});

test("OAuth state is signed, expires, and can't be forged", () => {
  const now = Date.now();
  const state = { userId: "u-1", nonce: "n-1", exp: Math.floor(now / 1000) + 600 };
  const signed = signState(state, key);
  assert.deepEqual(verifyState(signed, key, now), state);
  assert.equal(verifyState(signed, key, now + 601_000), null, "expired");
  const [payload] = signed.split(".");
  const forged = Buffer.from(JSON.stringify({ ...state, userId: "u-2" })).toString("base64url");
  assert.equal(verifyState(`${forged}.${signed.split(".")[1]}`, key, now), null);
  assert.equal(verifyState(`${payload}.`, key, now), null);
  assert.equal(verifyState(null, key, now), null);
  // A token-subkey MAC must not validate as a state signature.
  assert.equal(verifyState(encryptToken("x", key, "178"), key, now), null);
});

test("Meta signed_request is verified with the app secret", () => {
  const payload = Buffer.from(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: "17841400000000000", issued_at: 1 })).toString("base64url");
  const signature = createHmac("sha256", "app-secret").update(payload).digest("base64url");
  assert.equal(parseSignedRequest(`${signature}.${payload}`, "app-secret")?.user_id, "17841400000000000");
  assert.equal(parseSignedRequest(`${signature}.${payload}`, "other-secret"), null);
  assert.equal(parseSignedRequest(`${signature}x.${payload}`, "app-secret"), null);
  assert.equal(parseSignedRequest(null, "app-secret"), null);
  assert.equal(parseSignedRequest(`${signature}.${payload}`, ""), null);
  const bare = Buffer.from(JSON.stringify({ user_id: "1" })).toString("base64url");
  assert.equal(parseSignedRequest(`${createHmac("sha256", "app-secret").update(bare).digest("base64url")}.${bare}`, "app-secret"), null, "algorithm is required");
});

test("config is null until every secret is set, and the redirect is the registered one", () => {
  assert.equal(getInstagramConfig({} as NodeJS.ProcessEnv), null);
  assert.equal(getInstagramConfig({ ...env, SOCIAL_TOKEN_KEY: "" }), null);
  assert.equal(getInstagramConfig({ ...env, INSTAGRAM_APP_ID: "abc" }), null);
  const config = getInstagramConfig(env)!;
  assert.equal(config.redirectUri, "https://evolusa.vercel.app/api/social/instagram/callback");
  const url = new URL(instagramAuthorizeUrl(config, "STATE"));
  assert.equal(url.origin + url.pathname, "https://www.instagram.com/oauth/authorize");
  assert.equal(url.searchParams.get("client_id"), "1234567890");
  assert.equal(url.searchParams.get("redirect_uri"), config.redirectUri);
  assert.equal(url.searchParams.get("scope"), INSTAGRAM_SCOPES.join(","));
  assert.equal(url.searchParams.get("state"), "STATE");
  assert.ok(!url.toString().includes("app-secret"));
});

test("the auth code drops Meta's #_ suffix", () => {
  assert.equal(cleanAuthCode("AQB123#_"), "AQB123");
  assert.equal(cleanAuthCode(""), null);
  assert.equal(cleanAuthCode(null), null);
});

test("code exchange goes short-lived → long-lived and reads the account", async () => {
  const config = getInstagramConfig(env)!;
  const calls: string[] = [];
  const fake = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    if (url === "https://api.instagram.com/oauth/access_token") {
      const body = init?.body as URLSearchParams;
      assert.equal(body.get("code"), "CODE");
      assert.equal(body.get("redirect_uri"), config.redirectUri);
      return Response.json({ data: [{ access_token: "short", user_id: "178", permissions: "instagram_business_basic,instagram_business_content_publish" }] });
    }
    if (url.startsWith("https://graph.instagram.com/access_token")) return Response.json({ access_token: "long", token_type: "bearer", expires_in: 5_184_000 });
    if (url.includes("/me?")) return Response.json({ user_id: "178", username: "onemigration", account_type: "BUSINESS" });
    return new Response("{}", { status: 404 });
  }) as typeof fetch;

  const token = await exchangeCodeForLongLivedToken(config, "CODE", fake, 0);
  assert.equal(token.accessToken, "long");
  assert.equal(token.expiresAt.getTime(), 5_184_000_000);
  assert.deepEqual(token.grantedScopes, ["instagram_business_basic", "instagram_business_content_publish"]);
  assert.deepEqual(await fetchInstagramAccount("long", fake), { id: "178", username: "onemigration", accountType: "BUSINESS" });
  assert.equal(calls.length, 3);

  const failing = (async () => Response.json({ error: { message: "bad" } }, { status: 400 })) as typeof fetch;
  await assert.rejects(exchangeCodeForLongLivedToken(config, "CODE", failing));
});

test("tokens refresh inside the 15-day window, only once a day old", () => {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.UTC(2026, 9, 9);
  const at = (offset: number) => new Date(now + offset).toISOString();
  assert.equal(needsRefresh({ token_expires_at: at(40 * day), token_refreshed_at: at(-20 * day) }, now), "skip");
  assert.equal(needsRefresh({ token_expires_at: at(10 * day), token_refreshed_at: at(-50 * day) }, now), "refresh");
  assert.equal(needsRefresh({ token_expires_at: at(10 * day), token_refreshed_at: at(-1000) }, now), "skip");
  assert.equal(needsRefresh({ token_expires_at: at(-1000), token_refreshed_at: null }, now), "expired");
  assert.equal(needsRefresh({ token_expires_at: null, token_refreshed_at: null }, now), "skip");
});

test("the migration never grants the token column to clients", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261009_social_connections_v1.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on public\.social_connections from public, anon, authenticated/);
  const grants = sql.split("\n").filter((line) => /^\s*grant /i.test(line));
  assert.ok(grants.length > 0);
  for (const line of grants) {
    // The only anon grant: the status RPC that returns a date for a random code.
    if (line.includes("anon")) assert.equal(line.trim(), "grant execute on function public.social_deletion_request_date(text) to anon, authenticated;");
    assert.ok(!/grant (all|select|insert|update) on/i.test(line), `table-wide grant: ${line}`);
  }
  const selectGrant = sql.slice(sql.indexOf("grant select ("), sql.indexOf("on public.social_connections to authenticated"));
  assert.ok(!selectGrant.includes("token_ciphertext"));
  assert.ok(!selectGrant.includes("provider_account_id"));
  assert.match(sql, /revoke all on function public\.social_deletion_request_date\(text\) from public, anon, authenticated/);
  const deletionTable = sql.slice(sql.indexOf("create table public.social_data_deletion_requests"), sql.indexOf("alter table public.social_data_deletion_requests"));
  assert.ok(!deletionTable.includes("provider_account_id"), "deletion log keeps only a hash");
});
