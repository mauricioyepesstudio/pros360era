import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-[var(--radius-pill)] bg-amber-50 px-3 py-1 text-xs font-semibold text-[var(--brand-gold-strong)]", className)} {...props} />;
}
