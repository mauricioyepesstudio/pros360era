"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { stageIntents } from "@/data/journey/intents";
import { journeyStages } from "@/data/journey/stages";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";

/**
 * Large editorial statements, not a form/card grid — the user locates
 * themselves on the journey rather than filling out a questionnaire. The
 * active choice gets a shared-layout animated underline (Framer `layoutId`)
 * instead of a border/ring treatment.
 */
export default function StageSelector() {
  const [selectedId, setSelectedId] = useState<string>(stageIntents[0].id);
  const selected = stageIntents.find((item) => item.id === selectedId) ?? stageIntents[0];
  const stage = journeyStages.find((item) => item.id === selected.stageId)!;

  return (
    <Section id="stage-selector" labelledBy="stage-selector-title" className="bg-[var(--surface-subtle)]">
      <Heading id="stage-selector-title" eyebrow="Empieza desde donde estás">¿Dónde estás hoy?</Heading>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">Elige lo que más se parece a tu situación.</p>

      <div className="mt-10 flex flex-col divide-y divide-[var(--border)]" role="group" aria-label="Selecciona tu situación actual">
        {stageIntents.map((intent) => {
          const active = selectedId === intent.id;
          return (
            <button
              key={intent.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(intent.id)}
              className="relative flex items-baseline justify-between gap-6 py-5 text-left transition"
            >
              <span>
                <span className={cn("block text-xl font-bold transition-colors sm:text-2xl", active ? "text-[var(--brand-navy)]" : "text-[var(--muted)]")}>
                  {intent.label}
                </span>
                <span className={cn("mt-1.5 block text-sm leading-6 transition-colors", active ? "text-[var(--muted)]" : "text-[var(--muted)]/0 sm:text-[var(--muted)]/70")}>
                  {intent.description}
                </span>
              </span>
              {active && (
                <motion.span
                  layoutId="stage-intent-indicator"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-y-0 -left-4 my-auto h-8 w-1 rounded-full bg-[var(--brand-blue)] sm:h-10"
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={stage.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-8 flex flex-col gap-5 rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-6 text-white sm:flex-row sm:items-center sm:justify-between"
        aria-live="polite"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--brand-blue-on-dark)]">Etapa sugerida: {stage.shortLabel}</p>
          <p className="mt-2 text-xl font-bold">{stage.title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{stage.description}</p>
        </div>
        <ButtonLink href="#roadmap" className="shrink-0">
          {stage.cta.label} <ArrowRight aria-hidden="true" className="ml-2" size={18} />
        </ButtonLink>
      </motion.div>
      <input type="hidden" name="stageIntent" value={selected.leadIntent} />
    </Section>
  );
}
