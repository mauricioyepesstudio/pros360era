import Link from "next/link";
import { ArrowRight, Check, Compass, FolderCheck, Rocket, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { journeyStages } from "@/data/journey/stages";
import { disclaimers } from "@/data/compliance/claims";

const stageIcons = { Compass, FolderCheck, Rocket, ShieldCheck, TrendingUp, Sparkles };
const roadmapGuidance = disclaimers.find((disclaimer) => disclaimer.id === "roadmap-guidance")!;

export default function JourneyOverview() {
  return (
    <Section id="journey" labelledBy="journey-title" className="scroll-mt-24 bg-[var(--surface-subtle)]">
      <div className="max-w-3xl">
        <Heading id="journey-title" eyebrow="Tu roadmap EVOLUSA">Tu camino en EE. UU., en 6 etapas.</Heading>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Cada etapa reúne pasos concretos. Ubica tu momento, mira qué incluye y empieza en la etapa que necesites.
        </p>
      </div>

      <ol aria-label="Las seis etapas del camino EVOLUSA" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journeyStages.map((stage) => {
          const Icon = stageIcons[stage.icon];
          return (
            <li key={stage.id} className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl font-bold tracking-tight text-[var(--brand-blue)]">{String(stage.order).padStart(2, "0")}</span>
                <Icon aria-hidden className="text-[var(--brand-blue)]" size={26} />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[var(--brand-navy)]">{stage.shortLabel}</h3>
              <p className="mt-2 font-semibold leading-7 text-[var(--brand-navy)]">{stage.title}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-blue)]">Qué incluye</p>
              <ul className="mt-3 space-y-2.5">
                {stage.includes.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-6 text-[var(--muted)]">
                    <Check aria-hidden className="mt-1 shrink-0 text-[var(--brand-blue)]" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 mb-5 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--brand-navy)]">
                <span className="font-semibold">Al completarla: </span>
                {stage.outcome}
              </p>
              <Link href="/onboarding" className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]">
                {stage.cta.label}
                <ArrowRight aria-hidden className="shrink-0" size={16} />
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col items-start gap-6 rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue-on-dark)]">Guía educativa EVOLUSA</p>
          <p className="mt-2 text-xl font-semibold">No tienes que resolverlo todo hoy. Empieza por tu próximo paso.</p>
          <p className="mt-3 text-sm leading-6 text-white/80">{roadmapGuidance.full}</p>
        </div>
        <ButtonLink href="/onboarding" className="shrink-0">
          Crear mi roadmap <ArrowRight aria-hidden className="ml-2" size={16} />
        </ButtonLink>
      </div>
    </Section>
  );
}
