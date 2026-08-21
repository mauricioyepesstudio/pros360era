import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-32 w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-subtle)]", className)} {...props} />;
}
