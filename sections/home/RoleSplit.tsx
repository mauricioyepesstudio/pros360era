"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * One section, two roles, two colors. Replaces the old "¿Cómo te ayuda
 * EVOLUSA?" explainer and "Cómo funciona" steps, which repeated each other.
 *
 * Desktop (lg+): the screen splits in halves. Left = usuario (azul),
 * right = profesional (dorado). Both visible, one primary action each.
 * Mobile: a two-color switch on top shows one half at a time, so the page
 * stays short and the person only reads what applies to them.
 *
 * Copy rules: no promised figures; "perfil aprobado", never "verificado".
 */
type Role = "usuario" | "profesional";

const roles: Record<Role, {
  tab: string;
  eyebrow: string;
  title: string;
  steps: string[];
  cta: { href: string; label: string };
  secondary: { href: string; label: string };
  icon: typeof UserRound;
}> = {
  usuario: {
    tab: "Busco ayuda",
    eyebrow: "Si buscas ayuda",
    title: "Tu próximo paso en EE. UU., claro y en español.",
    steps: [
      "Responde unas preguntas cortas sobre tu situación.",
      "Recibe tu plan: qué hacer ahora y qué sigue.",
      "Conecta con un profesional con perfil aprobado cuando lo necesites.",
    ],
    cta: { href: "/onboarding", label: "Crear mi plan" },
    secondary: { href: "/profesionales", label: "Ver profesionales" },
    icon: UserRound,
  },
  profesional: {
    tab: "Soy profesional",
    eyebrow: "Si eres profesional",
    title: "Llega a personas que buscan lo que tú ofreces.",
    steps: [
      "Aplica con tus servicios, zona e idiomas.",
      "Revisamos tu perfil antes de publicarlo como perfil aprobado.",
      "Recibe solicitudes y lleva clientes, contenido y redes en un solo panel.",
    ],
    cta: { href: "/aplicar-profesional", label: "Aplicar como profesional" },
    secondary: { href: "/login", label: "Ya tengo cuenta" },
    icon: BriefcaseBusiness,
  },
};

const order: Role[] = ["usuario", "profesional"];

export default function RoleSplit() {
  const [active, setActive] = useState<Role>("usuario");

  return (
    <section id="como-funciona" aria-label="Elige tu camino en EVOLUSA" className="scroll-mt-20">
      {/* Mobile switch: one role at a time */}
      <div className="sticky top-24 z-20 bg-[var(--warm-canvas)] px-4 py-3 lg:hidden">
        <div role="tablist" aria-label="¿Qué buscas en EVOLUSA?" className="grid grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-[var(--border)]">
          {order.map((key) => {
            const selected = key === active;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`role-panel-${key}`}
                onClick={() => setActive(key)}
                className={cn(
                  "min-h-11 rounded-full text-sm font-bold transition",
                  selected
                    ? key === "usuario"
                      ? "bg-[var(--role-member)] text-white"
                      : "bg-[var(--role-pro)] text-white"
                    : "text-[var(--muted)]",
                )}
              >
                {roles[key].tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        {order.map((key) => {
          const role = roles[key];
          const Icon = role.icon;
          const isPro = key === "profesional";
          return (
            <div
              key={key}
              id={`role-panel-${key}`}
              role="tabpanel"
              className={cn(
                "px-6 py-12 sm:px-10 lg:block lg:px-14 lg:py-20 xl:px-20",
                active === key ? "block" : "hidden",
                isPro ? "bg-[var(--role-pro)] text-white" : "bg-[var(--role-member)] text-white",
              )}
            >
              <div className="mx-auto max-w-xl">
                <p className={cn("flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em]", "text-white/85")}>
                  <Icon aria-hidden size={18} />
                  {role.eyebrow}
                </p>
                <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">{role.title}</h2>
                <ol className="mt-8 space-y-4">
                  {role.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold", isPro ? "bg-white text-[var(--role-pro)]" : "bg-white text-[var(--role-member)]")}>
                        {index + 1}
                      </span>
                      <span className="pt-1 text-base font-semibold leading-6 sm:text-lg">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link
                    href={role.cta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center justify-center rounded-full px-7 text-base font-bold transition hover:-translate-y-0.5",
                      isPro ? "bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-strong)]" : "bg-white text-[var(--role-member-strong)] hover:bg-[var(--role-member-soft)]",
                    )}
                  >
                    {role.cta.label}
                    <ArrowRight aria-hidden className="ml-2" size={18} />
                  </Link>
                  <Link href={role.secondary.href} className="inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">
                    {role.secondary.label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
