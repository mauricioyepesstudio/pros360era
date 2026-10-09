import test from "node:test";
import assert from "node:assert/strict";
import {
  careerBioLimit,
  careerMarker,
  emptyCareer,
  hasCareerContent,
  parseCareer,
  serializeCareer,
  validateCareer,
  validateCareerBio,
} from "../lib/professional/career.ts";

test("plain and heading-like legacy bios remain complete presentations", () => {
  for (const bio of ["Diseño marcas.\nTrabajo con negocios.", "## Presentación\nExperiencia previa", "", null]) {
    assert.deepEqual(parseCareer(bio), { ...emptyCareer(), summary: bio ?? "" });
  }
});

test("legacy reserved headings and literal backslashes survive canonical conversion", () => {
  const legacy = "Presentación anterior\n\n## Experiencia\nCargo real\n\\ruta compartida";
  const converted = serializeCareer({ ...emptyCareer(), summary: legacy });
  assert.equal(validateCareerBio(converted), true);
  assert.equal(parseCareer(converted).summary, legacy);
});

test("canonical career survives save and reload including empty and multiline fields", () => {
  const career = {
    summary: "Analista",
    experience: "Cargo · Empresa · 2022–2023\nFunciones",
    education: "",
    skills: "Excel\nModelos",
    credentials: "Candidato nivel I, no certificado",
  };
  assert.equal(validateCareer(career), null);
  assert.deepEqual(parseCareer(serializeCareer(career)), career);
});

test("malformed versioned biographies fall back without dropping source text", () => {
  const malformed = careerMarker + "## Presentación\nTexto\n\n## Experiencia\nCargo";
  assert.equal(parseCareer(malformed).summary, malformed);
  assert.equal(validateCareerBio(malformed), false);
  const nonCanonicalEscape = serializeCareer(emptyCareer()).replace("## Formación", "\\## Formación");
  assert.equal(parseCareer(nonCanonicalEscape).summary, nonCanonicalEscape);
  assert.equal(validateCareerBio(nonCanonicalEscape), false);
});

test("reserved marker and section headings are escaped rather than rejected", () => {
  for (const summary of ["Texto\n## Experiencia\nOtro", careerMarker.trim()]) {
    const career = { ...emptyCareer(), summary };
    assert.equal(validateCareer(career), null);
    assert.deepEqual(parseCareer(serializeCareer(career)), career);
  }
});

test("aggregate limit includes format overhead and server validation", () => {
  const overhead = serializeCareer(emptyCareer()).length;
  const boundary = { ...emptyCareer(), summary: "x".repeat(careerBioLimit - overhead) };
  assert.equal(validateCareer(boundary), null);
  assert.equal(validateCareerBio(serializeCareer(boundary)), true);
  assert.ok(validateCareer({ ...boundary, summary: boundary.summary + "x" }));
  assert.equal(validateCareerBio("x".repeat(careerBioLimit + 1)), false);
});

test("all-empty canonical profiles have no public career content", () => {
  const bio = serializeCareer(emptyCareer());
  assert.equal(validateCareerBio(bio), true);
  assert.deepEqual(parseCareer(bio), emptyCareer());
  assert.equal(hasCareerContent(bio), false);
});

test("empty trailing credentials survive canonical validation and roundtrip unchanged", () => {
  const career = { ...emptyCareer(), summary: "Presentación", experience: "Experiencia" };
  const bio = serializeCareer(career);
  assert.equal(career.credentials, "");
  assert.equal(validateCareerBio(bio), true);
  assert.equal(parseCareer(bio).credentials, "");
  assert.equal(serializeCareer(parseCareer(bio)), bio);
});
