"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { stageIntents } from "@/data/journey/intents";
import { journeyStages } from "@/data/journey/stages";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";

export default function StageSelector() {
  const [selectedId, setSelectedId] = useState<string>(stageIntents[0].id);
  const selected = stageIntents.find((item) => item.id === selectedId) ?? stageIntents[0];
  const stage = journeyStages.find((item) => item.id === selected.stageId)!;

  return (
    <Section id="stage-selector" labelledBy="stage-selector-title" className="bg-[var(--surface-subtle)]">
      <Heading id="stage-selector-title" eyebrow="Empieza desde donde estás">¿Dónde estás hoy?</Heading>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">Elige lo que más se parece a tu situación. Podrás ajustar tu camino después.</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Selecciona tu situación actual">
        {stageIntents.map((intent) => {
          const active = selectedId === intent.id;
          return (
            <button
              key={intent.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(intent.id)}
              className={cn(
                "min-h-[6.5rem] rounded-[var(--radius-lg)] border bg-[var(--surface)] p-5 text-left transition",
                active ? "border-[var(--brand-blue)] shadow-[var(--shadow-sm)]" : "border-[var(--border)] hover:border-[var(--brand-blue)]/50",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--brand-blue)]">{intent.label}</span>
                {active && <Check aria-hidden size={16} className="shrink-0 text-[var(--brand-blue)]" />}
              </span>
              <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{intent.description}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col gap-5 rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-6 text-white sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-blue-on-dark)]">Etapa sugerida: {stage.shortLabel}</p>
          <p className="mt-2 text-xl font-bold">{stage.title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{stage.description}</p>
        </div>
        <ButtonLink href="#roadmap" className="shrink-0">
          {stage.cta.label} <ArrowRight aria-hidden="true" className="ml-2" size={18} />
        </ButtonLink>
      </div>
      <input type="hidden" name="stageIntent" value={selected.leadIntent} />
    </Section>
  );
}
