"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { submitProfileInquiryAction } from "@/app/(account)/conexiones/solicitar/actions";

const friendlyErrors: Record<string,string> = {
  DISABLED: "Las solicitudes están temporalmente deshabilitadas.",
  INVALID: "Revisa los datos y acepta compartirlos con el profesional indicado.",
  AUTH_REQUIRED: "Tu sesión expiró. Inicia sesión nuevamente.",
  UNAVAILABLE: "Este profesional no está disponible para recibir solicitudes en el piloto.",
  RATE_LIMITED: "Has enviado varias solicitudes recientemente. Inténtalo más tarde.",
};
const unconfirmed = "No pudimos confirmar si se guardó tu solicitud. Vuelve a intentarlo con los mismos datos.";

export default function ProfileInquiryForm({ slug, professionalName }: { slug:string; professionalName:string }) {
  const [pending, startTransition] = useTransition();
  const idempotencyKey = useRef<string | null>(null);
  const [form, setForm] = useState({name:"",email:"",phone:"",service:"",summary:"",consent:false});
  const [result, setResult] = useState<{receiptId?:string;error?:string;retry?:true}|null>(null);
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(pending || result?.receiptId || !form.consent) return;
    idempotencyKey.current ??= crypto.randomUUID();
    startTransition(async()=>{
      try {
        const response = await submitProfileInquiryAction({...form, consent: true as const, slug, idempotencyKey:idempotencyKey.current!});
        if(response.saved) setResult({receiptId:response.receiptId});
        else if(response.reason === "SERVER_ERROR") setResult({retry:true,error:unconfirmed});
        else if(result?.retry) setResult({retry:true,error:`No se pudo confirmar el envío anterior. ${friendlyErrors[response.reason]}`});
        else setResult({error:friendlyErrors[response.reason]});
      } catch {
        setResult({retry:true,error:unconfirmed});
      }
    });
  }
  if(result?.receiptId) return (
    <div role="status" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-emerald-950">
      <CheckCircle2 size={34}/><h2 className="mt-4 text-2xl font-bold">Solicitud registrada</h2>
      <p className="mt-3 leading-7">Tus datos quedaron asociados exclusivamente al perfil de {professionalName}. Se guardaron en el ARM del profesional, sin enviar correos ni mensajes automáticos.</p>
      <p className="mt-3 text-xs">Referencia de solicitud: {result.receiptId}</p>
    </div>
  );
  return <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-9">
    <div><h2 className="text-2xl font-extrabold text-[var(--brand-navy)]">Solicita información</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esta solicitud se enviará únicamente al ARM de <strong>{professionalName}</strong> si completas el consentimiento. El piloto no enviará correos automáticos.</p>
    </div>
    <fieldset disabled={pending || result?.retry} className="grid min-w-0 gap-5" aria-label="Datos de la solicitud">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[var(--brand-navy)]">Nombre completo
          <input required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--border)] p-3 font-normal" placeholder="Tu nombre"/>
        </label>
        <label className="text-sm font-semibold text-[var(--brand-navy)]">Correo electrónico
          <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--border)] p-3 font-normal" placeholder="nombre@correo.com"/>
        </label>
        <label className="text-sm font-semibold text-[var(--brand-navy)]">Teléfono (opcional)
          <input type="tel" maxLength={50} autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--border)] p-3 font-normal" placeholder="Número de contacto"/>
        </label>
        <label className="text-sm font-semibold text-[var(--brand-navy)]">Servicio que necesitas
          <input required minLength={3} maxLength={120} value={form.service} onChange={e=>setForm({...form,service:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--border)] p-3 font-normal" placeholder="Ej. Consulta documental o cita notarial"/>
        </label>
      </div>
      <label className="text-sm font-semibold text-[var(--brand-navy)]">Cuéntanos brevemente tu proyecto
        <textarea required minLength={10} maxLength={1000} rows={4} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] p-3 font-normal" placeholder="Describe el servicio sin compartir números de expediente, estatus migratorio, información médica, documentos de identidad ni otros datos sensibles." />
      </label>
      <label className="flex items-start gap-3 rounded-xl bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--brand-navy)]">
        <input required type="checkbox" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})} className="mt-1 size-4 shrink-0"/>
        <span>Autorizo a EvolUSA a registrar y compartir los datos anteriores <strong>únicamente con {professionalName}</strong> para responder a esta solicitud. No autorizo mensajes promocionales automáticos.</span>
      </label>
    </fieldset>
    {!pending && result?.error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-900">{result.error}</p>}
    <button disabled={pending || !form.consent} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending?"Guardando solicitud…":result?.retry?"Reintentar solicitud":"Registrar solicitud"} <ArrowRight size={17} aria-hidden/></button>
    <p className="flex items-center gap-2 text-xs text-[var(--muted)]"><ShieldCheck size={16} aria-hidden/> No solicitamos documentos legales, contraseñas ni números de identificación en este formulario.</p>
  </form>;
}
