import test from "node:test";
import assert from "node:assert/strict";
import { mapOpportunityProfessionalSummary } from "../lib/opportunities/professional-summary.ts";

test("matched-professional mapper exposes only the approved public contract", () => {
  const summary = mapOpportunityProfessionalSummary({
    opportunity_id: "opportunity-1",
    professional_slug: "daniela-torres-marketing",
    display_name: "Daniela Torres",
    category: "BUSINESS_MARKETING",
    headline: "Consultora de marketing",
    state: "FL",
    city: "Miami",
    languages: ["es", "en"],
    consultation_mode: "BOTH",
    is_accepting_clients: true,
    identity_verified: false,
    booking_url: "https://cal.com/daniela-torres",
    professional_profile_id: "private-id",
    organic_match_score: 5,
  } as Parameters<typeof mapOpportunityProfessionalSummary>[0] & {
    professional_profile_id: string;
    organic_match_score: number;
  });

  assert.deepEqual(summary, {
    opportunityId: "opportunity-1",
    slug: "daniela-torres-marketing",
    displayName: "Daniela Torres",
    category: "BUSINESS_MARKETING",
    headline: "Consultora de marketing",
    state: "FL",
    city: "Miami",
    languages: ["es", "en"],
    consultationMode: "BOTH",
    isAcceptingClients: true,
    identityVerified: false,
    bookingUrl: "https://cal.com/daniela-torres",
  });
  assert.equal("professionalProfileId" in summary, false);
  assert.equal("organicMatchScore" in summary, false);
});

test("missing language array becomes an empty public list", () => {
  const summary = mapOpportunityProfessionalSummary({
    opportunity_id: "opportunity-2",
    professional_slug: "professional",
    display_name: "Professional",
    category: "BUSINESS_MARKETING",
    headline: null,
    state: null,
    city: null,
    languages: null,
    consultation_mode: "VIRTUAL",
    is_accepting_clients: false,
    identity_verified: false,
    booking_url: null,
  });

  assert.deepEqual(summary.languages, []);
});

test("null booking_url maps to null, never an empty string or dropped field", () => {
  const summary = mapOpportunityProfessionalSummary({
    opportunity_id: "opportunity-3",
    professional_slug: "professional",
    display_name: "Professional",
    category: "BUSINESS_MARKETING",
    headline: null,
    state: null,
    city: null,
    languages: [],
    consultation_mode: "VIRTUAL",
    is_accepting_clients: false,
    identity_verified: false,
    booking_url: null,
  });

  assert.equal(summary.bookingUrl, null);
});
