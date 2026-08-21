import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import { journeyStages } from "@/data/journey/stages";

export default function JourneyOverview() {
  return (
    <Section id="journey" labelledBy="journey-title">
      <Heading id="journey-title" eyebrow="EVOLUSA Journey">Un camino que crece contigo</Heading>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">Puedes empezar en cualquier etapa. Cada una organiza un objetivo claro y una lógica sencilla para continuar.</p>
      <div className="mt-14 hidden sm:block">
        <EvolusaPath />
      </div>
      <ol className="mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {journeyStages.map((stage) => (
          <li key={stage.id} className="border-t border-[var(--border)] pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">
              {String(stage.order).padStart(2, "0")} · {stage.shortLabel}
            </p>
            <p className="mt-3 leading-7 text-[var(--muted)]">{stage.primaryGoal}</p>
            <Link href="#stage-selector" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]">
              {stage.cta.label}
              <ArrowRight aria-hidden className="ml-2" size={16} />
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}
