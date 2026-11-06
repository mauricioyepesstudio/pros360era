import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("public immigration-document-support profile shows a non-advisory notice", () => {
  const source = readFileSync(new URL("../components/professional/ProfessionalProfileView.tsx", import.meta.url), "utf8");
  assert.match(source, /professional\.category === "IMMIGRATION_DOCUMENT_SUPPORT"/);
  assert.match(source, /EVOLUSA no da asesoría migratoria ni es una agencia de inmigración/);
});
