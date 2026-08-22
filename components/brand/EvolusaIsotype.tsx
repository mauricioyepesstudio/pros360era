import { cn } from "@/lib/cn";

export type EvolusaIsotypeVariant = "primary" | "reverse" | "monochrome-navy" | "monochrome-white" | "monochrome-red";
export type EvolusaIsotypeSize = "header" | "compact" | "document" | "app";

const sizePx: Record<EvolusaIsotypeSize, number> = {
  compact: 20,
  header: 28,
  document: 32,
  app: 56,
};

const monochromeColor: Record<string, string> = {
  "monochrome-navy": "var(--evolusa-navy)",
  "monochrome-white": "var(--evolusa-white)",
  "monochrome-red": "var(--evolusa-red)",
};

/**
 * The standalone EVOLUSA isotype (arc/path mark + stars), independent of the
 * wordmark. Source: a temporary raster crop of the identity board
 * (public/brand/evolusa-isotype.png) — flagged for production vector
 * replacement in docs/EVOLUSA-BRAND-SYSTEM.md.
 *
 * "reverse" wraps the full-color mark in a white chip, matching the
 * identity board's own documented pattern for dark/photographic
 * backgrounds (its app-icon and social-avatar sections use exactly this
 * white-chip treatment) rather than inventing a flat white isotype that
 * doesn't exist in the source material.
 */
export default function EvolusaIsotype({
  variant = "primary",
  size = "header",
  className,
}: {
  variant?: EvolusaIsotypeVariant;
  size?: EvolusaIsotypeSize;
  className?: string;
}) {
  const px = sizePx[size];

  if (variant === "monochrome-navy" || variant === "monochrome-white" || variant === "monochrome-red") {
    return (
      <span
        role="img"
        aria-label="EVOLUSA"
        className={cn("inline-block", className)}
        style={{
          height: px,
          width: px,
          backgroundColor: monochromeColor[variant],
          WebkitMaskImage: "url(/brand/evolusa-isotype.png)",
          maskImage: "url(/brand/evolusa-isotype.png)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- variable intrinsic aspect ratio from a cropped brand asset.
  const mark = <img src="/brand/evolusa-isotype.png" alt="EVOLUSA" height={px} style={{ height: px, width: "auto" }} />;

  if (variant === "reverse") {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-full bg-white p-1", className)} style={{ padding: px * 0.14 }}>
        {mark}
      </span>
    );
  }

  return <span className={className}>{mark}</span>;
}
