import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2 text-[var(--foreground)] disabled:cursor-not-allowed disabled:bg-[var(--surface-subtle)]", className)} {...props}>{children}</select>;
}
