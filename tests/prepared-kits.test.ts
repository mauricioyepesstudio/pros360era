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

test("the Marie kit provisions a NOTARY profile only through the kit", () => {
  const parsed = parseCreateProfessionalInput({ email: "marie@example.com", password: "temporal-123", preparedKit: "marie-fernandez" });
  assert.ok(parsed.ok);
  assert.equal(parsed.input.category, "NOTARY");
  assert.equal(parsed.input.fullName, "Marie Fernandez");
  const row = buildProfessionalProfileInsert(parsed.input, userId);
  assert.equal(row.category, "NOTARY");
  assert.ok(validateCareerBio(row.bio));
  assert.ok(!("is_approved" in row), "approval stays with the operator");
  assert.deepEqual(buildAppMetadata(parsed.input), { prepared_kit: "marie-fernandez" });
});

test("NOTARY is rejected without the owner-approved kit", () => {
  assert.equal(parseCreateProfessionalInput({ email: "x@example.com", password: "x", fullName: "X", category: "NOTARY" }).ok, false);
  assert.equal(parseCreateProfessionalInput({ email: "x@example.com", password: "x", preparedKit: "miguel-acosta", category: "NOTARY" }).ok, false);
});

test("Marie kit follows Florida notary advertising rules (F.S. 117.05)", () => {
  const kit = getPreparedKit("marie-fernandez");
  assert.ok(kit);
  const text = JSON.stringify(kit).toLowerCase();
  assert.ok(!/notari[ao] p[uú]blic[ao]/.test(text), "no literal translation of Notary Public");
  assert.ok(!/\bnotario\b/.test(text), "no 'notario'");
  assert.ok(!text.includes("verificad"));
  assert.match(kit.profile.career.summary, /no puedo dar asesoría legal/);
  for (const concept of kit.creatives.concepts) {
    for (const format of kit.creatives.formats) {
      const src = creativeSrc(kit, concept.id, format);
      assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), src);
      assert.ok(existsSync(new URL(`../public${src.replace(/\.png$/, ".jpg")}`, import.meta.url)), `${src} jpg`);
    }
  }
});
