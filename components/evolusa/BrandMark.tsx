import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

type BrandMarkProps = { variant?: "wordmark" | "stacked"; size?: "sm" | "md" | "lg"; theme?: "light" | "dark"; showTagline?: boolean; className?: string };
export default function BrandMark({ variant = "wordmark", size = "md", theme = "light", showTagline = false, className }: BrandMarkProps) {
  const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" };
  return <span className={cn("inline-flex", variant === "stacked" ? "flex-col items-start" : "items-baseline gap-3", className)} aria-label={brand.displayName}><span aria-hidden="true" className={cn("font-extrabold tracking-[-0.045em]", sizes[size])}><span className={theme === "dark" ? "text-white" : "text-[var(--brand-navy)]"}>{brand.wordmarkParts.evol}</span><span className="text-[var(--brand-coral)]">{brand.wordmarkParts.usa}</span></span>{showTagline && <span aria-hidden="true" className={cn("font-medium", theme === "dark" ? "text-slate-300" : "text-[var(--muted)]", variant === "stacked" ? "mt-1 text-xs" : "text-sm")}>{brand.tagline}</span>}</span>;
}
