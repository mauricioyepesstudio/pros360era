import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export default function ButtonLink({ children, className, variant = "primary", ...props }: ButtonLinkProps) {
  const variants = {
    primary: "bg-[var(--brand-red)] text-white shadow-[0_14px_30px_-18px_rgb(242_13_36_/_0.5)] hover:bg-[var(--brand-red-strong)]",
    secondary: "border border-[var(--border)] bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-strong)]",
    ghost: "text-[var(--brand-navy)] hover:bg-[var(--surface-subtle)]",
  };
  return <Link className={cn("inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5", variants[variant], className)} {...props}>{children}</Link>;
}
