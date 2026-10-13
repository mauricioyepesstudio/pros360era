import { Unzip, UnzipInflate, strFromU8 } from "fflate";
import { parseProfessionalPlanner, plannerMaxPosts, sortPosts, type PlannerPost } from "./validation.ts";

export const plannerImportMaxBytes = 2 * 1024 * 1024;
export const plannerImportMaxRows = 200;
export type ImportCell = string | number | null;
export type ImportRow = { row: number; post: PlannerPost | null; error: string | null };
export type ImportPreview = { headers: string[]; rows: ImportRow[] };

/** RFC-style quoted CSV including multiline fields. Semicolon is common in Spanish Excel exports. */
export function parsePlannerCsv(text: string): ImportCell[][] {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && (char === delimiter || char === "\n")) {
      row.push(cell.replace(/\r$/, "")); cell = "";
      if (char === "\n") { rows.push(row); row = []; }
    } else cell += char;
    if (cell.length > 10000 || row.length > 30 || rows.length > plannerImportMaxRows + 1) throw new Error("La parrilla supera el límite de 200 filas o 30 columnas.");
  }
  if (quoted) throw new Error("El CSV contiene comillas sin cerrar.");
  row.push(cell.replace(/\r$/, "")); if (row.some(Boolean)) rows.push(row);
  return rows.filter((values) => values.some((value) => value.trim()));
}

