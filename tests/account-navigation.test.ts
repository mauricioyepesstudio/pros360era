import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountNav, homeForRole, isProfessionalArea } from "../lib/account/navigation.ts";

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
  assert.equal(homeForRole("ADMIN"), "/dashboard");
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
