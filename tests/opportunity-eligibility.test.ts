import test from "node:test";
import assert from "node:assert/strict";
import { evaluateProfessionalEligibility } from "../lib/opportunities/eligibility.ts";
import { needs } from "../data/needs/catalog.ts";
import { regulatoryPolicies } from "../data/compliance/regulatory-policy.ts";
import type { ProfessionalProfilePublic } from "../data/professional/types.ts";
import type { OpportunityMemberContext } from "../data/opportunities/types.ts";

const need = needs.find((n) => n.id === "BRANDING")!;
const policy = regulatoryPolicies.find((p) => p.category === "MARKETING" && p.jurisdiction === "FL")!;

const member: OpportunityMemberContext = { state: "FL", preferredLanguage: "es", city: null, preferredConsultationMode: "BOTH" };

const professional: ProfessionalProfilePublic = {
  slug: "test-pro",
  displayName: "Test Pro",
  category: "BUSINESS_MARKETING",
  headline: null,
  bio: null,
  state: "FL",
  city: "Miami",
  languages: ["es", "en"],
  consultationMode: "BOTH",
  isAcceptingClients: true,
  identityVerified: false,
  photoUrl: null,
  portfolioUrl: null,
  websiteUrl: null,
  socialLinks: {},
};

test("matching professional is eligible with all match reasons present", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional, regulatoryPolicy: policy });
  assert.equal(result.eligible, true);
  assert.ok(result.reasons.includes("CATEGORY_MATCH"));
  assert.ok(result.reasons.includes("STATE_MATCH"));
  assert.ok(result.reasons.includes("LANGUAGE_MATCH"));
  assert.ok(result.reasons.includes("CONSULTATION_MODE_MATCH"));
});

test("category mismatch blocks eligibility", () => {
  // BUSINESS_MARKETING is the only live category, so mismatch is simulated
  // via a need whose possibleProfessionalCategories doesn't include it —
  // the same "empty means no live supply yet" state a future need could
  // legitimately have (see data/needs/catalog.ts).
  const needWithNoSupply = { ...need, possibleProfessionalCategories: [] as const };
  const result = evaluateProfessionalEligibility({ member, need: needWithNoSupply, professional, regulatoryPolicy: policy });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("CATEGORY_MISMATCH"));
});

test("state mismatch blocks eligibility as OUTSIDE_SERVICE_AREA", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional: { ...professional, state: "GA" }, regulatoryPolicy: policy });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("OUTSIDE_SERVICE_AREA"));
});

test("language mismatch blocks eligibility", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional: { ...professional, languages: ["en"] }, regulatoryPolicy: policy });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("LANGUAGE_MISMATCH"));
});

test("not accepting clients blocks eligibility", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional: { ...professional, isAcceptingClients: false }, regulatoryPolicy: policy });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("NOT_ACCEPTING_CLIENTS"));
});

test("missing regulatory policy blocks eligibility by default, never permissive", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional, regulatoryPolicy: undefined });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("REGULATORY_BLOCK"));
});

test("unverified professional stays eligible when the policy does not require verification (Daniela's real scenario)", () => {
  const result = evaluateProfessionalEligibility({ member, need, professional: { ...professional, identityVerified: false }, regulatoryPolicy: policy });
  assert.equal(policy.verificationRequirement, null);
  assert.equal(result.eligible, true);
  assert.equal(result.reasons.includes("VERIFICATION_REQUIRED"), false);
});
