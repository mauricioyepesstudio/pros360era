import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold tracking-[0.02em] transition disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    primary:
      "bg-[var(--brand-red)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]",
    secondary:
      "border border-[var(--border)] bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-strong)]",
    ghost:
      "text-white hover:bg-white/10",
  };

  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
