import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { APP_ORIGIN, AUTH_ORIGIN, allowedRequest } = createRequire(import.meta.url)("../scripts/auth-acceptance-policy.cjs");

test("acceptance allows own page and asset reads but blocks API side effects", () => {
  assert.equal(allowedRequest(APP_ORIGIN + "/panel-profesional/perfil", "GET"), true);
  assert.equal(allowedRequest(APP_ORIGIN + "/_next/static/example.js", "GET"), true);
  for (const path of ["/api/social/threads/connect", "/api/crm/leads", "/auth/callback", "/auth/signout"]) {
    assert.equal(allowedRequest(APP_ORIGIN + path, "GET"), false);
  }
});
test("acceptance blocks every same-origin data mutation", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal(allowedRequest(APP_ORIGIN + "/panel-profesional/perfil", method), false);
  }
});
test("acceptance only permits the fixed project's password token grant", () => {
  assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1/token?grant_type=password", "POST"), true);
  assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1/token?grant_type=password", "OPTIONS"), true);
  for (const query of ["", "?grant_type=refresh_token", "?grant_type=password&grant_type=refresh_token"]) {
    assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1/token" + query, "POST"), false);
  }
});
test("acceptance blocks signup, recovery and email sends", () => {
  for (const path of ["/signup", "/recover", "/resend", "/invite", "/verify", "/authorize"]) {
    for (const method of ["GET", "POST"]) assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1" + path, method), false);
  }
});
test("cleanup revokes only the local session, never owner sessions", () => {
  assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1/logout?scope=local", "POST"), true);
  for (const query of ["", "?scope=global", "?scope=others", "?scope=local&scope=global"]) {
    assert.equal(allowedRequest(AUTH_ORIGIN + "/auth/v1/logout" + query, "POST"), false);
  }
});
test("acceptance refuses foreign origins, lookalikes and URL credentials", () => {
  for (const url of ["https://evil.example/login", "https://evolusa.vercel.app.evil.example/login", "http://evolusa.vercel.app/login", "https://user:pass@evolusa.vercel.app/login", "not a URL", "https://other.supabase.co/auth/v1/token?grant_type=password"]) {
    assert.equal(allowedRequest(url, "GET"), false);
    assert.equal(allowedRequest(url, "POST"), false);
  }
});
test("public settings and own Auth user reads do not permit updates", () => {
  for (const path of ["/auth/v1/settings", "/auth/v1/user"]) {
    assert.equal(allowedRequest(AUTH_ORIGIN + path, "GET"), true);
    assert.equal(allowedRequest(AUTH_ORIGIN + path, "POST"), false);
    assert.equal(allowedRequest(AUTH_ORIGIN + path, "PUT"), false);
  }
});

test("professional acceptance refuses an old admin or a different owner's email", () => {
  const { allowedAccount } = createRequire(import.meta.url)("../scripts/auth-acceptance-policy.cjs");
  assert.equal(allowedAccount("PRO", "mauricioyepes01@gmail.com"), true);
  assert.equal(allowedAccount("PRO", " MauricioYepes01@gmail.com "), true);
  assert.equal(allowedAccount("PRO", "another@example.invalid"), false);
  assert.equal(allowedAccount("ADMIN", "mauricioyepes01@gmail.com"), false);
  assert.equal(allowedAccount("MEMBER", "member@example.invalid"), true);
});
