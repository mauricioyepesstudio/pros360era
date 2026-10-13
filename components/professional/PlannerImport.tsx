"use client";
import { useState } from "react";
import { appendPlannerImport, readPlannerImport, type ImportPreview } from "@/lib/professional-planner/import";
import type { PlannerPost } from "@/lib/professional-planner/validation";

export default function PlannerImport({ posts, busy, save }: { posts: PlannerPost[]; busy: boolean; save: (posts: PlannerPost[]) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  async function read(file: File) {
    setReading(true); setMessage(""); setPreview(null); setSelected([]);
    try { const result = await readPlannerImport(file); setPreview(result); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No pudimos leer la plantilla."); }
    finally { setReading(false); }
  }
  async function confirm() {
    if (!preview) return;
    const next = appendPlannerImport(posts, preview.rows, selected);
    if (!next) { setMessage("Las filas seleccionadas superan el límite de 200 publicaciones. Selecciona menos."); return; }
    if (await save(next)) { setPreview(null); setSelected([]); setMessage("Plantilla importada como Ideas. No se publicó ningún contenido."); }
    else setMessage("No pudimos guardar. Tu selección sigue aquí para reintentar.");
  }
  return <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="min-h-11 rounded-full border border-[var(--border)] px-4 font-semibold">Importar plantilla</button>
    {open && <div className="mt-3 space-y-3">
      <p className="text-sm text-[var(--muted)]">Carga tu calendario existente desde Excel (.xlsx) o CSV. Se lee en tu navegador; el archivo original no se sube. Revisa y selecciona antes de guardar como Ideas. No conecta ni sincroniza calendarios externos.</p>
      <p className="text-xs text-[var(--muted)]">Excel con una sola hoja, máximo 2 MB y 200 filas. Columnas: fecha, red, título; opcionales: hora, texto, imagen. Fecha AAAA-MM-DD o DD/MM/AAAA; horas del Este de EE. UU. Sin hora: 12:00. Fórmulas no se importan. Word: copia la tabla a Excel y guarda CSV/XLSX; DOCX todavía no es compatible.</p>
      <label className="block text-sm font-semibold">Seleccionar plantilla<input type="file" accept=".csv,.xlsx" disabled={reading || busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void read(file); }} className="mt-2 block w-full text-sm" /></label>
      {reading && <p role="status">Leyendo plantilla…</p>}
      {preview && <>
        <p className="text-xs text-[var(--muted)]">Columnas detectadas: {preview.headers.join(" · ")}. Filas válidas: {preview.rows.filter((row) => row.post).length}; por corregir: {preview.rows.filter((row) => !row.post).length}.</p>
        <ul className="max-h-80 space-y-2 overflow-y-auto">{preview.rows.map((row) => {
          const duplicate = Boolean(row.post && posts.some((post) => post.id === row.post!.id));
          return <li key={row.row} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm"><label className="flex items-start gap-3"><input type="checkbox" disabled={!row.post || duplicate || busy} checked={selected.includes(row.row)} onChange={(event) => setSelected(event.target.checked ? [...selected, row.row] : selected.filter((number) => number !== row.row))} className="mt-1 size-4" /><span><strong>Fila {row.row}: {row.post?.title ?? "No importable"}</strong>{row.post ? <><span className="block">{row.post.date} · {row.post.time} · {row.post.platform} · Idea</span><span className="block whitespace-pre-wrap text-xs text-[var(--muted)]">{row.post.caption}</span></> : <span className="block text-[var(--danger)]">{row.error}</span>}{duplicate && <span className="block text-xs">Ya existe en tu planner.</span>}</span></label></li>;
        })}</ul>
        <button type="button" disabled={busy || !selected.length} onClick={() => void confirm()} className="min-h-11 rounded-full bg-[var(--brand-blue)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Guardando…" : `Importar ${selected.length} como Ideas`}</button>
      </>}
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>}
  </section>;
}
