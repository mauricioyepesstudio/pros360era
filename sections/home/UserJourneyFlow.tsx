"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, CheckCircle2, MessageSquare, Star } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import ButtonLink from "@/components/ui/ButtonLink";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Identifica tu necesidad",
    description: "Selecciona tu etapa en Estados Unidos y responde preguntas que te ayudan a entender dónde estás.",
  },
  {
    number: 2,
    icon: ArrowRight,
    title: "Recibe orientación clara",
    description: "Tu roadmap personal con acciones ahora, esta semana y próximamente. Totalmente a tu ritmo.",
  },
  {
    number: 3,
    icon: Search,
    title: "Encuentra profesionales verificados",
    description: "Explora nuestro directorio. Cada profesional ha pasado verificación real — no comprada.",
  },
  {
    number: 4,
    icon: MessageSquare,
    title: "Envía solicitud o pide cotización",
    description: "Conecta directamente con el profesional. Él verá tu información autorizada y podrá cotizar.",
  },
  {
    number: 5,
    icon: CheckCircle2,
    title: "Gestiona tu servicio",
    description: "Chat, documentos compartidos, citas. Todo en un lugar. Profesional te acompaña hasta completar.",
  },
  {
    number: 6,
    icon: Star,
    title: "Finaliza y califica",
    description: "Marca como completado. Califica al profesional. Descubre tu próximo paso en el roadmap.",
  },
];

export default function UserJourneyFlow() {
  return (
    <Section id="user-journey" labelledBy="user-journey-title" className="bg-[var(--surface-subtle)]">
      <Heading id="user-journey-title" eyebrow="Para usuarios">
        Tu camino desde la incertidumbre a acciones claras
      </Heading>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        En EVOLUSA no reinventas la rueda. Tú defines dónde estás, nosotros te mostramos el siguiente paso, y conectamos contigo con profesionales verificados que ya ayudaron a otros en tu misma etapa.
      </p>

      <div className="mt-16 space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:gap-8 sm:p-8"
            >
              <div className="shrink-0">
                <div className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-blue)]/10">
                  <Icon aria-hidden className="text-[var(--brand-blue)]" size={28} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-bold text-[var(--brand-blue)]">Paso {step.number}</span>
                  <h3 className="text-xl font-bold text-[var(--brand-navy)]">{step.title}</h3>
                </div>
                <p className="mt-2 text-base leading-6 text-[var(--muted)]">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <ButtonLink href="/onboarding" className="sm:px-8">
          Comenzar mi camino
          <ArrowRight aria-hidden className="ml-2" size={18} />
        </ButtonLink>
        <ButtonLink href="/profesionales" className="sm:px-8" title="Ver profesionales disponibles">
          Ver profesionales
          <ArrowRight aria-hidden className="ml-2" size={18} />
        </ButtonLink>
      </div>
    </Section>
  );
}
