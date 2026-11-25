"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Handshake, Map, TrendingUp, UserCheck, Video } from "lucide-react";
import BenefitCard from "@/components/evolusa/BenefitCard";
import { useAccountRole } from "@/components/layout/useAccountRole";

/**
 * What a usuario gets, one card per benefit (owner, 13-nov). Only things the
 * member panel has today: plan (/roadmap), conexiones, plan de crédito,
 * guías públicas and the initial call request. The assistant is not listed:
 * it is not connected yet. No promised outcomes; "perfil aprobado", never
 * "verificado".
 */
const line = "border-t-2 border-[var(--brand-navy)] pt-3";

const benefits = [
  {
    icon: Map,
    title: "Tu plan personal",
    body: "Respondes unas preguntas y ves en qué etapa estás, qué hacer ahora y qué sigue.",
    panel: "/roadmap",
    preview: (
      <div className={line}>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Etapa 2 de 6 · Establécete</p>
        <div className="mt-2 grid grid-cols-6 gap-1.5">{[1, 2, 3, 4, 5, 6].map((n) => <span key={n} className={`h-2 rounded-full ${n <= 2 ? "bg-[var(--role-member)]" : "bg-[var(--border)]"}`} />)}</div>
        <p className="mt-2.5 text-[13px] font-semibold">Ahora: arma tu carpeta para alquilar</p>
      </div>
    ),
  },
  {
    icon: UserCheck,
    title: "Profesionales con perfil aprobado",
    body: "Pides ayuda con lo que necesitas y buscamos un profesional con perfil aprobado según tu estado y tu idioma.",
    panel: "/conexiones/nueva",
    preview: (
      <div className={`${line} flex flex-wrap gap-2 text-[12px] font-semibold`}>
        {["Lo que necesitas", "Tu estado", "Tu idioma"].map((t) => <span key={t} className="rounded-full bg-[var(--role-member-soft)] px-3 py-1 text-[var(--role-member-strong)]">{t}</span>)}
      </div>
    ),
  },
  {
    icon: Handshake,
    title: "Tus conexiones, en orden",
    body: "Ves en qué va cada conexión con un profesional y qué te toca hacer a ti.",
    panel: "/conexiones",
    preview: (
      <div className={line}>
        {[["Notaría · Hialeah", "Te respondió"], ["Marketing · Doral", "En espera"]].map(([who, st]) => (
          <div key={who} className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 text-[13px]"><span className="truncate">{who}</span><span className="shrink-0 rounded-full bg-[var(--role-member)] px-2.5 py-0.5 text-[11px] font-bold text-white">{st}</span></div>
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Tu historial de crédito, paso a paso",
    body: "Una guía educativa, paso a paso y a tu ritmo, para empezar tu historial de crédito. No es asesoría financiera.",
    panel: "/plan-credito",
    preview: (
      <ul className={`${line} grid gap-1.5 text-[13px]`}>
        {[["Entiende cómo funciona", true], ["Elige tu primer paso", true], ["Revisa tu avance", false]].map(([t, done]) => (
          <li key={t as string} className="flex items-center gap-2"><span className={`grid size-4 place-items-center rounded-full text-[10px] font-black ${done ? "bg-[var(--role-member)] text-white" : "border border-[var(--border)]"}`}>{done ? "✓" : ""}</span>{t as string}</li>
        ))}
      </ul>
    ),
  },
  {
    icon: BookOpen,
    title: "Guías en español",
    body: "Guías prácticas, como abrir tu negocio en Florida o aparecer en Google.",
    panel: "/guias/abrir-negocio-florida",
    public: true,
    preview: (
      <div className={line}>
        {["Abrir tu negocio en Florida", "Aparecer en Google"].map((g) => <p key={g} className="border-b border-[var(--border)] py-2 text-[13px] font-semibold">{g}</p>)}
      </div>
    ),
  },
  {
    icon: Video,
    title: "Una videollamada para empezar",
    body: "Pides una conversación inicial y te explicamos cómo usar EVOLUSA.",
    panel: "/videollamada-inicial",
    preview: (
      <div className={`${line} flex items-center gap-3 text-[13px]`}>
        <span className="grid size-9 place-items-center rounded-full bg-[var(--role-member)] text-white"><Video size={16} /></span>
        <span><span className="block font-semibold">Solicitud enviada</span><span className="text-[var(--muted)]">Te escribimos para coordinar</span></span>
      </div>
    ),
  },
] as const;

export default function UserBenefits() {
  const { signedIn } = useAccountRole();
  return (
    <section id="beneficios" aria-labelledby="user-benefits-title" className="scroll-mt-24 bg-[var(--role-member-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--role-member-strong)]">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />Para ti, en español
        </p>
        <h2 id="user-benefits-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">
          Lo que tienes en EVOLUSA.
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg text-slate-600">Seis cosas concretas, en tu panel de usuario y en español.</p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon, title, body, panel, ...rest }) => {
            const preview = "preview" in rest ? rest.preview : undefined;
            const isPublic = "public" in rest;
            const link = isPublic
              ? { href: panel, label: "Leer una guía" }
              : signedIn
                ? { href: panel, label: "Abrir en mi panel" }
                : undefined;
            return <BenefitCard key={title} tone="member" icon={icon} title={title} body={body} preview={preview} link={link} />;
          })}
        </ul>
        {!signedIn ? (
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/onboarding" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--role-member)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--role-member-strong)]">
              Empezar gratis <ArrowRight aria-hidden size={18} />
            </Link>
            <span className="text-sm text-slate-600">Sin tarjeta. No pedimos números de identificación.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
