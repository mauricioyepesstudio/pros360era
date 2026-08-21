import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Status = "complete" | "current" | "upcoming" | "verification";
export default function StatusBadge({ status, className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { status: Status }) {
  const styles = { complete: "bg-emerald-50 text-[var(--success)]", current: "bg-amber-50 text-[var(--warning)]", upcoming: "bg-slate-100 text-slate-600", verification: "bg-orange-50 text-orange-800" };
  return <span className={cn("inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold", styles[status], className)} {...props}>{children}</span>;
}
