"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";
import { leadInput, leadSources } from "@/lib/crm/validation";

const sourceLabels = { website: "Sitio web", whatsapp: "WhatsApp", instagram: "Instagram", facebook: "Facebook", email: "Correo", referral: "Referido", other: "Otro" };
export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = leadInput.safeParse(data);
    if (!parsed.success) { setError("Agrega un nombre o medio de contacto y revisa los campos."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/crm/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (!response.ok) { setError(response.status === 409 ? "Ya tienes un prospecto con ese correo." : "No pudimos guardar el prospecto. Tus datos siguen en este formulario; intenta de nuevo."); return; }
      const saved = await response.json();
      if (typeof saved.id !== "string") throw new Error("Invalid result");
      router.push("/crm/leads"); router.refresh();
    } catch { setError("No pudimos guardar el prospecto. Intenta de nuevo."); }
    finally { setSaving(false); }
  }
  return <div className="space-y-6">
    <PageHeader eyebrow="CRM" title="Nuevo prospecto" description="Guarda un contacto para darle seguimiento. Registrar sus datos no autoriza mensajes automáticos." />
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
      <label className="block font-semibold">Fuente<select name="source" className="mt-2 block w-full rounded-lg border border-[var(--border)] p-3">{leadSources.map((source) => <option key={source} value={source}>{sourceLabels[source]}</option>)}</select></label>
      {([{ name: "name", label: "Nombre", type: "text", max: 200 }, { name: "email", label: "Correo", type: "email", max: 254 }, { name: "phone", label: "Teléfono", type: "tel", max: 50 }] as const).map((field) => <label key={field.name} className="block font-semibold">{field.label}<input name={field.name} type={field.type} maxLength={field.max} className="mt-2 block w-full rounded-lg border border-[var(--border)] p-3" /></label>)}
      <label className="block font-semibold">Notas<textarea name="notes" maxLength={2000} className="mt-2 block w-full rounded-lg border border-[var(--border)] p-3" /></label>
      <p className="text-sm text-[var(--muted)]">Agrega al menos un nombre, correo o teléfono.</p>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex items-center gap-4"><button disabled={saving} type="submit" className="rounded-lg bg-[var(--brand-blue)] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar prospecto"}</button><Link href="/crm/leads">Cancelar</Link></div>
    </form>
  </div>;
}
