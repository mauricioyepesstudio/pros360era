"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
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

  return <Section id="stage-selector" labelledBy="stage-selector-title" className="bg-[var(--surface-subtle)]"><Heading id="stage-selector-title" eyebrow="Empieza desde donde estás">¿En qué etapa estás?</Heading><p className="mt-5 max-w-2xl text-lg text-[var(--muted)]">Elige la opción que más se parece a tu situación. Podrás ajustar el camino después.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Selecciona tu situación actual">{stageIntents.map((intent) => { const intentStage = journeyStages.find((item) => item.id === intent.stageId)!; return <button key={intent.id} type="button" aria-pressed={selectedId === intent.id} onClick={() => setSelectedId(intent.id)} className={cn("min-h-36 rounded-[var(--radius-lg)] border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]", selectedId === intent.id ? "border-[var(--brand-gold-strong)] ring-2 ring-amber-100" : "border-[var(--border)]")}><span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-gold-strong)]">{intentStage.shortLabel}</span><span className="mt-2 block font-bold text-[var(--brand-navy)]">{intent.label}</span><span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{intent.description}</span></button>; })}</div><div className="mt-8 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-white/10 bg-[var(--brand-navy)] p-6 text-white shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between" aria-live="polite"><div><p className="text-sm font-semibold text-[var(--brand-gold)]">Etapa sugerida: {stage.shortLabel}</p><p className="mt-2 text-xl font-bold">{stage.title}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{stage.description}</p></div><ButtonLink href="#roadmap" className="shrink-0">{stage.cta.label} <ArrowRight aria-hidden="true" className="ml-2" size={18} /></ButtonLink></div><input type="hidden" name="stageIntent" value={selected.leadIntent} /></Section>;
}
