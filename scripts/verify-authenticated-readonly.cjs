/* eslint-disable @typescript-eslint/no-require-imports -- Manual, secret-scoped browser acceptance runner. */
const fs = require("node:fs");
const { APP_ORIGIN, AUTH_ORIGIN, allowedRequest, allowedAccount } = require("./auth-acceptance-policy.cjs");
const requireCheck = (ok) => { if (!ok) throw new Error("Acceptance check failed"); };

async function accountCase(browser, role) {
  const result = { account: role, login: false, roleVerified: false, businessMutationsRequested: false, localSessionRevoked: false };
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];
  if (!email || !password) return { ...result, passed: false, stage: "credentials_missing" };
  if (!allowedAccount(role, email)) return { ...result, passed: false, stage: "owner_account_mismatch" };
  const context = await browser.newContext({ serviceWorkers: "block", viewport: { width: 1440, height: 1000 } });
  let stage = "login";
  let token;
  let publicKey;
  let blockedWrites = 0;
  try {
    await context.route("**/*", (route) => {
      const request = route.request();
      if (allowedRequest(request.url(), request.method())) return route.continue();
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) blockedWrites++;
      return route.abort();
    });
    const page = await context.newPage();
    const next = role === "MEMBER" ? "/dashboard" : "/panel-profesional/perfil";
    await page.goto(`${APP_ORIGIN}/login?next=${encodeURIComponent(next)}`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    // One password attempt; never signup, reset, resend or Google OAuth.
    const [response] = await Promise.all([page.waitForResponse((r) => {
      const u = new URL(r.url());
      return u.origin === AUTH_ORIGIN && u.pathname === "/auth/v1/token" && r.request().method() === "POST";
    }, { timeout: 20000 }), page.getByRole("button", { name: "Entrar", exact: true }).click()]);
    const payload = await response.json();
    if (response.status() !== 200) {
      const allowedCodes = ["invalid_credentials", "email_not_confirmed", "over_request_rate_limit"];
      result.authFailure = allowedCodes.includes(payload.error_code) ? payload.error_code : "auth_rejected";
      throw new Error("Authentication rejected");
    }
    token = payload.access_token;
    publicKey = response.request().headers().apikey;
    requireCheck(typeof token === "string" && typeof publicKey === "string");
    result.login = true;
    stage = "role_badge";
    await page.waitForURL((url) => url.origin === APP_ORIGIN && url.pathname !== "/login", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.locator("header").getByText(/^(Miembro|Profesional|Administrador · Profesional)$/).waitFor({ timeout: 20000 });
    const roles = [["MEMBER", "Miembro"], ["PRO", "Profesional"], ["ADMIN", "Administrador · Profesional"]];
    result.actualRole = "UNKNOWN";
    for (const [value, label] of roles) {
      if (await page.locator("header").getByText(label, { exact: true }).count() === 1) result.actualRole = value;
    }
    requireCheck(result.actualRole === role);
    result.roleVerified = true;
    if (role === "MEMBER") {
      stage = "member_profile";
      await page.goto(`${APP_ORIGIN}/profile`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: "Solo lo necesario para ayudarte", exact: true }).waitFor();
      result.ownProfileRead = true;
      stage = "member_role_gate";
      await page.goto(`${APP_ORIGIN}/panel-profesional/perfil`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(`${APP_ORIGIN}/dashboard`, { waitUntil: "domcontentloaded" });
      requireCheck(await page.locator("#display-name").count() === 0);
      result.professionalAreaDenied = true;
    } else {
      stage = "professional_editor";
      await page.locator("#display-name").waitFor();
      const savedName = await page.locator("#display-name").inputValue();
      const approved = await page.getByText("Perfil público aprobado", { exact: true }).count() === 1;
      const link = page.getByRole("link", { name: "Ver mi perfil público", exact: true });
      result.approvedProfile = approved;
      result.ownPublicProfileRead = false;
      result.publicProfileCheck = approved ? "required" : "skipped_pending_approval";
      stage = "public_profile_link";
      requireCheck(await link.count() === (approved ? 1 : 0));
      if (approved) {
        requireCheck(await link.getAttribute("target") === "_blank");
        const href = new URL(await link.getAttribute("href"), APP_ORIGIN);
        requireCheck(href.origin === APP_ORIGIN && /^\/profesionales\/[a-z0-9-]+$/.test(href.pathname));
        const popupPromise = page.waitForEvent("popup");
        await link.click();
        const popup = await popupPromise;
        await popup.waitForURL(href.href, { waitUntil: "domcontentloaded" });
        await popup.getByRole("heading", { name: savedName, exact: true }).waitFor();
        await popup.close();
        result.ownPublicProfileRead = true;
      }
      stage = "professional_planner";
      await page.goto(`${APP_ORIGIN}/panel-profesional/planner`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: "Planner de publicaciones", exact: true }).waitFor();
      requireCheck(await page.getByText("No pudimos abrir tu planner.", { exact: false }).count() === 0);
      result.plannerRead = true;
      stage = "professional_role_gate";
      await page.goto(`${APP_ORIGIN}/dashboard`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(`${APP_ORIGIN}/panel-profesional`, { waitUntil: "domcontentloaded" });
      await page.locator("header").getByText("Profesional", { exact: true }).waitFor();
      result.memberHomeRedirected = true;
    }
    stage = "mutation_guard";
    requireCheck(blockedWrites === 0);
    result.passed = true;
  } catch {
    result.passed = false;
    result.stage = stage; // Never print Playwright errors, DOM, input values or tokens.
  } finally {
    result.blockedWriteRequests = blockedWrites;
    result.businessMutationsRequested = blockedWrites > 0;
    if (token && publicKey) {
      try {
        // Revoke only this test session. App logout defaults to global and MUST NOT be clicked.
        const logout = `${AUTH_ORIGIN}/auth/v1/logout?scope=local`;
        requireCheck(allowedRequest(logout, "POST"));
        const response = await context.request.post(logout, { headers: { apikey: publicKey, authorization: `Bearer ${token}` }, timeout: 10000 });
        result.localSessionRevoked = response.ok();
      } catch { result.localSessionRevoked = false; }
      if (!result.localSessionRevoked) { result.passed = false; result.cleanupFailed = true; }
    }
    token = undefined;
    publicKey = undefined;
    await context.close();
  }
  return result;
}
(async () => {
  const required = ["E2E_MEMBER_EMAIL", "E2E_MEMBER_PASSWORD", "E2E_PRO_EMAIL", "E2E_PRO_PASSWORD"];
  if (required.some((key) => !process.env[key])) {
    console.log(JSON.stringify({ passed: false, stage: "credentials_missing" })); process.exitCode = 1; return;
  }
  if (process.env.E2E_MEMBER_EMAIL.trim().toLowerCase() === process.env.E2E_PRO_EMAIL.trim().toLowerCase()) {
    console.log(JSON.stringify({ passed: false, stage: "accounts_not_distinct" })); process.exitCode = 1; return;
  }
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  let results;
  try {
    results = [];
    for (const role of ["MEMBER", "PRO"]) results.push(await accountCase(browser, role));
  } finally { await browser.close(); }
  const output = { at: new Date().toISOString(), runnerCommit: process.env.GITHUB_SHA || null, origin: APP_ORIGIN, results };
  console.log(JSON.stringify(output));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\nAuthenticated read-only acceptance\n\n\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\`\n`);
  if (results.some((r) => !r.passed)) process.exitCode = 1;
})().catch(() => { console.log(JSON.stringify({ passed: false, stage: "runner" })); process.exitCode = 1; });
