import { cn } from "@/lib/cn";

export type EvolusaLogoVariant = "primary" | "reverse" | "monochrome-navy" | "monochrome-white" | "monochrome-red";
export type EvolusaLogoSize = "header" | "compact" | "document" | "app";

const heightBySize: Record<EvolusaLogoSize, number> = {
  compact: 22,
  header: 30,
  document: 40,
  app: 48,
};

const monochromeColor: Record<string, string> = {
  "monochrome-navy": "var(--evolusa-navy)",
  "monochrome-white": "var(--evolusa-white)",
  "monochrome-red": "var(--evolusa-red)",
};

/**
 * The full EVOLUSA signature (isotype + wordmark). Source: temporary raster
 * crops of the owner-approved identity board (public/brand/evolusa-primary.png,
 * evolusa-wordmark-reverse.png) — see docs/EVOLUSA-BRAND-SYSTEM.md for exactly
 * which assets are final vs. still need production vector replacement.
 *
 * "reverse" uses the board's white wordmark crop; the isotype's navy chevron
 * has no true reverse art from the board (only the color isotype exists), so
 * on solid dark surfaces the chevron blends into the background while the
 * red arc/stars remain visible — documented as a known interim limitation.
 */
export default function EvolusaLogo({
  variant = "primary",
  size = "header",
  className,
}: {
  variant?: EvolusaLogoVariant;
  size?: EvolusaLogoSize;
  className?: string;
}) {
  const height = heightBySize[size];

  if (variant === "monochrome-navy" || variant === "monochrome-white" || variant === "monochrome-red") {
    return (
      <span
        role="img"
        aria-label="EVOLUSA"
        className={cn("inline-block", className)}
        style={{
          height,
          width: height * 4.6,
          backgroundColor: monochromeColor[variant],
          WebkitMaskImage: "url(/brand/evolusa-primary.png)",
          maskImage: "url(/brand/evolusa-primary.png)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "left center",
          maskPosition: "left center",
        }}
      />
    );
  }

  const src = variant === "reverse" ? "/brand/evolusa-wordmark-reverse.png" : "/brand/evolusa-primary.png";

  // eslint-disable-next-line @next/next/no-img-element -- variable intrinsic aspect ratio from a cropped brand asset; next/image needs fixed dimensions we don't reliably have per crop.
  return <img src={src} alt="EVOLUSA" height={height} style={{ height, width: "auto" }} className={className} />;
}
