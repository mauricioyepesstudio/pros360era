import test from "node:test";
import assert from "node:assert/strict";
import { consentDataCategories } from "../data/opportunities/types.ts";
import { getOpportunityFailureMessage } from "../lib/opportunities/errors.ts";
import {
  canConfirmConsent,
  defaultConsentDataCategories,
  getOpportunityRetryPhase,
  normalizeOpportunityCity,
  toggleConsentCategory,
  type OpportunityStartPhase,
} from "../lib/opportunities/start.ts";

test("city input is trimmed, whitespace-normalized, and optional", () => {
  assert.equal(normalizeOpportunityCity("  Miami   Beach  "), "Miami Beach");
  assert.equal(normalizeOpportunityCity("   "), null);
});

test("consent selection stays in the canonical category order", () => {
  let selected = [...defaultConsentDataCategories];
  selected = toggleConsentCategory(selected, "CITY");
  selected = toggleConsentCategory(selected, "CONTACT_EMAIL");

  assert.deepEqual(selected, ["NAME", "CITY", "NEED_SUMMARY"]);
  assert.deepEqual(selected, consentDataCategories.filter((category) => selected.includes(category)));
});

test("at least one recognized consent category is required", () => {
  assert.equal(canConfirmConsent([]), false);
  assert.equal(canConfirmConsent(["NAME"]), true);
  assert.equal(canConfirmConsent(["UNKNOWN" as never]), false);
});

test("a consent failure retries the same opportunity instead of creating a duplicate", () => {
  const failedConsent: OpportunityStartPhase = {
    name: "error",
    message: "safe",
    retry: "consent",
    opportunityId: "opportunity-123",
    matchedProfessional: null,
  };

  assert.deepEqual(getOpportunityRetryPhase(failedConsent), {
    name: "consent",
    opportunityId: "opportunity-123",
    matchedProfessional: null,
  });
  assert.deepEqual(
    getOpportunityRetryPhase({ name: "error", message: "safe", retry: "form" }),
    { name: "form" },
  );
});

test("every server-action failure reason has safe Spanish copy", () => {
  assert.match(getOpportunityFailureMessage("SUPABASE_NOT_CONFIGURED"), /EVOLUSA/);
  assert.match(getOpportunityFailureMessage("NOT_SIGNED_IN"), /sesión/);
  assert.doesNotMatch(getOpportunityFailureMessage("DB_ERROR"), /database|supabase|postgres|rpc/i);
});
