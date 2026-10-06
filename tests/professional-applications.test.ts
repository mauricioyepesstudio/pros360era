import test from "node:test";
import assert from "node:assert/strict";
import { isDuplicateApplicationError, parseProfessionalApplicationInput } from "../lib/professional-applications/validation.ts";
import {
  applicationCategoryOptions,
  professionalApplicationsAcceptingSubmissions,
} from "../data/professional-applications/categories.ts";

const valid = {
  fullName: "  Ana Pérez ",
  email: " Ana@Example.com ",
  phone: "",
  city: "Miami",
  categoryOfInterest: "BUSINESS_MARKETING",
  credentialInfo: "",
  bio: "Diseño marcas para restaurantes.",
  notes: "",
};

test("a valid application becomes the exact row the 0014 grant allows", () => {
  const result = parseProfessionalApplicationInput(valid);
  assert.ok(result.ok);
  assert.deepEqual(result.row, {
    full_name: "Ana Pérez",
    email: "ana@example.com",
    phone: null,
    city: "Miami",
    category_of_interest: "BUSINESS_MARKETING",
    credential_info: null,
    bio: "Diseño marcas para restaurantes.",
    notes: null,
  });
  // Never sends server-only columns.
  for (const column of ["status", "reviewed_by", "reviewed_at", "id"]) assert.ok(!(column in result.row));
});

test("rejects missing fields, bad email, unknown category and oversized text", () => {
  assert.deepEqual(parseProfessionalApplicationInput({ ...valid, fullName: "  " }), { ok: false, reason: "MISSING_REQUIRED_FIELD" });
  assert.deepEqual(parseProfessionalApplicationInput({ ...valid, email: "ana@" }), { ok: false, reason: "INVALID_EMAIL" });
  assert.deepEqual(parseProfessionalApplicationInput({ ...valid, categoryOfInterest: "ADMIN" }), { ok: false, reason: "INVALID_CATEGORY" });
  assert.deepEqual(parseProfessionalApplicationInput({ ...valid, bio: "x".repeat(601) }), { ok: false, reason: "TOO_LONG" });
});

test("a filled honeypot is flagged as spam", () => {
  assert.deepEqual(parseProfessionalApplicationInput({ ...valid, website: "http://spam.example" }), { ok: false, reason: "SPAM" });
});

test("regulated categories are not offered or accepted", () => {
  const ids = applicationCategoryOptions.map((option) => option.id);
  for (const regulated of ["NOTARY", "TAX", "LEGAL", "IMMIGRATION", "INSURANCE"]) {
    assert.ok(!ids.includes(regulated), `${regulated} must not be offered`);
    assert.deepEqual(parseProfessionalApplicationInput({ ...valid, categoryOfInterest: regulated }), { ok: false, reason: "INVALID_CATEGORY" });
  }
});

test("the form is switched on", () => {
  assert.equal(professionalApplicationsAcceptingSubmissions, true);
});

test("a unique-violation on insert is treated as an already-saved duplicate", () => {
  assert.equal(isDuplicateApplicationError({ code: "23505" }), true);
  assert.equal(isDuplicateApplicationError({ code: "42501" }), false);
  assert.equal(isDuplicateApplicationError(null), false);
});
