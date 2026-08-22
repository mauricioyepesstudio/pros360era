import type { StageId } from "@/data/journey/types";
import { journeyStages } from "@/data/journey/stages";
import { cn } from "@/lib/cn";

/**
 * The identity board's "insignia de etapa" — a dashed circular badge with
 * ETAPA / numeral / stage name. Use selectively at moments of real
 * achievement (diagnostic result, roadmap milestones, completion states) —
 * not decoratively throughout the product.
 */
export default function EvolusaStageBadge({
  stageId,
  size = 96,
  className,
}: {
  stageId: StageId;
  size?: number;
  className?: string;
}) {
  const stage = journeyStages.find((item) => item.id === stageId);
  if (!stage) return null;

  return (
    <div
      className={cn("relative flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-[var(--brand-navy)]/25 text-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Etapa ${stage.order}: ${stage.shortLabel}`}
    >
      <span aria-hidden className="text-[var(--brand-red)]" style={{ fontSize: size * 0.09, letterSpacing: "0.1em" }}>
        ★ ★ ★
      </span>
      <span className="mt-0.5 font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]" style={{ fontSize: size * 0.1 }}>
        Etapa
      </span>
      <span className="font-extrabold leading-none text-[var(--brand-navy)]" style={{ fontSize: size * 0.32 }}>
        {String(stage.order).padStart(2, "0")}
      </span>
      <span className="font-bold uppercase tracking-wide text-[var(--brand-navy)]" style={{ fontSize: size * 0.1 }}>
        {stage.shortLabel}
      </span>
    </div>
  );
}
