import test from "node:test";
import assert from "node:assert/strict";
import { authCallbackUrl, emailLinkDestination, failedLinkDestination, parseEmailLinkType, recoveryCallbackUrl } from "../lib/auth/email-link.ts";
import { requestConfirmation } from "../lib/auth/confirmation.ts";

const origin = "https://evolusa.vercel.app";

test("email and Google links return to this site's callback, never the Site URL", () => {
  assert.equal(authCallbackUrl(origin, "/dashboard/professional"), `${origin}/auth/callback?next=%2Fdashboard%2Fprofessional`);
  assert.equal(recoveryCallbackUrl(origin), `${origin}/auth/callback?next=%2Freset-password`);
  for (const hostile of ["https://evil.example", "//evil.example", null]) {
    assert.equal(authCallbackUrl(origin, hostile), `${origin}/auth/callback?next=%2Fdashboard`);
  }
});

test("token-hash links accept only Supabase email types", () => {
  assert.equal(parseEmailLinkType("recovery"), "recovery");
  assert.equal(parseEmailLinkType("signup"), "signup");
  assert.equal(parseEmailLinkType("sms"), null);
  assert.equal(parseEmailLinkType(null), null);
});

test("recovery always lands on the new-password form; others keep a safe destination", () => {
  assert.equal(emailLinkDestination("recovery", "/dashboard"), "/reset-password");
  assert.equal(emailLinkDestination("signup", "/dashboard/professional"), "/dashboard/professional");
  assert.equal(emailLinkDestination("signup", "https://evil.example"), "/dashboard");
});

test("a failed recovery link restarts recovery; other failures go to login", () => {
  assert.equal(failedLinkDestination("/reset-password"), "/forgot-password?error=expired");
  assert.equal(failedLinkDestination("/dashboard"), "/login?error=link");
  assert.equal(failedLinkDestination(null), "/login?error=link");
});

test("resending confirmation passes the site callback to Supabase", async () => {
  let sent: unknown;
  const client = { resend: async (credentials: unknown) => { sent = credentials; return { error: null }; } };
  const result = await requestConfirmation(client, " Ana@Example.com ", 0, authCallbackUrl(origin, "/dashboard"));
  assert.equal(result.requested, true);
  assert.deepEqual(sent, { type: "signup", email: "ana@example.com", options: { emailRedirectTo: `${origin}/auth/callback?next=%2Fdashboard` } });
});
