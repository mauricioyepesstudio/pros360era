import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * One benefit = one card (owner, 13-nov: "tarjetas de cada uno de los
 * beneficios"). Same shape on both sides of the site; the tone carries the
 * role color (azul = usuario, rojo = profesional). A card only describes
 * something that exists today in that panel; `link` points to it.
 */
export type BenefitTone = "member" | "pro";

export type BenefitCardProps = {
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
  tone: BenefitTone;
  preview?: ReactNode;
  link?: { href: string; label: string };
};

const toneStyles: Record<BenefitTone, { bar: string; icon: string; link: string }> = {
  member: {
    bar: "bg-[var(--role-member)]",
    icon: "bg-[var(--role-member-soft)] text-[var(--role-member-strong)]",
    link: "text-[var(--role-member-strong)]",
  },
  pro: {
    bar: "bg-[var(--role-pro)]",
    icon: "bg-[var(--role-pro-soft)] text-[var(--role-pro)]",
    link: "text-[var(--role-pro)]",
  },
};

export default function BenefitCard({ icon: Icon, title, body, tone, preview, link }: BenefitCardProps) {
  const styles = toneStyles[tone];
  return (
    <li className={cn("relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(10,25,49,0.04)]", link && "transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(10,25,49,0.28)]")}>
      <span aria-hidden className={cn("h-1.5 w-full", styles.bar)} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span aria-hidden className={cn("grid size-12 place-items-center rounded-xl", styles.icon)}>
          <Icon aria-hidden size={24} />
        </span>
        <h3 className="mt-5 text-xl font-bold leading-snug text-[var(--brand-navy)]">{title}</h3>
        <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--muted)]">{body}</p>
        {preview ? <div aria-hidden className="mt-6 text-[var(--brand-navy)]">{preview}</div> : null}
        {link ? (
          <Link href={link.href} className={cn("mt-auto inline-flex min-h-11 items-center gap-1.5 pt-5 text-sm font-bold underline-offset-4 hover:underline", styles.link)}>
            {link.label}
            <ArrowRight aria-hidden size={16} />
            <span className="sr-only">: {title}</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}
