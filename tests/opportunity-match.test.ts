import test from "node:test";
import assert from "node:assert/strict";
import { calculateOrganicMatch } from "../lib/opportunities/match.ts";
import { regulatoryPolicies } from "../data/compliance/regulatory-policy.ts";
import type { ProfessionalProfilePublic } from "../data/professional/types.ts";
import type { OpportunityMemberContext } from "../data/opportunities/types.ts";

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
};

test("base score has no same-city bonus when member city is unknown", () => {
  const result = calculateOrganicMatch({ member, professional, regulatoryPolicy: policy });
  assert.equal(result.matchReasons.includes("SAME_CITY"), false);
  assert.ok(result.matchReasons.includes("NEED_CATEGORY_MATCH"));
  assert.ok(result.matchReasons.includes("SERVES_YOUR_STATE"));
  assert.ok(result.matchReasons.includes("ACCEPTING_CLIENTS"));
});

test("same-city bonus fires only when both member and professional city are known and match", () => {
  const result = calculateOrganicMatch({ member: { ...member, city: "Miami" }, professional, regulatoryPolicy: policy });
  assert.ok(result.matchReasons.includes("SAME_CITY"));
  const noMatch = calculateOrganicMatch({ member: { ...member, city: "Orlando" }, professional, regulatoryPolicy: policy });
  assert.equal(noMatch.matchReasons.includes("SAME_CITY"), false);
  assert.ok(result.organicScore > noMatch.organicScore);
});

test("identity-verification bonus never fires when the policy does not require it, even if the professional is verified", () => {
  assert.equal(policy.verificationRequirement, null);
  const result = calculateOrganicMatch({ member, professional: { ...professional, identityVerified: true }, regulatoryPolicy: policy });
  assert.equal(result.matchReasons.includes("IDENTITY_VERIFIED"), false);
});

test("identity-verification bonus fires only when both required by policy and true on the professional", () => {
  const requiringPolicy = { ...policy, verificationRequirement: "IDENTITY_VERIFIED" as const };
  const verified = calculateOrganicMatch({ member, professional: { ...professional, identityVerified: true }, regulatoryPolicy: requiringPolicy });
  const unverified = calculateOrganicMatch({ member, professional: { ...professional, identityVerified: false }, regulatoryPolicy: requiringPolicy });
  assert.ok(verified.matchReasons.includes("IDENTITY_VERIFIED"));
  assert.equal(unverified.matchReasons.includes("IDENTITY_VERIFIED"), false);
  assert.ok(verified.organicScore > unverified.organicScore);
});

test("Daniela's real, unverified profile is scored on equal footing under the live MARKETING/FL policy", () => {
  const danielaLike: ProfessionalProfilePublic = { ...professional, identityVerified: false };
  const hypotheticalVerified: ProfessionalProfilePublic = { ...professional, identityVerified: true };
  const a = calculateOrganicMatch({ member, professional: danielaLike, regulatoryPolicy: policy });
  const b = calculateOrganicMatch({ member, professional: hypotheticalVerified, regulatoryPolicy: policy });
  assert.equal(a.organicScore, b.organicScore);
});
