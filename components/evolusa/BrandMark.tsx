import { brand } from "@/config/brand";
import EvolusaLogo from "@/components/brand/EvolusaLogo";
import { cn } from "@/lib/cn";

type BrandMarkProps = { variant?: "wordmark" | "stacked"; size?: "sm" | "md" | "lg"; theme?: "light" | "dark"; showTagline?: boolean; className?: string };

const sizeMap = { sm: "compact", md: "header", lg: "document" } as const;

/**
 * Compatibility wrapper around the real EvolusaLogo brand component — kept
 * so existing call sites (SiteHeader, AccountShell, login/signup, Footer,
 * OnboardingFlow) don't each need updating individually. New code should
 * reach for EvolusaLogo/EvolusaIsotype directly.
 */
export default function BrandMark({ variant = "wordmark", size = "md", theme = "light", showTagline = false, className }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex", variant === "stacked" ? "flex-col items-start gap-1" : "items-center gap-3", className)}>
      <EvolusaLogo variant={theme === "dark" ? "reverse" : "primary"} size={sizeMap[size]} />
      {showTagline && (
        <span aria-hidden className={cn("font-medium", theme === "dark" ? "text-slate-300" : "text-[var(--muted)]", variant === "stacked" ? "text-xs" : "text-sm")}>
          {brand.tagline}
        </span>
      )}
    </span>
  );
}
