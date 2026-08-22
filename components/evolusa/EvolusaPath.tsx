"use client";

import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import type { StageId } from "@/data/journey/types";
import { journeyStages } from "@/data/journey/stages";
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
 * the active stage. No road, no arrows, no cartoon illustration. Stacks
 * vertically on narrow viewports (a left-rail progression) and lays out
 * horizontally from `sm:` up. Reused across Hero and the Journey section;
 * the same component is meant to extend to onboarding/roadmap/dashboard later.
 */
export default function EvolusaPath({ activeId, theme = "light", className, scrollProgress }: EvolusaPathProps) {
  const dark = theme === "dark";
  const activeIndex = journeyStages.findIndex((stage) => stage.id === activeId);
  const staticProgress = activeIndex >= 0 ? activeIndex / (journeyStages.length - 1) : 0;

  const trackColor = dark ? "bg-white/15" : "bg-[var(--border)]";
  // Blue is functional (progress fill, past stages) — red is EVOLUSA's
  // brand accent, reserved for the single active/current stage only.
  const fillColor = dark ? "bg-[var(--brand-blue-on-dark)]" : "bg-[var(--brand-blue)]";
  const activeColor = "bg-[var(--brand-red)]";
  const labelColor = dark ? "text-white/80" : "text-[var(--muted)]";
  const dotIdle = dark ? "border-white/35 bg-[var(--brand-navy)]" : "border-[var(--border)] bg-[var(--surface)]";

  const showFill = scrollProgress !== undefined || activeIndex >= 0;

  return (
    <ol aria-label="El camino EVOLUSA" className={cn("relative flex flex-col gap-6 sm:flex-row sm:gap-0", className)}>
      {/* mobile: vertical track */}
      <span aria-hidden className={cn("absolute left-[0.5rem] top-1 bottom-1 w-px sm:hidden", trackColor)} />
      {activeIndex >= 0 && (
        <span
          aria-hidden
          className={cn("absolute left-[0.5rem] top-1 w-px transition-all duration-700 ease-out sm:hidden", fillColor)}
          style={{ height: `calc((100% - 0.5rem) * ${staticProgress})` }}
        />
      )}
      {/* desktop: horizontal track */}
      <span aria-hidden className={cn("absolute inset-x-[8.3%] top-[0.5rem] hidden h-px sm:block", trackColor)} />
      {showFill &&
        (scrollProgress ? (
          <motion.span
            aria-hidden
            className={cn("absolute left-[8.3%] top-[0.5rem] hidden h-px origin-left sm:block", fillColor)}
            style={{ width: "83.4%", scaleX: scrollProgress }}
          />
        ) : (
          <span
            aria-hidden
            className={cn("absolute left-[8.3%] top-[0.5rem] hidden h-px transition-all duration-700 ease-out sm:block", fillColor)}
            style={{ width: `calc(83.4% * ${staticProgress})` }}
          />
        ))}
      {journeyStages.map((stage, index) => {
        const isActive = stage.id === activeId;
        const isPast = activeIndex >= 0 && index < activeIndex;
        return (
          <li
            key={stage.id}
            aria-current={isActive ? "step" : undefined}
            className="relative flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:gap-3 sm:text-center"
          >
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                isActive
                  ? cn("size-4", activeColor, "border-[var(--brand-red)]")
                  : cn("size-[0.6rem]", isPast ? fillColor : dotIdle, isPast && (dark ? "border-[var(--brand-blue-on-dark)]" : "border-[var(--brand-blue)]")),
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide transition-colors",
                isActive ? (dark ? "text-white" : "text-[var(--brand-navy)]") : labelColor,
              )}
            >
              {stage.shortLabel}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