const normalize = (value: unknown) => String(value ?? "").replace(/^\uFEFF/, "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const aliases = { date: ["fecha", "date"], time: ["hora", "time"], platform: ["red", "plataforma", "platform", "network"], title: ["titulo", "title"], caption: ["texto", "caption", "copy", "descripcion"], image: ["imagen", "image", "imageurl", "image_url", "enlace imagen"] };

function importedDate(value: ImportCell): string | null {
  if (typeof value === "number") return value >= 61 && value <= 2958465 ? new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000).toISOString().slice(0, 10) : null;
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : null;
}
function importedTime(value: ImportCell): string | null {
  if (value === null || value === "") return "12:00";
  if (typeof value === "number") { if (value < 0 || value >= 1) return null; const minutes = Math.round(value * 1440) % 1440; return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`; }
  return String(value).trim();
}
function stableId(text: string) {
  let hash = 2166136261; for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  let second = 5381; for (let index = text.length - 1; index >= 0; index--) second = Math.imul(second, 33) ^ text.charCodeAt(index);
  return `import-${(hash >>> 0).toString(16)}-${(second >>> 0).toString(16)}`;
}
export function previewPlannerRows(table: ImportCell[][]): ImportPreview {
  if (!table.length || table.length > plannerImportMaxRows + 1 || table.some((row) => row.length > 30)) throw new Error("Usa una parrilla de hasta 200 filas y 30 columnas.");
  const headers = table[0].map((cell) => String(cell ?? "").slice(0, 100));
  const indexes = Object.fromEntries(Object.entries(aliases).map(([key, values]) => [key, headers.findIndex((header) => values.includes(normalize(header)))])) as Record<keyof typeof aliases, number>;
  if ([indexes.date, indexes.platform, indexes.title].some((index) => index < 0)) throw new Error("Faltan columnas: fecha, red y título. También puedes incluir hora, texto e imagen.");
  const rows = table.slice(1).map((values, index): ImportRow => {
    const get = (key: keyof typeof aliases): ImportCell => values[indexes[key]] ?? null;
    if (values.some((cell) => typeof cell === "string" && /^[=+@]/.test(cell.trim()))) return { row: index + 2, post: null, error: "No se importan fórmulas ni celdas calculadas." };
    const date = importedDate(get("date"));
    const image = String(get("image") ?? "").trim() || null;
    if (image && /chatgpt\.com|chat\.openai\.com/i.test(image)) return { row: index + 2, post: null, error: "El enlace de ChatGPT no es una imagen pública. Súbela desde el editor." };
    const post = { id: "placeholder", date, time: importedTime(get("time")), platform: normalize(get("platform")), format: image ? "4x5" : "text", title: String(get("title") ?? "").trim(), caption: String(get("caption") ?? ""), imageUrl: image, status: "IDEA", note: "Importado desde tu parrilla. Revisa antes de publicar." };
    if (!date) return { row: index + 2, post: null, error: "Fecha inválida: usa AAAA-MM-DD o DD/MM/AAAA." };
    post.id = stableId(JSON.stringify({ ...post, id: undefined }));
    const valid = parseProfessionalPlanner({ posts: [post] });
    return valid ? { row: index + 2, post: valid.posts[0], error: null } : { row: index + 2, post: null, error: "Revisa fecha, hora, red, título, texto o enlace de imagen." };
  });
  return { headers, rows };
}

export function appendPlannerImport(posts: PlannerPost[], rows: ImportRow[], selected: number[]): PlannerPost[] | null {
  const next = [...posts];
  for (const row of rows) if (row.post && selected.includes(row.row) && !next.some((post) => post.id === row.post!.id)) next.push({ ...row.post, status: "IDEA" });
  return next.length > plannerMaxPosts ? null : sortPosts(next);
}

function parseXml(text: string): Document {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error("El archivo contiene XML no permitido.");
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.getElementsByTagName("parsererror").length) throw new Error("No pudimos leer el XML del archivo.");
  return document;
}
/** Only bounded worksheet/string XML is decompressed; no macros or formulas are executed. */
export function readPlannerXlsx(bytes: Uint8Array): ImportCell[][] {
  if (bytes.byteLength > plannerImportMaxBytes) throw new Error("El Excel supera 2 MB.");
  let expanded = 0; let entries = 0;
  const files: Record<string, Uint8Array> = {};
  const unzip = new Unzip((file) => {
    entries++; if (entries > 1000) throw new Error("El archivo contiene demasiados componentes.");
    if (!/^xl\/(workbook\.xml|sharedStrings\.xml|worksheets\/sheet1\.xml)$/.test(file.name)) return;
    if (files[file.name] || file.originalSize === undefined || file.size === undefined || file.originalSize > plannerImportMaxBytes || file.originalSize > Math.max(1024, file.size * 100)) throw new Error("El Excel supera el límite de lectura segura.");
    const chunks: Uint8Array[] = []; let length = 0;
    file.ondata = (error, data, final) => {
      if (error) throw error;
      expanded += data.length; length += data.length;
      if (expanded > plannerImportMaxBytes || length > file.originalSize!) { file.terminate(); throw new Error("El Excel supera el límite de lectura de 2 MB."); }
      chunks.push(data);
      if (final) {
        if (length !== file.originalSize) throw new Error("El Excel contiene tamaños inconsistentes.");
        const output = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
        files[file.name] = output;
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  // Small compressed chunks bound the work before each actual-size callback.
  for (let offset = 0; offset < bytes.length; offset += 1024) unzip.push(bytes.subarray(offset, offset + 1024), offset + 1024 >= bytes.length);
  const sheet = files["xl/worksheets/sheet1.xml"];
  if (!sheet) throw new Error("El Excel necesita una primera hoja con la parrilla.");
  if (files["xl/workbook.xml"]) {
    const workbook = parseXml(strFromU8(files["xl/workbook.xml"]));
    const date1904 = workbook.getElementsByTagName("workbookPr")[0]?.getAttribute("date1904");
    if (date1904 === "1" || date1904 === "true") throw new Error("Este Excel usa fechas de 1904. Exporta la parrilla como CSV con fechas DD/MM/AAAA.");
    const sheets = workbook.getElementsByTagName("sheet");
    if (sheets.length !== 1) throw new Error("Usa un Excel con una sola hoja para evitar importar otra parrilla. Puedes exportar la hoja elegida como CSV.");
  }
  const strings = files["xl/sharedStrings.xml"] ? Array.from(parseXml(strFromU8(files["xl/sharedStrings.xml"])).getElementsByTagName("si"), (item) => Array.from(item.getElementsByTagName("t"), (node) => node.textContent ?? "").join("")) : [];
  const document = parseXml(strFromU8(sheet));
  const xmlRows = Array.from(document.getElementsByTagName("row"));
  if (xmlRows.length > plannerImportMaxRows + 1) throw new Error("La parrilla admite hasta 200 filas.");
  return xmlRows.map((row) => {
    const values: ImportCell[] = [];
    for (const cell of Array.from(row.getElementsByTagName("c"))) {
      const letters = /^([A-Z]+)/.exec(cell.getAttribute("r") ?? "")?.[1];
      let column = 0; for (const letter of letters ?? "") column = column * 26 + letter.charCodeAt(0) - 64;
      if (!column || column > 30) throw new Error("La parrilla admite hasta 30 columnas.");
      const raw = cell.getElementsByTagName("v")[0]?.textContent ?? "";
      values[column - 1] = cell.getElementsByTagName("f").length ? "=FORMULA" : cell.getAttribute("t") === "s" ? strings[Number(raw)] ?? "" : cell.getAttribute("t") === "inlineStr" ? cell.textContent ?? "" : raw && Number.isFinite(Number(raw)) ? Number(raw) : raw;
    }
    return Array.from({ length: values.length }, (_, index) => values[index] ?? null);
  });
}

export async function readPlannerImport(file: File): Promise<ImportPreview> {
  if (!file.size || file.size > plannerImportMaxBytes) throw new Error("Selecciona CSV o XLSX de hasta 2 MB.");
  if (/\.csv$/i.test(file.name)) return previewPlannerRows(parsePlannerCsv(await file.text()));
  if (/\.xlsx$/i.test(file.name)) return previewPlannerRows(readPlannerXlsx(new Uint8Array(await file.arrayBuffer())));
  throw new Error("Usa CSV o XLSX. Copia la tabla de Word a Excel y guarda CSV/XLSX; DOCX no se importa todavía.");
}
