import { BadgeCheck, Landmark, Network } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { trustPrinciples } from "@/data/home/sections";
import { disclaimers } from "@/data/compliance/claims";

const icons = [BadgeCheck, Network, Landmark];

const trustLabels = [
  { label: "Fuente oficial", detail: "Información basada en recursos gubernamentales o públicos verificables." },
  { label: "Guía EVOLUSA", detail: "Orientación educativa directa de EVOLUSA, sin promesas de resultado." },
  { label: "Profesional", detail: "Conexión con un proveedor o profesional licenciado cuando corresponde." },
] as const;

/**
 * A confidence system, not another three-column info block: a compact
 * source-legend strip up top, and the trust principles presented as one
 * horizontal bar (divided, not boxed) beneath it.
 */
export default function TrustAndTransparency() {
  const regulated = disclaimers.find((item) => item.id === "regulated-services")!;
  return (
    <Section id="trust" labelledBy="trust-title" className="bg-[var(--surface-subtle)]">
      <Heading id="trust-title" eyebrow="Confianza y transparencia">Siempre sabes de dónde viene cada recomendación</Heading>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        EVOLUSA no es una agencia gubernamental ni sustituye asesoría profesional individualizada.
      </p>

      <div className="mt-8 flex flex-wrap gap-3" aria-label="Cómo identificamos cada recomendación">
        {trustLabels.map((item) => (
          <div key={item.label} className="group relative">
            <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-navy)]">
              {item.label}
            </span>
            <p className="mt-2 max-w-[16rem] text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)] sm:flex-row sm:divide-x sm:divide-y-0">
        {trustPrinciples.map((principle, index) => {
          const Icon = icons[index];
          return (
            <div key={principle.title} className="flex items-start gap-3 py-5 sm:flex-1 sm:px-6 sm:py-6 first:sm:pl-0">
              <Icon aria-hidden className="mt-0.5 shrink-0 text-[var(--brand-blue)]" size={20} />
              <div>
                <h3 className="text-sm font-bold text-[var(--brand-navy)]">{principle.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{principle.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-5 text-[var(--muted)]">{regulated.full}</p>
    </Section>
  );
}
