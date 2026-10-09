import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  cleanLinkedInCode,
  exchangeLinkedInCode,
  fetchLinkedInAccount,
  getLinkedInConfig,
  linkedInAuthorizeUrl,
  LINKEDIN_SCOPES,
} from "../lib/social/linkedin.ts";

const env = { LINKEDIN_CLIENT_ID: "86abc123xyz", LINKEDIN_CLIENT_SECRET: "secret", SOCIAL_TOKEN_KEY: randomBytes(32).toString("base64") } as unknown as NodeJS.ProcessEnv;

test("LinkedIn stays off until every secret is set", () => {
  assert.equal(getLinkedInConfig({} as NodeJS.ProcessEnv), null);
  assert.equal(getLinkedInConfig({ ...env, LINKEDIN_CLIENT_SECRET: "" }), null);
  assert.equal(getLinkedInConfig({ ...env, LINKEDIN_CLIENT_ID: "bad id!" }), null);
  assert.equal(getLinkedInConfig(env)?.redirectUri, "https://evolusa.vercel.app/api/social/linkedin/callback");
});

test("the authorize URL asks only for sign-in and posting on the member's own profile", () => {
  const url = new URL(linkedInAuthorizeUrl(getLinkedInConfig(env)!, "signed-state"));
  assert.equal(url.origin + url.pathname, "https://www.linkedin.com/oauth/v2/authorization");
  assert.equal(url.searchParams.get("scope"), "openid profile w_member_social");
  assert.deepEqual([...LINKEDIN_SCOPES], ["openid", "profile", "w_member_social"]);
  assert.equal(url.searchParams.get("state"), "signed-state");
});

test("odd authorization codes are rejected", () => {
  assert.equal(cleanLinkedInCode(null), null);
  assert.equal(cleanLinkedInCode("short"), null);
  assert.equal(cleanLinkedInCode("AQT abc def ghi"), null);
  assert.equal(cleanLinkedInCode(" AQTtoken_value-123456 "), "AQTtoken_value-123456");
});

test("code exchange and profile lookup", async () => {
  const seen: { url: string; body?: string }[] = [];
  const fake = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    seen.push({ url, body: init?.body ? String(init.body) : undefined });
    if (url.includes("accessToken")) return Response.json({ access_token: "li-token", expires_in: 5184000, scope: "openid,profile,w_member_social" });
    return Response.json({ sub: "abc123XYZ", name: "José Miguel Acosta" });
  }) as typeof fetch;
  const token = await exchangeLinkedInCode(getLinkedInConfig(env)!, "AQTcode123456", fake, 0);
  assert.equal(token.accessToken, "li-token");
  assert.equal(token.expiresAt.getTime(), 5184000 * 1000);
  assert.deepEqual(token.grantedScopes, ["openid", "profile", "w_member_social"]);
  assert.match(seen[0].body ?? "", /grant_type=authorization_code/);
  assert.match(seen[0].body ?? "", /redirect_uri=https%3A%2F%2Fevolusa\.vercel\.app/);
  assert.deepEqual(await fetchLinkedInAccount("li-token", fake), { id: "abc123XYZ", name: "José Miguel Acosta" });
});

test("LinkedIn errors surface instead of storing a half connection", async () => {
  const failing = (async () => Response.json({ error: "invalid_request" }, { status: 400 })) as unknown as typeof fetch;
  await assert.rejects(exchangeLinkedInCode(getLinkedInConfig(env)!, "AQTcode123456", failing), /linkedin_400/);
  const noSub = (async () => Response.json({ name: "Sin id" })) as unknown as typeof fetch;
  await assert.rejects(fetchLinkedInAccount("t", noSub), /linkedin_no_account/);
});

test("the migration only widens the allowed networks", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261009210000_social_connections_linkedin.sql", import.meta.url), "utf8");
  assert.match(sql, /check \(provider in \('instagram', 'linkedin'\)\)/);
  assert.doesNotMatch(sql, /^\s*(grant|revoke)\b/im);
});
