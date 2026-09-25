"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, ShieldCheck, Briefcase, TrendingUp, Award } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import ButtonLink from "@/components/ui/ButtonLink";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Aplica a EVOLUSA",
    description: "Cuéntanos quién eres, qué servicios ofreces y en qué etapas ayudas. Sin comisiones ocultas ni sorpresas.",
  },
  {
    number: 2,
    icon: ShieldCheck,
    title: "Sé verificado",
    description: "Pasas verificación real de identidad. Tu credibilidad no se compra — se gana. Los clientes lo ven en tu perfil.",
  },
  {
    number: 3,
    icon: Briefcase,
    title: "Completa tu perfil",
    description: "Añade tu foto, bio, idiomas, rates, disponibilidad, social links y trabajos previos. Tu vitrina completa.",
  },
  {
    number: 4,
    icon: TrendingUp,
    title: "Recibe oportunidades relevantes",
    description: "Usuarios en tu etapa, en tu estado, que hablan tu idioma y necesitan exactamente lo que ofreces llegan a ti.",
  },
  {
    number: 5,
    icon: Briefcase,
    title: "Cotiza y gestiona clientes",
    description: "Chat directo con el cliente. Compartir documentos. Agendar citas. Todo sin intermediarios ni comisiones.",
  },
  {
    number: 6,
    icon: Award,
    title: "Construye tu reputación",
    description: "Clientes satisfechos califican tu trabajo. Más éxito = más oportunidades. Tu red crece con tu credibilidad.",
  },
];

export default function ProfessionalJourneyFlow() {
  return (
    <Section id="professional-journey" labelledBy="professional-journey-title">
      <Heading id="professional-journey-title" eyebrow="Para profesionales">
        Cómo construyes tu práctica en EVOLUSA
      </Heading>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        EVOLUSA no es una agencia. Eres propietario de tu relación con cada cliente. Clientes verificados llegan a ti porque coinciden con tu especialidad y ubicación — no porque pagaron más por aparecer primero.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-[var(--brand-coral)]/10 px-3 py-1 text-sm font-bold text-[var(--brand-coral)]">
                    Paso {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[var(--brand-navy)]">{step.title}</h3>
                </div>
                <Icon aria-hidden className="shrink-0 text-[var(--brand-blue)]" size={24} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--brand-coral)]/30 bg-[var(--brand-coral)]/5 p-8">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-bold text-[var(--brand-navy)]">¿Por qué profesionales eligen EVOLUSA?</h3>
          <ul className="mt-6 space-y-3">
            <li className="flex gap-3">
              <ArrowRight aria-hidden className="shrink-0 text-[var(--brand-coral)]" size={20} />
              <span className="text-base text-[var(--muted)]">
                <strong>Clientes calificados:</strong> No leads fríos. Llegan sabiendo qué necesitan.
              </span>
            </li>
            <li className="flex gap-3">
              <ArrowRight aria-hidden className="shrink-0 text-[var(--brand-coral)]" size={20} />
              <span className="text-base text-[var(--muted)]">
                <strong>Sin comisiones variables:</strong> Tú defines tus rates. Sin porcentajes ocultos.
              </span>
            </li>
            <li className="flex gap-3">
              <ArrowRight aria-hidden className="shrink-0 text-[var(--brand-coral)]" size={20} />
              <span className="text-base text-[var(--muted)]">
                <strong>Confianza verificada:</strong> Tu identidad real, no una reputación comprada. Clientes lo ven.
              </span>
            </li>
            <li className="flex gap-3">
              <ArrowRight aria-hidden className="shrink-0 text-[var(--brand-coral)]" size={20} />
              <span className="text-base text-[var(--muted)]">
                <strong>Eres dueño:</strong> De tu perfil, tus clientes, tu relación. EVOLUSA es la plataforma, no el intermediario.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <ButtonLink href="/aplicar-profesional" className="sm:px-8">
          Aplicar ahora
          <ArrowRight aria-hidden className="ml-2" size={18} />
        </ButtonLink>
        <ButtonLink href="/profesionales" className="sm:px-8" title="Ver profesionales en la red">
          Ver la red
          <ArrowRight aria-hidden className="ml-2" size={18} />
        </ButtonLink>
      </div>
    </Section>
  );
}
