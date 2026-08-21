import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-subtle)]", className)} {...props} />;
}
