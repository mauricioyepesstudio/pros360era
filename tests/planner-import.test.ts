import test from "node:test";
import assert from "node:assert/strict";
import { DOMParser } from "@xmldom/xmldom";
import { zipSync, strToU8 } from "fflate";
import { parsePlannerCsv, previewPlannerRows, appendPlannerImport, readPlannerXlsx, plannerImportMaxBytes } from "../lib/professional-planner/import.ts";
import { plannerMaxPosts, parseProfessionalPlanner } from "../lib/professional-planner/validation.ts";

Object.defineProperty(globalThis, "DOMParser", { value: DOMParser, configurable: true });
const table = [["fecha", "hora", "red", "título", "texto"], ["14/10/2026", "11:30", "Instagram", "Mi publicación", "Texto real"]];
function xlsx(sheet: string, workbook = '<workbook><sheets><sheet name="Planner"/></sheets></workbook>') { return zipSync({ "xl/workbook.xml": strToU8(workbook), "xl/worksheets/sheet1.xml": strToU8(sheet) }); }

test("CSV quoted commas, multiline text and semicolon export preserve actual copy", () => {
  const parsed = parsePlannerCsv('fecha,red,titulo,texto\n2026-10-14,instagram,"Título, con coma","Línea 1\nLínea 2"');
  assert.equal(parsed[1][2], "Título, con coma"); assert.equal(parsed[1][3], "Línea 1\nLínea 2");
  assert.equal(parsePlannerCsv("fecha;red;titulo\n14/10/2026;instagram;Hola")[1][2], "Hola");
  assert.throws(() => parsePlannerCsv('fecha,red,titulo\n"sin cerrar'));
});
test("preview Spanish columns and Excel date/time serials; always IDEA", () => {
  const result = previewPlannerRows(table); assert.equal(result.rows[0].post?.date, "2026-10-14"); assert.equal(result.rows[0].post?.status, "IDEA");
  const excel = previewPlannerRows([table[0], [46309, 0.5, "linkedin", "Hola", "Contenido"]]);
  assert.equal(excel.rows[0].post?.date, "2026-10-14"); assert.equal(excel.rows[0].post?.time, "12:00");
});
test("bad dates/platforms/formulas/ChatGPT URLs reject in preview", () => {
  for (const row of [["2026-02-30", "12:00", "instagram", "Hola", "Texto"], ["2026-10-14", "12:00", "fake", "Hola", "Texto"], ["2026-10-14", "12:00", "instagram", "=CMD()", "Texto"]]) assert.equal(previewPlannerRows([table[0], row]).rows[0].post, null);
  assert.equal(previewPlannerRows([["fecha", "red", "titulo", "imagen"], ["2026-10-14", "instagram", "Hola", "https://chatgpt.com/c/private"]]).rows[0].post, null);
});
test("append selection preserves originals and prevents repeated import/cap overflow", () => {
  const preview = previewPlannerRows(table); const post = preview.rows[0].post!;
  const original = { ...post, id: "existing", title: "Original", status: "READY" as const };
  const next = appendPlannerImport([original], preview.rows, [2])!;
  assert.equal(next.length, 2); assert.ok(next.some((item) => item.id === original.id && item.status === "READY")); assert.ok(parseProfessionalPlanner({ posts: next }));
  assert.deepEqual(appendPlannerImport(next, preview.rows, [2]), next);
  const full = Array.from({ length: plannerMaxPosts }, (_, index) => ({ ...original, id: `old-${index}` })); assert.equal(appendPlannerImport(full, preview.rows, [2]), null);
});
test("real XLSX archive parser reads inline strings and flags formula cells", () => {
  const sheet = '<worksheet><sheetData><row><c r="A1" t="inlineStr"><is><t>fecha</t></is></c><c r="B1" t="inlineStr"><is><t>red</t></is></c><c r="C1" t="inlineStr"><is><t>titulo</t></is></c></row><row><c r="A2"><v>46309</v></c><c r="B2" t="inlineStr"><is><t>instagram</t></is></c><c r="C2" t="inlineStr"><is><t>Hola</t></is></c></row></sheetData></worksheet>';
  assert.equal(previewPlannerRows(readPlannerXlsx(xlsx(sheet))).rows[0].post?.date, "2026-10-14");
  const formula = sheet.replace('<is><t>Hola</t></is>', '<f>CONCAT("Hola")</f><v>Hola</v>');
  assert.equal(previewPlannerRows(readPlannerXlsx(xlsx(formula))).rows[0].post, null);
});
test("XLSX 1904 epoch, multiple sheets, XML entities, zip bombs reject", () => {
  const sheet = '<worksheet><sheetData/></worksheet>';
  assert.throws(() => readPlannerXlsx(xlsx(sheet, '<workbook><workbookPr date1904="1"/><sheets><sheet name="Planner"/></sheets></workbook>')));
  assert.throws(() => readPlannerXlsx(xlsx(sheet, '<workbook><sheets><sheet/><sheet/></sheets></workbook>')));
  assert.throws(() => readPlannerXlsx(xlsx('<!DOCTYPE x [<!ENTITY e SYSTEM "https://bad.example">]><worksheet/>')));
  assert.throws(() => readPlannerXlsx(xlsx("x".repeat(plannerImportMaxBytes + 1))));
});
test("forged ZIP uncompressed size rejects actual decompressed bytes", () => {
  const xml = '<worksheet><sheetData>' + Array.from({ length: 50 }, (_, index) => `<row><c r="A${index + 1}" t="inlineStr"><is><t>Texto ${index}</t></is></c></row>`).join("") + '</sheetData></worksheet>';
  const archive = zipSync({ "xl/worksheets/sheet1.xml": strToU8(xml) });
  new DataView(archive.buffer, archive.byteOffset, archive.byteLength).setUint32(22, 100, true);
  assert.throws(() => readPlannerXlsx(archive));
  const bomb = zipSync({ "xl/worksheets/sheet1.xml": strToU8("x".repeat(8 * 1024 * 1024)) });
  const view = new DataView(bomb.buffer, bomb.byteOffset, bomb.byteLength);
  view.setUint32(22, 16, true);
  for (let offset = 0; offset < bomb.length - 28; offset++) if (view.getUint32(offset, true) === 0x02014b50) { view.setUint32(offset + 24, 16, true); break; }
  assert.throws(() => readPlannerXlsx(bomb));
});
