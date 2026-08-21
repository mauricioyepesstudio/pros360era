import type { StageId } from "@/data/journey/types";
import { journeyStages } from "@/data/journey/stages";
import { cn } from "@/lib/cn";

type EvolusaPathProps = {
  /** Highlights one stage as the current step. Omit for a neutral, structural display. */
  activeId?: StageId;
  theme?: "dark" | "light";
  className?: string;
};

/**
 * The EVOLUSA Path — a thin directional line with six nodes representing
 * Llega → Establécete → Emprende → Protégete → Crece → Evoluciona.
 * Structural, not literal: no road, no arrows, no cartoon illustration.
 * Stacks vertically on narrow viewports (a left-rail stepper) and lays out
 * horizontally from `sm:` up. Reused across Hero and the Journey section;
 * the same component is meant to extend to onboarding/roadmap/dashboard later.
 */
export default function EvolusaPath({ activeId, theme = "light", className }: EvolusaPathProps) {
  const dark = theme === "dark";
  const lineColor = dark ? "bg-white/20" : "bg-[var(--border)]";
  const labelColor = dark ? "text-white/85" : "text-[var(--brand-navy)]";
  const dotIdle = dark ? "border-white/40 bg-transparent" : "border-[var(--border)] bg-[var(--surface)]";
  const dotActive = "border-[var(--brand-blue)] bg-[var(--brand-blue)]";

  return (
    <ol aria-label="El camino EVOLUSA" className={cn("relative flex flex-col gap-5 sm:flex-row sm:gap-0", className)}>
      <span aria-hidden className={cn("absolute left-[0.4rem] top-1 bottom-1 w-px sm:hidden", lineColor)} />
      <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[0.4rem] hidden h-px sm:block", lineColor)} />
      {journeyStages.map((stage) => {
        const isActive = stage.id === activeId;
        return (
          <li key={stage.id} className="relative flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
            <span aria-hidden className={cn("relative z-10 size-[0.85rem] shrink-0 rounded-full border-2 transition-colors", isActive ? dotActive : dotIdle)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wide", labelColor, isActive && (dark ? "text-white" : "text-[var(--brand-blue)]"))}>{stage.shortLabel}</span>
          </li>
        );
      })}
    </ol>
  );
}
