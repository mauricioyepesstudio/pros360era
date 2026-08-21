import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]", className)} {...props} />;
}
