import Link from "next/link";
import { ArrowRight, Compass, FolderCheck, Rocket, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
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
          Ubica tu momento y descubre tu próximo paso. Puedes empezar en cualquier etapa.
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
              <p className="mt-2 flex-1 leading-7 text-[var(--muted)]">{stage.title}</p>
              <Link href="/onboarding" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]">
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
