import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  eyebrow?: string;
};

export default function Heading({ as: Tag = "h2", eyebrow, children, className, ...props }: HeadingProps) {
  return <div>{eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold-strong)]">{eyebrow}</p>}<Tag className={cn("text-balance font-bold leading-tight text-[var(--brand-navy)]", Tag === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl", className)} {...props}>{children}</Tag></div>;
}
