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

type PathTokens = {
  dark: boolean;
  trackColor: string;
  fillColor: string;
  activeColor: string;
  labelColor: string;
  dotIdle: string;
};

/**
 * Node/Row are declared at module scope (not inside EvolusaPath's render
 * body) so their identity stays stable across renders — nested function
 * components get a new identity every render, which resets any state they
 * hold and trips eslint-plugin-react-hooks's static-components rule.
 * Shared per-render styling is threaded through as one `tokens` object
 * rather than five separate props.
 */
function Node({ stage, index, activeId, activeIndex, tokens }: { stage: JourneyStage; index: number; activeId?: StageId; activeIndex: number; tokens: PathTokens }) {
  const { dark, activeColor, fillColor, dotIdle, labelColor } = tokens;
  const isActive = stage.id === activeId;
  const isPast = activeIndex >= 0 && index < activeIndex;
  return (
    <li key={stage.id} aria-current={isActive ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-3 text-center">
      {/* Fixed-height slot so every dot, idle or active, centers on the track line. */}
      <span aria-hidden className="relative z-10 flex h-6 items-center justify-center">
        {isActive && <span className="absolute size-6 rounded-full bg-[var(--brand-red)] opacity-60 motion-safe:animate-ping" />}
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
            isActive
              ? cn("size-6", activeColor, "border-white shadow-[0_0_0_6px_rgba(242,13,36,0.3),0_0_22px_rgba(242,13,36,0.7)]")
              : cn("size-4", isPast ? fillColor : dotIdle, isPast && (dark ? "border-[var(--brand-blue-on-dark)]" : "border-[var(--brand-blue)]")),
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wide transition-colors sm:text-[13px]",
          isActive ? (dark ? "text-white" : "text-[var(--brand-navy)]") : labelColor,
          dark && "[text-shadow:0_1px_6px_rgba(0,0,0,0.85)]",
        )}
      >
        {stage.shortLabel}
      </span>
    </li>
  );
}

function Row({
  stages,
  fillFrom,
  fillTo,
  activeId,
  activeIndex,
  showFill,
  tokens,
}: {
  stages: readonly JourneyStage[];
  fillFrom: number;
  fillTo: number;
  activeId?: StageId;
  activeIndex: number;
  showFill: boolean;
  tokens: PathTokens;
}) {
  const { trackColor, fillColor } = tokens;
  // Row-local progress: how far the active index has advanced within this row's span.
  const span = fillTo - fillFrom;
  const rowProgress = activeIndex < fillFrom ? 0 : activeIndex >= fillTo ? 1 : (activeIndex - fillFrom) / span;
  return (
    <ol className="relative flex gap-0">
      <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[10px] h-1 rounded-full", trackColor)} />
      {showFill && (
        <span
          aria-hidden
          className={cn("absolute left-[8.3%] top-[10px] h-1 rounded-full transition-all duration-700 ease-out", fillColor)}
          style={{ width: `calc(83.4% * ${rowProgress})` }}
        />
      )}
      {stages.map((stage, i) => (
        <Node key={stage.id} stage={stage} index={fillFrom + i} activeId={activeId} activeIndex={activeIndex} tokens={tokens} />
      ))}
    </ol>
  );
}

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

  const tokens: PathTokens = {
    dark,
    trackColor: dark ? "bg-white/35 shadow-[0_0_10px_rgba(0,0,0,0.45)]" : "bg-[var(--border)]",
    fillColor: dark
      ? "bg-[var(--brand-blue-on-dark)] shadow-[0_0_14px_rgba(120,170,255,0.85)]"
      : "bg-[var(--brand-blue)]",
    activeColor: "bg-[var(--brand-red)]",
    labelColor: dark ? "text-white/90" : "text-[var(--muted)]",
    dotIdle: dark ? "border-white bg-[var(--brand-navy)] shadow-[0_0_10px_rgba(255,255,255,0.45)]" : "border-[var(--border)] bg-[var(--surface)]",
  };
  const showFill = scrollProgress !== undefined || activeIndex >= 0;

  return (
    <div className={cn("relative", className)} aria-label="El camino EVOLUSA">
      {/* sm+ : one continuous row of 6, with optional live scroll-linked fill */}
      <ol className="relative hidden sm:flex">
        <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[10px] h-1 rounded-full", tokens.trackColor)} />
        {showFill &&
          (scrollProgress ? (
            <motion.span
              aria-hidden
              className={cn("absolute left-[8.3%] top-[10px] h-1 rounded-full origin-left", tokens.fillColor)}
              style={{ width: "83.4%", scaleX: scrollProgress }}
            />
          ) : (
            <span
              aria-hidden
              className={cn("absolute left-[8.3%] top-[10px] h-1 rounded-full transition-all duration-700 ease-out", tokens.fillColor)}
              style={{ width: `calc(83.4% * ${total > 1 ? Math.max(activeIndex, 0) / (total - 1) : 0})` }}
            />
          ))}
        {journeyStages.map((stage, index) => (
          <Node key={stage.id} stage={stage} index={index} activeId={activeId} activeIndex={activeIndex} tokens={tokens} />
        ))}
      </ol>

      {/* below sm: two rows of 3 */}
      <div className="flex flex-col gap-6 sm:hidden">
        <Row stages={journeyStages.slice(0, 3)} fillFrom={0} fillTo={3} activeId={activeId} activeIndex={activeIndex} showFill={showFill} tokens={tokens} />
        <Row stages={journeyStages.slice(3, 6)} fillFrom={3} fillTo={6} activeId={activeId} activeIndex={activeIndex} showFill={showFill} tokens={tokens} />
      </div>
    </div>
  );
}
