"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, ShieldCheck, UserRound } from "lucide-react";
import { useAccountRole } from "@/components/layout/useAccountRole";
import { roleLabels, type AccountRole } from "@/lib/account/navigation";
import { cn } from "@/lib/cn";

/**
 * Signed in, the home says plainly which account this is, in that role's
 * color (azul = usuario, rojo = profesional), with one button to that
 * panel. The owner (ADMIN) gets both panels. Signed out it renders nothing.
 */
export default function HomeRoleBar() {
  const { signedIn, role } = useAccountRole();
  if (!signedIn || !role) return null;
  return <HomeRoleBarView role={role} />;
}

export function HomeRoleBarView({ role }: { role: AccountRole }) {
  const labels = roleLabels(role);
  const pro = role === "PROFESSIONAL";
  const admin = role === "ADMIN";
  const Icon = admin ? ShieldCheck : pro ? Briefcase : UserRound;
  const detail = admin
    ? "Puedes abrir el panel de usuario o el panel profesional."
    : pro
      ? "Tu panel tiene Clientes, Oportunidades, Planner y Crecimiento."
      : "Tu panel tiene tu plan, tus conexiones y tu siguiente paso.";

  return (
    <section
      aria-label="Tu cuenta"
      data-role={role}
      className={cn("text-white", admin ? "bg-[var(--brand-navy)]" : pro ? "bg-[var(--role-pro)]" : "bg-[var(--role-member)]")}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-3">
          <Icon aria-hidden size={22} className="shrink-0" />
          <span>
            <strong className="block text-lg font-extrabold leading-tight">Entraste con tu {labels.account.toLowerCase()}</strong>
            <span className="text-sm text-white/85">{detail}</span>
          </span>
        </p>
        {admin ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/api/account/vista?panel=member" className="inline-flex min-h-11 items-center rounded-full bg-[var(--role-member)] px-5 text-sm font-bold text-white hover:bg-[var(--role-member-strong)]">Panel de usuario</Link>
            <Link href="/api/account/vista?panel=professional" className="inline-flex min-h-11 items-center rounded-full bg-[var(--role-pro)] px-5 text-sm font-bold text-white hover:brightness-110">Panel profesional</Link>
          </div>
        ) : (
          <Link href="/dashboard" className={cn("inline-flex min-h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-bold", pro ? "text-[var(--role-pro)]" : "text-[var(--role-member)]")}>
            {labels.panel}<ArrowRight aria-hidden className="ml-2" size={16} />
          </Link>
        )}
      </div>
    </section>
  );
}
