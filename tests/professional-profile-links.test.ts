import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeUrl, sanitizeSocialLinks } from "../lib/professional/profile-links.ts";

/**
 * lib/professional/self-profile.ts#updateMyProfessionalProfile applies
 * these before ever writing to professional_profiles — same trust tier as
 * lib/opportunities/booking.ts#safeBookingHref (see tests/opportunity-booking.test.ts),
 * but applied at write time rather than read time, so an unsafe scheme can
 * never be persisted in the first place.
 */

test("sanitizeUrl: null input produces null", () => {
  assert.equal(sanitizeUrl(null), null);
});

test("sanitizeUrl: a real https URL passes through unchanged", () => {
  assert.equal(sanitizeUrl("https://example.com/portfolio"), "https://example.com/portfolio");
});

test("sanitizeUrl: a real http URL passes through unchanged", () => {
  assert.equal(sanitizeUrl("http://example.com"), "http://example.com");
});

test("sanitizeUrl: a javascript: URL is rejected, never persisted", () => {
  assert.equal(sanitizeUrl("javascript:alert(1)"), null);
});

test("sanitizeUrl: a data: URL is rejected", () => {
  assert.equal(sanitizeUrl("data:text/html,<script>alert(1)</script>"), null);
});

test("sanitizeUrl: malformed text that isn't a URL at all is rejected, not thrown", () => {
  assert.equal(sanitizeUrl("not a url"), null);
});

test("sanitizeSocialLinks: every safe link passes through, keyed the same", () => {
  const result = sanitizeSocialLinks({
    instagram: "https://instagram.com/evolusa",
    linkedin: "https://linkedin.com/company/evolusa",
    facebook: "https://facebook.com/evolusa",
    tiktok: "https://tiktok.com/@evolusa",
  });

  assert.deepEqual(result, {
    instagram: "https://instagram.com/evolusa",
    linkedin: "https://linkedin.com/company/evolusa",
    facebook: "https://facebook.com/evolusa",
    tiktok: "https://tiktok.com/@evolusa",
  });
});

test("sanitizeSocialLinks: an unsafe scheme on one key is dropped, others unaffected", () => {
  const result = sanitizeSocialLinks({
    instagram: "javascript:alert(1)",
    linkedin: "https://linkedin.com/company/evolusa",
  });

  assert.deepEqual(result, {
    instagram: undefined,
    linkedin: "https://linkedin.com/company/evolusa",
    facebook: undefined,
    tiktok: undefined,
  });
});

test("sanitizeSocialLinks: an entirely empty object stays empty", () => {
  const result = sanitizeSocialLinks({});
  assert.deepEqual(result, { instagram: undefined, linkedin: undefined, facebook: undefined, tiktok: undefined });
});
