"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { callTopics, callWindows, type InitialCallInput, type InitialCallRequest } from "@/lib/initial-call/validation";
import { requestInitialCallAction, cancelInitialCallAction } from "@/app/(account)/videollamada-inicial/actions";
export default function InitialCallForm({ initial, available, returnTo }: { initial: InitialCallRequest | null; available: boolean; returnTo: string }) {
 const router = useRouter();
 const [preferredName, setPreferredName] = useState(initial?.preferredName ?? "");
 const [topic, setTopic] = useState<InitialCallInput["topic"]>(initial?.topic ?? "CONOCER_EVOLUSA");
 const [availability, setAvailability] = useState<InitialCallInput["availability"]>(initial?.availability ?? "WEEKDAY_AFTERNOON");
 const [timeZone, setTimeZone] = useState(initial?.timeZone ?? "America/New_York");
 const [consent, setConsent] = useState(false);
 const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(""); const [failed, setFailed] = useState(false);
 async function submit(cancel = false) {
  setBusy(true); setNotice("");
  try { const r = cancel ? await cancelInitialCallAction() : await requestInitialCallAction({preferredName, topic, availability, timeZone, consent}); setNotice(r.message); setFailed(!r.saved); if(r.saved) { if(cancel) setConsent(false); router.refresh(); } }
  catch {setFailed(true);setNotice("No pudimos conectar. Tus opciones siguen aquí; intenta de nuevo.");} finally {setBusy(false);}
 }
 const field = "mt-2 w-full min-h-12 rounded-xl border border-[var(--border)] bg-white px-3";
 return <section className="rounded-xl border border-[var(--border)] bg-white p-6">
  {initial && <div className="mb-5 rounded-xl bg-[var(--sky-surface)] p-4"><p className="font-bold">{initial.status === "REQUESTED" ? "Solicitud recibida · por coordinar" : "Solicitud cancelada"}</p><p className="mt-2">{callTopics[initial.topic]} · {callWindows[initial.availability]} · {initial.timeZone}</p><p className="mt-2 text-sm">{initial.status === "REQUESTED" ? "Todavía no hay una fecha, hora ni enlace confirmado. EVOLUSA revisará tu disponibilidad para coordinar por el correo de tu cuenta." : "No hay una llamada pendiente. Puedes enviar otra solicitud cuando quieras."}</p></div>}
  {!available && <p role="alert">No podemos consultar tus solicitudes ahora. Reintenta más tarde.</p>}
  <form onSubmit={e => {e.preventDefault(); void submit();}} className="space-y-5">
   <fieldset disabled={busy || !available} className="space-y-5 disabled:opacity-60">
    <label className="block font-semibold">¿Cómo quieres que te llamemos?<input required minLength={2} maxLength={100} className={field} value={preferredName} onChange={e=>setPreferredName(e.target.value)} autoComplete="given-name"/></label>
    <label className="block font-semibold">¿De qué quieres hablar?<select className={field} value={topic} onChange={e=>setTopic(e.target.value as InitialCallInput["topic"])}>{Object.entries(callTopics).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label className="block font-semibold">Disponibilidad general<select className={field} value={availability} onChange={e=>setAvailability(e.target.value as InitialCallInput["availability"])}>{Object.entries(callWindows).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label className="block font-semibold">Zona horaria<input required maxLength={80} className={field} value={timeZone} onChange={e=>setTimeZone(e.target.value)} placeholder="America/New_York"/><span className="mt-2 block text-sm font-normal text-[var(--muted)]">Usa una zona como America/New_York. <button className="underline" type="button" onClick={()=>setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)}>Usar la de mi dispositivo</button></span></label>
    <label className="flex items-start gap-3 text-sm"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 size-5 shrink-0"/><span>Autorizo a EVOLUSA a usar el correo de esta cuenta únicamente para coordinar esta solicitud. Puedo retirar esta autorización cancelándola.</span></label>
    <button type="submit" className="min-h-12 rounded-full bg-[var(--brand-blue)] px-6 font-bold text-white">{busy ? "Guardando…" : initial?.status === "REQUESTED" ? "Actualizar solicitud" : "Enviar solicitud"}</button>
   </fieldset>
  </form>
  {initial?.status === "REQUESTED" && <button type="button" disabled={busy || !available} onClick={()=>void submit(true)} className="mt-4 min-h-12 px-3 font-semibold underline disabled:opacity-50">Cancelar solicitud</button>}
  {notice && <p role={failed ? "alert" : "status"} className="mt-4 rounded-xl bg-[var(--sky-surface)] p-4">{notice}</p>}
  <Link href={returnTo} className="mt-6 inline-block min-h-12 py-3 font-bold text-[var(--brand-blue)] underline">Continuar a mi cuenta</Link>
 </section>;
}
