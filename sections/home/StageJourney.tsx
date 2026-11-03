"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { disclaimers, isServicePublishable } from "@/data/compliance/claims";
import { journeyStages } from "@/data/journey/stages";
import type { StageId } from "@/data/journey/types";
import { enabledServices } from "@/data/services/services";
import { cn } from "@/lib/cn";

/**
 * The 6 stages, once. Replaces three sections that each listed the stages
 * again (6 tarjetas "Tu camino en 6 etapas", "¿Dónde estás hoy?" and
 * "Servicios por etapa / Opciones activas para avanzar"). One tab per stage;
 * the panel shows what it includes, the services available now, and one
 * action.
 */
const roadmapGuidance = disclaimers.find((disclaimer) => disclaimer.id === "roadmap-guidance")!;

const publishableServices = enabledServices.filter(
  (service) => isServicePublishable(service.category, false) && !service.requiresVerification,
);

export default function StageJourney() {
  const [selectedId, setSelectedId] = useState<StageId>("LLEGA");
  const stage = journeyStages.find((item) => item.id === selectedId) ?? journeyStages[0];
  const services = publishableServices.filter((service) => service.stageIds.some((id) => id === stage.id));

  return (
    <Section id="journey" labelledBy="journey-title" className="scroll-mt-20 bg-[var(--role-member-soft)]">
      <Heading id="journey-title" eyebrow="Tu camino">¿En qué etapa estás?</Heading>

      <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" >
        <div role="tablist" aria-label="Etapas del camino EVOLUSA" className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-6">
          {journeyStages.map((item) => {
            const selected = item.id === stage.id;
            return (
              <button
                key={item.id}
                id={`stage-tab-${item.slug}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="stage-panel"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "min-h-14 rounded-[var(--radius-md)] px-4 py-2 text-left transition",
                  selected ? "bg-[var(--role-member)] text-white" : "bg-white text-[var(--brand-navy)] hover:bg-white/70",
                )}
              >
                <span className={cn("block text-[11px] font-bold tracking-wider", selected ? "text-white/80" : "text-[var(--role-member)]")}>{String(item.order).padStart(2, "0")}</span>
                <span className="block text-sm font-bold sm:text-base">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage.slug}`} className="mt-6 grid gap-6 rounded-[var(--radius-lg)] bg-white p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
        <div>
          <h3 className="text-2xl font-extrabold text-[var(--brand-navy)] sm:text-3xl">{stage.title}</h3>
          <ul className="mt-5 space-y-3">
            {stage.includes.map((item) => (
              <li key={item} className="flex gap-3 leading-6 text-[var(--brand-navy)]">
                <Check aria-hidden className="mt-1 shrink-0 text-[var(--role-member)]" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-5 border-t border-[var(--border)] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {services.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Disponible ahora</p>
              <ul className="mt-3 space-y-2">
                {services.map((service) => (
                  <li key={service.id} className="text-sm font-semibold text-[var(--brand-navy)]">{service.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-sm leading-6 text-[var(--muted)]"><strong className="text-[var(--brand-navy)]">Al terminar:</strong> {stage.outcome}</p>
          <ButtonLink href="/onboarding" variant="member" className="mt-auto w-full sm:w-fit">
            Crear mi roadmap <ArrowRight aria-hidden className="ml-2" size={16} />
          </ButtonLink>
        </div>
      </div>
      <p className="mt-5 text-xs leading-5 text-[var(--muted)]"><strong className="text-[var(--brand-navy)]">Guía educativa EVOLUSA.</strong> {roadmapGuidance.full}</p>
    </Section>
  );
}
