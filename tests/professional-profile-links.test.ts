import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeUrl, sanitizeSocialLinks, publicLinkedInUrl } from "../lib/professional/profile-links.ts";
import { safeSocialLinks, safeHttpUrl } from "../lib/professional/links.ts";

test("profile links reject URL credentials at both write and render boundaries", () => {
  for (const input of [
    "https://demo:sample@example.invalid/portfolio",
    "http://demo@example.invalid/",
    "https://:sample@example.invalid/",
    "https://de%6Do:sa%6Dple@example.invalid/",
    "https://www.linkedin.com@elsewhere.invalid/company/example/",
  ]) {
    assert.equal(sanitizeUrl(input), null);
    assert.equal(safeHttpUrl(input), null);
  }
});

test("all social platforms drop credential-bearing links without changing safe neighbors", () => {
  for (const platform of ["instagram", "linkedin", "facebook", "tiktok"] as const) {
    const input: Parameters<typeof sanitizeSocialLinks>[0] = {};
    input[platform] = "https://demo:sample@example.invalid/";
    assert.equal(sanitizeSocialLinks(input)[platform], undefined);
    assert.deepEqual(safeSocialLinks(input), {});
  }
  const input = { instagram: "https://demo:sample@example.invalid/", facebook: "https://facebook.com/page" };
  assert.equal(sanitizeSocialLinks(input).facebook, input.facebook);
  assert.equal(safeSocialLinks(input).facebook, input.facebook);
});

test("LinkedIn rejects embedded credentials before public admin normalization", () => {
  for (const input of [
    "https://demo:sample@www.linkedin.com/company/146496927/admin/dashboard/",
    "https://demo@linkedin.com/in/example/",
    "https://:sample@www.linkedin.com/company/146496927/",
  ]) assert.equal(publicLinkedInUrl(input), null);
});

test("ordinary at-signs outside URL credentials remain valid unchanged", () => {
  for (const input of [
    "https://www.tiktok.com/@example",
    "https://example.invalid/portfolio/@work?contact=hello@example.invalid#@section",
    "http://example.invalid/path?next=https%3A%2F%2Fexample.invalid%2F%40work",
  ]) {
    assert.equal(sanitizeUrl(input), input);
    assert.equal(safeHttpUrl(input), input);
  }
});

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

test("LinkedIn company admin URLs become the same company's public destination", () => {
  for (const input of [
    "https://www.linkedin.com/company/146496927/admin/dashboard/",
    "https://linkedin.com/company/146496927/admin",
    "http://linkedin.com/company/146496927/admin/posts/?x=1#draft",
  ]) assert.equal(publicLinkedInUrl(input), "https://www.linkedin.com/company/146496927/");
  assert.equal(publicLinkedInUrl("https://www.linkedin.com/company/real-group_entertainment/admin/analytics/"), "https://www.linkedin.com/company/real-group_entertainment/");
});

test("public LinkedIn and personal links remain unchanged", () => {
  for (const input of [
    "https://www.linkedin.com/company/146496927/?view=public#about",
    "https://www.linkedin.com/in/mauricio-yepes-lotero/?locale=en",
    "https://www.linkedin.com/company/example/administrator/",
  ]) assert.equal(publicLinkedInUrl(input), input);
});

test("LinkedIn recognition never rewrites lookalike or unrecognized hosts", () => {
  for (const input of [
    "https://linkedin.com.attacker.invalid/company/146496927/admin/",
    "https://attacker.invalid/company/146496927/admin/",
    "https://www-linkedin.com/company/146496927/admin/",
    "https://regional.linkedin.com/company/146496927/admin/",
  ]) assert.equal(publicLinkedInUrl(input), input);
});

test("LinkedIn normalization retains unsafe and malformed URL rejection", () => {
  for (const input of [null, "", "not-a-url", "javascript:alert(1)", "data:text/html,test"])
    assert.equal(publicLinkedInUrl(input), null);
});

test("existing stored admin links and future saves share the public destination", () => {
  const input = { linkedin: "https://www.linkedin.com/company/146496927/admin/dashboard/", instagram: "https://www.instagram.com/rgentertainmentmanagement/" };
  const written = sanitizeSocialLinks(input);
  const rendered = safeSocialLinks(input);
  assert.equal(written.linkedin, "https://www.linkedin.com/company/146496927/");
  assert.equal(rendered.linkedin, written.linkedin);
  assert.equal(rendered.instagram, input.instagram);
  assert.equal(written.instagram, input.instagram);
});

test("generic website and other social fields are not normalized as LinkedIn", () => {
  const input = "https://www.linkedin.com/company/146496927/admin/dashboard/";
  assert.equal(sanitizeUrl(input), input);
  assert.equal(safeHttpUrl(input), input);
  assert.equal(sanitizeSocialLinks({ facebook: input }).facebook, input);
  assert.equal(safeSocialLinks({ facebook: input }).facebook, input);
  assert.deepEqual(safeSocialLinks({ linkedin: "javascript:alert(1)", unknown: "https://example.com" } as Parameters<typeof safeSocialLinks>[0]), {});
});
