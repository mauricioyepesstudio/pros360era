import test from "node:test";
import assert from "node:assert/strict";
import { safeBookingHref } from "../lib/opportunities/booking.ts";

test("null booking_url produces no link", () => {
  assert.equal(safeBookingHref(null), null);
});

test("a real https booking link passes through unchanged", () => {
  assert.equal(safeBookingHref("https://cal.com/daniela-torres"), "https://cal.com/daniela-torres");
});

test("a real http booking link passes through unchanged", () => {
  assert.equal(safeBookingHref("http://cal.com/daniela-torres"), "http://cal.com/daniela-torres");
});

test("a javascript: URL is rejected, never reaches an href", () => {
  assert.equal(safeBookingHref("javascript:alert(1)"), null);
});

test("a data: URL is rejected", () => {
  assert.equal(safeBookingHref("data:text/html,<script>alert(1)</script>"), null);
});

test("malformed text that isn't a URL at all is rejected, not thrown", () => {
  assert.equal(safeBookingHref("not a url"), null);
});
