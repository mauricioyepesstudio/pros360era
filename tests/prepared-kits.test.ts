import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { buildAppMetadata, buildProfessionalProfileInsert, parseCreateProfessionalInput } from "../lib/professional/admin-provisioning.ts";
import { parseCareer, validateCareerBio } from "../lib/professional/career.ts";
import { creativeSrc, getPreparedKit } from "../data/professional/prepared-kits.ts";

const userId = "3f9a1c2e-0000-4000-8000-000000000000";

test("unknown or non-string kit ids resolve to nothing", () => {
  assert.equal(getPreparedKit("nadie"), null);
  assert.equal(getPreparedKit("__proto__"), null);
  assert.equal(getPreparedKit(undefined), null);
  assert.equal(getPreparedKit(42), null);
});

test("an unknown kit id is rejected by the admin route parser", () => {
  const result = parseCreateProfessionalInput({ email: "a@b.com", password: "x", preparedKit: "nadie" });
  assert.equal(result.ok, false);
});

test("the Miguel kit fills a complete, non-regulated profile", () => {
  const parsed = parseCreateProfessionalInput({ email: "miguel@example.com", password: "temporal-123", preparedKit: "miguel-acosta" });
  assert.ok(parsed.ok);
  const input = parsed.input;
  assert.equal(input.fullName, "José Miguel Acosta");
  assert.equal(input.category, "BUSINESS_OPERATIONS");
  assert.equal(input.consultationMode, "VIRTUAL");

  const row = buildProfessionalProfileInsert(input, userId);
  assert.equal(row.user_id, userId);
  assert.equal(row.website_url, "https://personalcfo.me/app/");
  assert.equal(row.social_links.linkedin, "https://www.linkedin.com/in/miguel-acosta-martinez/");
  assert.deepEqual(row.languages, ["es", "en", "fr"]);
  assert.ok(validateCareerBio(row.bio));
  assert.match(parseCareer(row.bio).education, /University of North Carolina Wilmington/);
  assert.ok(!("is_approved" in row), "approval stays with the operator");
  assert.deepEqual(buildAppMetadata(input), { prepared_kit: "miguel-acosta" });
});

test("explicit admin fields win over the kit", () => {
  const parsed = parseCreateProfessionalInput({ email: "m@example.com", password: "x", preparedKit: "miguel-acosta", fullName: "Miguel Acosta", location: "Orlando", category: "BUSINESS_MARKETING" });
  assert.ok(parsed.ok);
  const row = buildProfessionalProfileInsert(parsed.input, userId);
  assert.equal(row.display_name, "Miguel Acosta");
  assert.equal(row.city, "Orlando");
  assert.equal(row.category, "BUSINESS_MARKETING");
});

test("without a kit, the payload and metadata are unchanged", () => {
  const parsed = parseCreateProfessionalInput({ email: "p@example.com", password: "x", fullName: "Ana" });
  assert.ok(parsed.ok);
  assert.deepEqual(buildAppMetadata(parsed.input), {});
  assert.equal(buildProfessionalProfileInsert(parsed.input, userId).bio, undefined);
});

test("kit copy keeps the house rules", () => {
  const kit = getPreparedKit("miguel-acosta");
  assert.ok(kit);
  const text = JSON.stringify(kit).toLowerCase();
  assert.ok(!text.includes("verificad"), "say 'perfil aprobado', never 'verificado'");
  assert.ok(!text.includes("patrimonio cfo"), "old brand name must not ship");
});

test("every creative file referenced by the kit exists", () => {
  const kit = getPreparedKit("miguel-acosta");
  assert.ok(kit);
  for (const concept of kit.creatives.concepts) {
    for (const format of kit.creatives.formats) {
      assert.ok(existsSync(new URL(`../public${creativeSrc(kit, concept.id, format)}`, import.meta.url)), `${concept.id}-${format}`);
    }
  }
});
