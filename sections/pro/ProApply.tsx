"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAccountRole } from "@/components/layout/useAccountRole";
import { PROFESSIONAL_HOME } from "@/lib/account/navigation";

const cta = "inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]";

/**
 * Closing block of /para-profesionales. A visitor sees how to apply; a
 * profesional (or the owner) who is already in is not asked to apply again.
 */
export default function ProApply() {
  const { role } = useAccountRole();
  const inside = role === "PROFESSIONAL" || role === "ADMIN";

  if (inside) {
    return (
      <section aria-labelledby="panel-cta-title" className="border-t-[6px] border-[var(--brand-red)] bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="panel-cta-title" className="text-3xl font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-4xl">Tu panel te espera.</h2>
            <p className="mt-3 text-lg text-[var(--muted)]">Solicitudes, clientes, planner y redes, en un solo lugar.</p>
          </div>
          <Link href={PROFESSIONAL_HOME} className={cta}>Ir a mi panel profesional <ArrowRight aria-hidden size={18} /></Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="apply-title" className="border-t-[6px] border-[var(--brand-red)] bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1200px] items-end gap-10 px-5 md:grid-cols-[1.2fr_1fr] md:gap-14">
        <div>
          <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-red-strong)]"><span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />Aplica hoy</p>
          <h2 id="apply-title" className="mt-3 text-4xl font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">Aplica en <span className="text-[var(--brand-red)]">5 minutos</span>.</h2>
          <p className="mt-4 text-lg text-[var(--muted)]">Revisamos tu perfil y te avisamos por correo.</p>
          <Link href="/aplicar-profesional" className={`mt-10 ${cta}`}>Aplicar como profesional <ArrowRight aria-hidden size={18} /></Link>
        </div>
        <ol className="border-t-2 border-[var(--brand-navy)] text-[var(--brand-navy)]">
          {["Llenas tu solicitud", "Revisamos tu perfil", "Publicamos tu perfil aprobado"].map((item, index) => (
            <li key={item} className="flex items-baseline gap-5 border-b border-[var(--border)] py-4 text-[17px] font-semibold">
              <span aria-hidden className="text-2xl font-extrabold text-[var(--brand-red)]">{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
        <p className="max-w-[84ch] text-[12.5px] leading-5 text-[var(--muted)] md:col-span-2">No prometemos un número de clientes. Revisamos cada perfil antes de publicarlo como perfil aprobado; eso no es una verificación de identidad. Ningún pago cambia tu posición ni tu aprobación. Hoy recibimos marketing, operaciones de negocio, notaría y preparación documental, en Florida; en notaría y preparación documental revisamos tu licencia o comisión vigente antes de aprobar el perfil.</p>
      </div>
    </section>
  );
}
