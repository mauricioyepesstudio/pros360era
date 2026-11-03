"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { disclaimers } from "@/data/compliance/claims";
import { cn } from "@/lib/cn";

/**
 * The 6 stages as one red path (owner liked it, 3-nov). Tabs on a line;
 * the panel is a full-bleed split (photo edge to edge, no rounded frame)
 * with what you do in that stage and which kind of professional helps.
 * EVOLUSA guides and connects; the professional does the work.
 */
const roadmapGuidance = disclaimers.find((disclaimer) => disclaimer.id === "roadmap-guidance")!;

const stages = [
  { label: "Llega", sub: "Tus primeros papeles", img: "/images/journey/arrival.jpg", alt: "Un hombre llega a Miami con su maleta", items: ["Reúne y ordena los documentos que traes", "Traduce actas y certificados", "Sabe qué hacer primero, sin perderte"], helper: "Preparación de documentos", initial: "D" },
  { label: "Establécete", sub: "Casa, banco, trámites", img: "/images/journey/stability.jpg", alt: "Una pareja desempaca en su nuevo apartamento", items: ["Notariza contratos, cartas y declaraciones", "Arma tu carpeta para alquilar o abrir tu cuenta", "Ten tus documentos listos y en orden"], helper: "Notaría", initial: "N" },
  { label: "Emprende", sub: "Tu propio negocio", img: "/images/journey/entrepreneurship.jpg", alt: "Una mujer organiza los papeles de su negocio", items: ["Organiza tu negocio desde el primer día", "Precios, facturas y procesos claros", "Ordena lo que necesitas para arrancar"], helper: "Operaciones de negocio", initial: "O" },
  { label: "Protégete", sub: "Tu familia en orden", img: "/images/journey/protection-family.jpg", alt: "Una familia sonríe frente a la bahía de Miami", items: ["Guarda los papeles de tu familia en un solo lugar", "Notariza poderes y autorizaciones", "Sabe dónde está cada documento importante"], helper: "Notaría", initial: "N" },
  { label: "Crece", sub: "Más clientes", img: "/images/journey/growth.jpg", alt: "Un dueño de negocio trabaja en su laptop", items: ["Tu negocio en Google y en redes", "Una página web que te traiga clientes", "Contenido en español que te haga visible"], helper: "Marketing para tu negocio", initial: "M" },
  { label: "Evoluciona", sub: "Tu siguiente meta", img: "/images/journey/achievement.jpg", alt: "Una profesional sonríe frente a la ciudad", items: ["Mira lo que lograste y fija tu próxima meta", "Tu camino se actualiza contigo", "Vuelve cuando lo necesites"], helper: "El profesional que tú elijas", initial: "★" },
] as const;

export default function StageJourney() {
  const [current, setCurrent] = useState(0);
  const stage = stages[current];
  const next = (current + 1) % stages.length;

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-20 bg-white pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-red-strong)]">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />Tu camino
        </p>
        <h2 id="journey-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">6 etapas. Tú decides en cuál estás.</h2>
        <p className="mt-4 max-w-[58ch] text-lg text-[var(--muted)]">Toca una etapa y mira qué se hace ahí y quién te puede ayudar.</p>

        <div role="tablist" aria-label="Etapas del camino EVOLUSA" className="relative mt-14 grid grid-cols-3 gap-y-7 sm:grid-cols-6 sm:gap-y-0">
          <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-[33px] hidden h-1 bg-[var(--border)] sm:block" />
          <span aria-hidden className="absolute left-[8.33%] top-[33px] hidden h-1 bg-[var(--brand-red)] transition-[width] duration-500 sm:block" style={{ width: `calc(83.33% * ${current / 5})` }} />
          {stages.map((item, index) => {
            const selected = index === current;
            return (
              <button
                key={item.label}
                id={`stage-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="stage-panel"
                aria-label={item.label}
                onClick={() => setCurrent(index)}
                className="group relative z-10 flex flex-col items-center gap-1.5 px-1 text-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-14 place-items-center rounded-full border-[3px] bg-white text-lg font-extrabold transition sm:size-[70px] sm:text-xl",
                    selected
                      ? "scale-110 border-[var(--brand-red)] bg-[var(--brand-red)] text-white shadow-[0_12px_28px_rgba(242,13,36,0.35)]"
                      : index < current
                        ? "border-[var(--brand-red)] text-[var(--brand-red-strong)]"
                        : "border-[var(--border)] text-[var(--brand-navy)] group-hover:border-[var(--brand-red)]",
                  )}
                >
                  {index + 1}
                </span>
                <span className="mt-1.5 text-[15px] font-bold text-[var(--brand-navy)]">{item.label}</span>
                <span aria-hidden className="text-xs leading-tight text-[var(--muted)]">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${current}`} className="mt-16 grid bg-[#fafaf8] md:min-h-[37.5vw] md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image key={stage.img} src={stage.img} alt={stage.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-5 px-5 py-10 md:px-16 md:py-16 lg:pr-[max(1.25rem,calc((100vw-1200px)/2+1.25rem))]">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Etapa {current + 1} de 6 · {stage.sub}</p>
          <h3 className="text-4xl font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">{stage.label}</h3>
          <ul className="grid gap-3 text-[17px] text-[var(--brand-navy)]">
            {stage.items.map((item) => (
              <li key={item} className="flex items-start gap-3.5">
                <span aria-hidden className="mt-[13px] h-[3px] w-[18px] shrink-0 bg-[var(--brand-red)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3.5 border-t-2 border-[var(--brand-navy)] pt-5">
            <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-red-strong)] font-extrabold text-white">{stage.initial}</span>
            <span>
              <span className="block text-[17px] font-bold text-[var(--brand-navy)]">Te ayuda: {stage.helper}</span>
              <span className="block text-sm text-[var(--muted)]">Profesionales con perfil aprobado por EVOLUSA</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button type="button" onClick={() => setCurrent(next)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-6 font-bold text-white transition hover:bg-[#a90016]">
              {current === 5 ? "Volver a empezar" : `Siguiente: ${stages[next].label}`} <ArrowRight aria-hidden size={18} />
            </button>
            {current > 0 ? (
              <button type="button" onClick={() => setCurrent(current - 1)} className="min-h-11 font-bold text-[var(--brand-navy)] underline underline-offset-[5px]">
                ← Etapa anterior
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <p className="mx-auto max-w-[1200px] px-5 py-6 text-xs leading-5 text-[var(--muted)]"><strong className="text-[var(--brand-navy)]">Guía educativa EVOLUSA.</strong> {roadmapGuidance.full}</p>
    </section>
  );
}
