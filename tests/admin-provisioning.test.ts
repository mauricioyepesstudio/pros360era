import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProfessionalProfileInsert,
  buildProfessionalSlug,
  buildProfileUpsert,
  instagramUrl,
  parseCreateProfessionalInput,
} from "../lib/professional/admin-provisioning.ts";

/**
 * app/api/admin/create-professional used to write columns that don't exist
 * and swallow the errors. These lock the payloads to the real columns of
 * profiles (0001) and professional_profiles (0005, 0015).
 */

const userId = "3f9a1c2e-0000-4000-8000-000000000000";
const validBody = {
  email: "pro@example.com",
  password: "temporal-123",
  fullName: "María José Peña",
  profession: "Diseño de marca",
  location: "Miami",
  instagram: "@mariajose",
  website: "https://example.com",
};

function parse(body: unknown) {
  const result = parseCreateProfessionalInput(body);
  assert.ok(result.ok);
  return result.input;
}

test("parse: missing required fields is rejected", () => {
  const result = parseCreateProfessionalInput({ email: "a@b.com" });
  assert.equal(result.ok, false);
});

test("parse: defaults to BUSINESS_MARKETING and BOTH", () => {
  const input = parse(validBody);
  assert.equal(input.category, "BUSINESS_MARKETING");
  assert.equal(input.consultationMode, "BOTH");
});

test("parse: NOTARY is rejected (regulated, needs commission verification)", () => {
  const result = parseCreateProfessionalInput({ ...validBody, category: "NOTARY" });
  assert.equal(result.ok, false);
});

test("parse: unknown consultation mode is rejected", () => {
  const result = parseCreateProfessionalInput({ ...validBody, consultationMode: "PHONE" });
  assert.equal(result.ok, false);
});

test("slug: matches the professional_profiles check constraint", () => {
  const slug = buildProfessionalSlug("María José  Peña!", userId);
  assert.equal(slug, "maria-jose-pena-3f9a1c");
  assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test("slug: a name with no usable characters still gets a valid slug", () => {
  assert.match(buildProfessionalSlug("¡¡!!", userId), /^profesional-[a-z0-9]+$/);
});

test("instagram: bare handle becomes a profile URL, unsafe scheme is dropped", () => {
  assert.equal(instagramUrl("@onemigration"), "https://www.instagram.com/onemigration/");
  assert.equal(instagramUrl("https://www.instagram.com/x/"), "https://www.instagram.com/x/");
  assert.equal(instagramUrl("javascript:alert(1)"), null);
  assert.equal(instagramUrl(null), null);
});

test("profiles upsert only uses real columns", () => {
  assert.deepEqual(Object.keys(buildProfileUpsert(parse(validBody), userId)).sort(), ["id", "name", "role"]);
});

test("professional_profiles insert only uses real columns and never sets is_approved", () => {
  const row = buildProfessionalProfileInsert(parse(validBody), userId);
  const realColumns = new Set([
    "user_id", "display_name", "slug", "category", "headline", "bio", "state", "city", "languages",
    "consultation_mode", "is_accepting_clients", "booking_url", "photo_url", "portfolio_url",
    "website_url", "social_links",
  ]);
  for (const key of Object.keys(row)) assert.ok(realColumns.has(key), `unexpected column ${key}`);
  assert.equal("is_approved" in row, false);
  assert.equal(row.display_name, "María José Peña");
  assert.equal(row.headline, "Diseño de marca");
  assert.equal(row.city, "Miami");
  assert.equal(row.website_url, "https://example.com");
  assert.equal(row.social_links.instagram, "https://www.instagram.com/mariajose/");
});
