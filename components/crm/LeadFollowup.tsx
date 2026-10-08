"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";
import { followupInput, leadStatusLabels } from "@/lib/crm/followup";

interface Lead {
  id: string; name: string | null; email: string | null; phone: string | null;
  source: string; status: keyof typeof leadStatusLabels; notes: string | null; updated_at: string;
}
export default function LeadFollowup({ id }: { id: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<{ id: string; status: Lead["status"]; notes: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/crm/leads/${encodeURIComponent(id)}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("No pudimos cargar el prospecto o no está disponible para tu cuenta.");
      const data = await response.json();
      if (typeof data.updated_at !== "string" || !(data.status in leadStatusLabels)) throw new Error("No pudimos cargar el prospecto.");
      if (!controller.signal.aborted) { setLead(data); setDraft(previous => previous?.id === data.id ? previous : { id: data.id, status: data.status, notes: data.notes || "" }); setError(""); }
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [id, attempt]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || lead.id !== id || !draft || saving) return;
    const parsed = followupInput.safeParse({ ...Object.fromEntries(new FormData(event.currentTarget)), expectedUpdatedAt: lead.updated_at });
    if (!parsed.success) { setError("Revisa el estado y las notas (máximo 2000 caracteres)."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (!response.ok) throw new Error(response.status === 409 ? "Hay cambios más recientes. Recarga el prospecto antes de guardar; tus notas siguen en el formulario." : "No pudimos guardar. Tus cambios siguen en el formulario; intenta de nuevo.");
      const data = await response.json();
      if (typeof data.updated_at !== "string" || !(data.status in leadStatusLabels)) throw new Error("No pudimos confirmar el guardado. Recarga para revisar el estado.");
      setLead(data); setDraft({ id: data.id, status: data.status, notes: data.notes || "" }); setNotice("Seguimiento guardado correctamente.");
    } catch (error) { setError(error instanceof Error ? error.message : "No pudimos guardar."); }
    finally { setSaving(false); }
  }
  return <div className="space-y-6">
    <Link href="/crm/leads" className="font-bold text-[var(--brand-blue)]">Volver a prospectos</Link>
    <PageHeader eyebrow="CRM · Seguimiento" title={lead?.name || "Prospecto"} description="Registra el estado y tus notas de seguimiento. Esto no envía mensajes ni autoriza publicaciones." />
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-4">{notice}</p>}
    <button type="button" disabled={saving} onClick={() => { setNotice("Recargando la versión guardada. Conservamos tus cambios; revísalos antes de volver a guardar."); setAttempt(value => value + 1); }} className="min-h-11 font-bold text-[var(--brand-blue)]">Recargar prospecto</button>
    {!lead || lead.id !== id || !draft ? <p>{error ? "Reintenta con Recargar prospecto." : "Cargando prospecto…"}</p> : <form onSubmit={save} className="max-w-xl space-y-5 rounded-xl border border-[var(--border)] bg-white p-6">
      <dl className="space-y-2"><div><dt>Correo</dt><dd className="break-all font-semibold">{lead.email || "Sin correo"}</dd></div><div><dt>Teléfono</dt><dd>{lead.phone || "Sin teléfono"}</dd></div><div><dt>Fuente</dt><dd>{lead.source}</dd></div></dl>
      <label className="block font-semibold">Estado<select disabled={saving} name="status" value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as Lead["status"] })} className="mt-2 block w-full rounded-lg border p-3">{Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block font-semibold">Notas de seguimiento<textarea disabled={saving} name="notes" value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} maxLength={2000} rows={6} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <details className="text-sm"><summary className="cursor-pointer font-semibold">Ver última versión guardada</summary><p>Estado: {leadStatusLabels[lead.status]}</p><p className="whitespace-pre-line">{lead.notes || "Sin notas"}</p></details>
      <p className="text-sm text-[var(--muted)]">Último guardado: {new Date(lead.updated_at).toLocaleString("es-US")}. No incluyas datos sensibles.</p>
      <button disabled={saving} className="min-h-11 rounded-lg bg-[var(--brand-blue)] px-5 font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar seguimiento"}</button>
    </form>}
  </div>;
}
