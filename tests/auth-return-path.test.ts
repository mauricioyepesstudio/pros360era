import test from "node:test";
import assert from "node:assert/strict";
import { safeReturnPath } from "../lib/auth/return-path.ts";
test("preserves professional destination and rejects external redirects", () => {
 assert.equal(safeReturnPath("/dashboard/professional"), "/dashboard/professional");
 for(const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/\nattack", null]) assert.equal(safeReturnPath(path), "/dashboard");
});
