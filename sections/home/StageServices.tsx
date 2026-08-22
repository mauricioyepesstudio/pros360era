"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Megaphone } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import StatusBadge from "@/components/ui/StatusBadge";
import { isServicePublishable } from "@/data/compliance/claims";
import { journeyStages } from "@/data/journey/stages";
import type { StageId } from "@/data/journey/types";
import { enabledServices } from "@/data/services/services";
import { cn } from "@/lib/cn";

const fulfillmentLabels = {
  DIRECT: "Servicio directo",
  PARTNER: "Partner verificado",
  REFERRAL: "Referencia",
  EDUCATIONAL: "Orientación educativa",
  REQUIRES_VERIFICATION: "Verificación requerida",
} as const;

const categoryIcons = {
  EDUCATION: BookOpen,
  MARKETING: Megaphone,
  BUSINESS_OPERATIONS: BriefcaseBusiness,
} as const;

const publishableServices = enabledServices.filter(
  (service) => isServicePublishable(service.category, false) && !service.requiresVerification,
);

export default function StageServices() {
  const [selectedStageId, setSelectedStageId] = useState<StageId>("LLEGA");
  const selectedStage = journeyStages.find((stage) => stage.id === selectedStageId) ?? journeyStages[0];
  const stageServices = publishableServices.filter((service) =>
    service.stageIds.some((stageId) => stageId === selectedStage.id),
  );

  return (
    <Section id="stage-services" labelledBy="stage-services-title" className="bg-[var(--surface-subtle)]">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <Heading id="stage-services-title" eyebrow="Servicios por etapa">Opciones activas para avanzar</Heading>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
            Elige una etapa para ver únicamente los servicios disponibles que pueden ayudarte a actuar ahora.
          </p>
        </div>
        <ButtonLink href="#roadmap" variant="ghost" className="w-fit">Ver el Roadmap<ArrowRight aria-hidden="true" className="ml-2" size={17} /></ButtonLink>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Servicios disponibles por etapa">
        {journeyStages.map((stage) => {
          const selected = stage.id === selectedStage.id;
          return (
            <button
              key={stage.id}
              id={`services-tab-${stage.slug}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="stage-services-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setSelectedStageId(stage.id)}
              className={cn(
                "min-h-16 rounded-[var(--radius-md)] px-3 py-3 text-left transition focus-visible:z-10 sm:min-h-20 sm:px-4",
                selected ? "bg-[var(--brand-navy)] text-white" : "bg-white/60 text-[var(--brand-navy)] hover:bg-white",
              )}
            >
              <span className={cn("block text-[11px] font-bold tracking-wider", selected ? "text-sky-200" : "text-[var(--brand-blue)]")}>{String(stage.order).padStart(2, "0")}</span>
              <span className="mt-1 block text-sm font-bold sm:text-base">{stage.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div id="stage-services-panel" role="tabpanel" aria-labelledby={`services-tab-${selectedStage.slug}`} className="mt-8">
        <div className="grid gap-6 border-b border-[var(--border)] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)] lg:items-end">
          <div>
            <p className="text-sm font-bold text-[var(--brand-blue)]">Etapa {String(selectedStage.order).padStart(2, "0")}</p>
            <h3 className="mt-2 text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">{selectedStage.shortLabel}</h3>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{selectedStage.description}</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">Objetivo de esta etapa</p>
            <p className="mt-2 text-sm leading-6 text-[var(--brand-navy)]">{selectedStage.primaryGoal}</p>
          </div>
        </div>

        {stageServices.length > 0 ? (
          <ul className="mt-6 divide-y divide-[var(--border)]">
            {stageServices.map((service) => {
              const Icon = categoryIcons[service.category as keyof typeof categoryIcons] ?? BriefcaseBusiness;
              return (
                <li key={service.id} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:gap-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--sky-surface)] text-[var(--brand-blue)]"><Icon aria-hidden="true" size={21} /></span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h4 className="text-lg font-bold text-[var(--brand-navy)]">{service.name}</h4>
                      <StatusBadge status="complete">{fulfillmentLabels[service.fulfillmentType]}</StatusBadge>
                    </div>
                    <p className="mt-1 leading-6 text-[var(--muted)]">{service.summary}</p>
                  </div>
                  <Link href="#roadmap" aria-label={`Incluir ${service.name} en mi Roadmap`} className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-[var(--brand-red)] hover:underline">
                    Incluir<ArrowRight aria-hidden="true" className="ml-1.5" size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--success)]" size={24} />
              <div>
                <h4 className="font-bold text-[var(--brand-navy)]">Orientación segura para esta etapa</h4>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">No mostramos servicios regulados o pendientes de verificación. Tu Roadmap puede ayudarte a identificar recursos educativos y el próximo paso apropiado.</p>
              </div>
            </div>
            <ButtonLink href="#roadmap" className="shrink-0">Empezar Roadmap</ButtonLink>
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-[var(--muted)]">EVOLUSA ofrece orientación educativa y operacional. Los servicios regulados permanecen fuera del catálogo hasta verificar proveedor, alcance y requisitos.</p>
      </div>
    </Section>
  );
}
