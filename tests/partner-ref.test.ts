import test from "node:test";
import assert from "node:assert/strict";
import { getPartner, normalizePartnerRef, partnerRefCookieName, partnerRefMaxAgeSeconds, readPartnerRefCookie, resolvePartnerRef, serializePartnerRefCookie } from "../lib/partners/ref.ts";
import { partners } from "../data/partners.ts";

test("accepts only configured partner slugs", () => {
 assert.equal(normalizePartnerRef("1migration"), "1migration");
 assert.equal(normalizePartnerRef("  1MIGRATION "), "1migration");
 for (const value of ["", "otro", "1migration;x=1", "../1migration", "1mi gration", "a".repeat(80), null, undefined]) assert.equal(normalizePartnerRef(value), null);
 assert.equal(getPartner("1migration")?.name, "1MIGRATION");
 assert.equal(getPartner("desconocido"), undefined);
});

test("regulated partners always carry their own service notice and no payout fields", () => {
 for (const partner of partners) {
  if (partner.regulated) assert.ok(partner.serviceNotice && partner.serviceNotice.length > 20);
  assert.equal(Object.keys(partner).some((key) => /commission|payout|fee|split/i.test(key)), false);
 }
});

test("serializes a first-party 30-day cookie only for valid refs", () => {
 const cookie = serializePartnerRefCookie("1migration", true);
 assert.equal(cookie, `${partnerRefCookieName}=1migration; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax; Secure`);
 assert.equal(partnerRefMaxAgeSeconds, 2592000);
 assert.equal(serializePartnerRefCookie("1migration", false)?.includes("Secure"), false);
 assert.equal(serializePartnerRefCookie("evil; Domain=evil.example", true), null);
});

test("reads and validates the stored cookie", () => {
 assert.equal(readPartnerRefCookie(`a=1; ${partnerRefCookieName}=1migration; b=2`), "1migration");
 assert.equal(readPartnerRefCookie(`${partnerRefCookieName}=otro`), null);
 assert.equal(readPartnerRefCookie(`${partnerRefCookieName}=%E0%A4%A`), null);
 assert.equal(readPartnerRefCookie(""), null);
 assert.equal(readPartnerRefCookie(null), null);
});

test("query ref wins over cookie, invalid query falls back to cookie", () => {
 const stored = `${partnerRefCookieName}=1migration`;
 assert.equal(resolvePartnerRef("1migration", ""), "1migration");
 assert.equal(resolvePartnerRef("otro", stored), "1migration");
 assert.equal(resolvePartnerRef(null, stored), "1migration");
 assert.equal(resolvePartnerRef("otro", "x=1"), null);
});
