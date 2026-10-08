import test from "node:test";
import assert from "node:assert/strict";
import { accountContextFor, buildAccountNav, homeForRole, isAccountNavActive, isProfessionalArea } from "../lib/account/navigation.ts";

const hrefs = (role: Parameters<typeof buildAccountNav>[0]) => buildAccountNav(role).map((item) => item.href);

test("a member never sees CRM, Crecimiento or the professional panel", () => {
  const member = hrefs("MEMBER");
  assert.ok(member.every((href) => !isProfessionalArea(href)));
  assert.ok(!member.includes("/crm"));
  assert.ok(!member.includes("/growth-automation"));
});

test("the professional panel shares no tab with the member panel", () => {
  const member = new Set(hrefs("MEMBER"));
  const professional = hrefs("PROFESSIONAL");
  assert.deepEqual(professional.filter((href) => member.has(href)), []);
  assert.ok(professional.every((href) => isProfessionalArea(href)));
});

test("each role lands on its own home", () => {
  assert.equal(homeForRole("MEMBER"), "/dashboard");
  assert.equal(homeForRole("ADMIN"), "/panel-profesional");
  assert.equal(homeForRole("PROFESSIONAL"), "/panel-profesional");
  assert.equal(hrefs("PROFESSIONAL")[0], "/panel-profesional");
});

test("admin keeps the member panel plus Admin", () => {
  assert.deepEqual(hrefs("ADMIN"), [...hrefs("MEMBER"), "/admin"]);
});

test("isProfessionalArea matches whole path segments only", () => {
  assert.ok(isProfessionalArea("/crm/leads"));
  assert.ok(isProfessionalArea("/panel-profesional"));
  assert.ok(!isProfessionalArea("/crmx"));
  assert.ok(!isProfessionalArea("/dashboard"));
});

test("a member gets an applicant context only inside the professional draft", () => {
  assert.equal(accountContextFor("MEMBER", "/dashboard/professional"), "applicant");
  assert.equal(accountContextFor("MEMBER", "/dashboard/professional/edit"), "applicant");
  assert.equal(accountContextFor("MEMBER", "/dashboard"), "member");
  assert.equal(accountContextFor("MEMBER", "/dashboard/professionalism"), "member");
  assert.equal(accountContextFor("PROFESSIONAL", "/dashboard/professional"), "professional");
});

test("the applicant context exposes only the draft and the personal-account exit", () => {
  const applicant = buildAccountNav("MEMBER", "applicant").map((item) => item.href);
  assert.deepEqual(applicant, ["/dashboard/professional", "/dashboard"]);
  assert.ok(!applicant.includes("/profile"));
  assert.ok(!applicant.includes("/roadmap"));
  assert.ok(!applicant.includes("/crm"));
  assert.ok(!applicant.includes("/growth-automation"));
});

test("account home links are exact so only one destination is active", () => {
  assert.ok(isAccountNavActive("/dashboard", "/dashboard"));
  assert.ok(!isAccountNavActive("/dashboard/professional", "/dashboard"));
  assert.ok(isAccountNavActive("/dashboard/professional", "/dashboard/professional"));
  assert.ok(!isAccountNavActive("/panel-profesional/perfil", "/panel-profesional"));
  assert.ok(isAccountNavActive("/panel-profesional/perfil", "/panel-profesional/perfil"));
});


test("admin professional pages expose professional tools and retain Admin", () => {
  for (const path of ["/panel-profesional", "/panel-profesional/perfil", "/crm/leads", "/growth-automation"]) {
    const context = accountContextFor("ADMIN", path);
    assert.equal(context, "professional");
    assert.deepEqual(buildAccountNav("ADMIN", context).map(item => item.href), [...hrefs("PROFESSIONAL"), "/admin"]);
  }
  assert.equal(accountContextFor("ADMIN", "/dashboard"), "member");
  assert.equal(accountContextFor("ADMIN", "/crmx"), "member");
});
