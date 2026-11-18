import test from "node:test";
import assert from "node:assert/strict";
import { buildGrowthInquiryUrl, growthCapabilities, growthMarketById, growthMarkets } from "../lib/growth-engine/catalog.ts";

test("industry ids and capability ids remain unique", () => {
  assert.equal(new Set(growthMarkets.map((market) => market.id)).size, growthMarkets.length);
  assert.equal(new Set(growthCapabilities.map((capability) => capability.id)).size, growthCapabilities.length);
});

test("every market has real discovery or recruiting label and at least two examples", () => {
  for (const market of growthMarkets) {
    assert.ok(["pilot", "recruiting"].includes(market.partnerStatus));
    assert.ok(market.examples.length >= 2, market.id);
    assert.ok(market.name.length > 3);
  }
});

test("sensitive industries disclose regulatory boundary", () => {
  for (const id of ["notary", "immigration", "finance", "real-estate", "vip-transport", "insurance"]) {
    assert.ok(growthMarketById(id)?.regulatoryNote, id);
  }
});

test("inquiry links carry only sector and no client identity or other business data", () => {
  const link = buildGrowthInquiryUrl("notary", "https://wa.me/17866041733");
  assert.ok(link);
  const url = new URL(link!);
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/17866041733");
  assert.match(url.searchParams.get("text") ?? "", /Notaría y documentación/);
  assert.doesNotMatch(link!, /resource.?living|@|lead_id/i);
});

test("unknown industries and unsafe WhatsApp endpoints are not linked", () => {
  assert.equal(buildGrowthInquiryUrl("not-an-industry", "https://wa.me/17866041733"), null);
  assert.equal(buildGrowthInquiryUrl("notary", "https://example.org/collect"), null);
  assert.equal(buildGrowthInquiryUrl("notary", "http://wa.me/17866041733"), null);
});

test("planned capabilities are not represented as an active product", () => {
  const revenue = growthCapabilities.find((capability) => capability.id === "revenue-attribution");
  const automatedFollowup = growthCapabilities.find((capability) => capability.id === "follow-up");
  assert.equal(revenue?.readiness, "planned");
  assert.equal(automatedFollowup?.readiness, "planned");
});
