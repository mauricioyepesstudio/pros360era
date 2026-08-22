"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import type { StageId } from "@/data/journey/types";
import { journeyStages } from "@/data/journey/stages";
import type { JourneyStage } from "@/data/journey/types";
import { cn } from "@/lib/cn";

type EvolusaPathProps = {
  /** Highlights one stage as the current step. Omit for a neutral, structural display. */
  activeId?: StageId;
  theme?: "dark" | "light";
  className?: string;
  /**
   * Optional live scroll-linked fill (0–1 motion value) for the desktop
   * track, e.g. from Hero's useScroll. When provided, this drives the fill
   * instead of the static activeId-based progress — used to make the Path
   * feel like a continuous, scroll-reactive thread rather than a static
   * per-page-load indicator. Omit for the default static behavior.
   */
  scrollProgress?: MotionValue<number>;
};

/**
 * The EVOLUSA Path — a product system, not a decorative road illustration:
 * six milestone nodes on a line whose fill communicates real progress up to
 * the active stage. No road, no arrows, no cartoon illustration.
 *
 * Renders as a single horizontal line of 6 from `sm:` up. Below `sm:`
 * (narrow mobile), it renders as two horizontal rows of 3 — matching the
 * approved mobile reference — rather than a vertical left-rail list; each
 * row is its own mini line+node group, sharing one continuous progress
 * reference back to the full 6-stage index.
 */
export default function EvolusaPath({ activeId, theme = "light", className, scrollProgress }: EvolusaPathProps) {
  const dark = theme === "dark";
  const activeIndex = journeyStages.findIndex((stage) => stage.id === activeId);
  const total = journeyStages.length;

  const trackColor = dark ? "bg-white/15" : "bg-[var(--border)]";
  const fillColor = dark ? "bg-[var(--brand-blue-on-dark)]" : "bg-[var(--brand-blue)]";
  const activeColor = "bg-[var(--brand-red)]";
  const labelColor = dark ? "text-white/80" : "text-[var(--muted)]";
  const dotIdle = dark ? "border-white/35 bg-[var(--brand-navy)]" : "border-[var(--border)] bg-[var(--surface)]";
  const showFill = scrollProgress !== undefined || activeIndex >= 0;

  function Node({ stage, index }: { stage: JourneyStage; index: number }) {
    const isActive = stage.id === activeId;
    const isPast = activeIndex >= 0 && index < activeIndex;
    return (
      <li key={stage.id} aria-current={isActive ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-3 text-center">
        <span
          aria-hidden
          className={cn(
            "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
            isActive
              ? cn("size-5", activeColor, "border-[var(--brand-red)] shadow-[0_0_0_6px_rgba(242,13,36,0.25)]")
              : cn("size-3", isPast ? fillColor : dotIdle, isPast && (dark ? "border-[var(--brand-blue-on-dark)]" : "border-[var(--brand-blue)]")),
          )}
        />
        <span className={cn("text-xs font-semibold uppercase tracking-wide transition-colors", isActive ? (dark ? "text-white" : "text-[var(--brand-navy)]") : labelColor)}>
          {stage.shortLabel}
        </span>
      </li>
    );
  }

  function Row({ stages, fillFrom, fillTo }: { stages: readonly JourneyStage[]; fillFrom: number; fillTo: number }) {
    // Row-local progress: how far the active index has advanced within this row's span.
    const span = fillTo - fillFrom;
    const rowProgress = activeIndex < fillFrom ? 0 : activeIndex >= fillTo ? 1 : (activeIndex - fillFrom) / span;
    return (
      <ol className="relative flex gap-0">
        <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[0.5rem] h-px", trackColor)} />
        {showFill && (
          <span
            aria-hidden
            className={cn("absolute left-[8.3%] top-[0.5rem] h-px transition-all duration-700 ease-out", fillColor)}
            style={{ width: `calc(83.4% * ${rowProgress})` }}
          />
        )}
        {stages.map((stage, i) => (
          <Node key={stage.id} stage={stage} index={fillFrom + i} />
        ))}
      </ol>
    );
  }

  return (
    <div className={cn("relative", className)} aria-label="El camino EVOLUSA">
      {/* sm+ : one continuous row of 6, with optional live scroll-linked fill */}
      <ol className="relative hidden sm:flex">
        <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[0.5rem] h-px", trackColor)} />
        {showFill &&
          (scrollProgress ? (
            <motion.span
              aria-hidden
              className={cn("absolute left-[8.3%] top-[0.5rem] h-px origin-left", fillColor)}
              style={{ width: "83.4%", scaleX: scrollProgress }}
            />
          ) : (
            <span
              aria-hidden
              className={cn("absolute left-[8.3%] top-[0.5rem] h-px transition-all duration-700 ease-out", fillColor)}
              style={{ width: `calc(83.4% * ${total > 1 ? Math.max(activeIndex, 0) / (total - 1) : 0})` }}
            />
          ))}
        {journeyStages.map((stage, index) => (
          <Node key={stage.id} stage={stage} index={index} />
        ))}
      </ol>

      {/* below sm: two rows of 3 */}
      <div className="flex flex-col gap-6 sm:hidden">
        <Row stages={journeyStages.slice(0, 3)} fillFrom={0} fillTo={3} />
        <Row stages={journeyStages.slice(3, 6)} fillFrom={3} fillTo={6} />
      </div>
    </div>
  );
}
