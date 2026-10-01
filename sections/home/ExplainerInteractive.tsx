"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Compass,
  FileText,
  MessageSquare,
  Search,
  Send,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";

type Audience = "usuario" | "profesional";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
};

type Track = {
  tab: string;
  intro: string;
  steps: Step[];
  note: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

// Copy rules: no promised figures or outcomes, and "aprobado" (never "verificado")
// for professionals. See data/compliance/claims.ts.
const tracks: Record<Audience, Track> = {
  usuario: {
    tab: "Busco asesoría",
    intro: "Así te acompaña EVOLUSA desde que llegas hasta que encuentras al profesional indicado.",
    steps: [
      {
        icon: Compass,
        title: "Cuéntanos dónde estás",
        description: "Elige tu etapa en EE. UU. y responde unas preguntas cortas.",
        detail: "No necesitas saber qué trámite buscar. Con tus respuestas entendemos tu situación y lo que más te urge.",
      },
      {
        icon: ClipboardList,
        title: "Recibe tu próximo paso",
        description: "Un roadmap con acciones para ahora y para después.",
        detail: "Tu plan se ordena por prioridad y en español. Avanzas a tu ritmo y vuelves cuando quieras.",
      },
      {
        icon: Search,
        title: "Explora profesionales aprobados",
        description: "Perfiles revisados antes de publicarse.",
        detail: "Filtra por lo que necesitas, tu zona y tu idioma. Ningún pago cambia el orden en que aparecen.",
      },
      {
        icon: Send,
        title: "Envía tu solicitud",
        description: "Compartes solo la información que tú autorizas.",
        detail: "El profesional revisa tu caso y te responde con su propuesta. Tú decides si sigues adelante.",
      },
      {
        icon: MessageSquare,
        title: "Avanza acompañado",
        description: "Mensajes, documentos y citas en un solo lugar.",
        detail: "Cuando terminas, calificas el servicio y tu roadmap te muestra el siguiente paso.",
      },
    ],
    note: "EVOLUSA te orienta y te conecta. No es un bufete, una agencia de inmigración ni una firma contable.",
    primary: { href: "/onboarding", label: "Empezar mi roadmap" },
    secondary: { href: "/profesionales", label: "Ver profesionales" },
  },
  profesional: {
    tab: "Soy profesional",
    intro: "Así llegas a personas que buscan exactamente lo que ofreces, sin pagar por aparecer primero.",
    steps: [
      {
        icon: UserRound,
        title: "Aplica",
        description: "Cuéntanos quién eres y qué servicios ofreces.",
        detail: "Indica tus servicios, idiomas, zona y en qué etapas del camino ayudas a las personas.",
      },
      {
        icon: BadgeCheck,
        title: "Revisamos tu perfil",
        description: "Revisamos tu información antes de publicarla.",
        detail: "Cuando se aprueba, tu perfil aparece en el directorio como perfil aprobado.",
      },
      {
        icon: FileText,
        title: "Completa tu vitrina",
        description: "Foto, bio, servicios, disponibilidad y redes.",
        detail: "Un perfil completo ayuda a que las personas entiendan cómo trabajas antes de escribirte.",
      },
      {
        icon: Search,
        title: "Recibe solicitudes relevantes",
        description: "Personas que buscan lo que ofreces, en tu zona y tu idioma.",
        detail: "El orden del directorio no se compra. Las solicitudes llegan según tu especialidad y ubicación.",
      },
      {
        icon: Star,
        title: "Atiende y construye reputación",
        description: "Respondes, cotizas y acompañas a cada cliente.",
        detail: "La relación con el cliente es tuya. Las calificaciones reflejan tu trabajo real.",
      },
    ],
    note: "Por ahora EVOLUSA recibe profesionales en Florida.",
    primary: { href: "/aplicar-profesional", label: "Aplicar como profesional" },
    secondary: { href: "/profesionales", label: "Ver el directorio" },
  },
};

const audiences: Audience[] = ["usuario", "profesional"];

export default function ExplainerInteractive() {
  const baseId = useId();
  const [audience, setAudience] = useState<Audience>("usuario");
  const [active, setActive] = useState(0);

  const track = tracks[audience];
  const step = track.steps[active];
  const isLast = active === track.steps.length - 1;
  const StepIcon = step.icon;

  function selectAudience(next: Audience) {
    setAudience(next);
    setActive(0);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = audience === "usuario" ? "profesional" : "usuario";
    selectAudience(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <Section id="como-funciona" labelledBy="como-funciona-title" className="bg-[var(--surface-subtle)]">
      <Heading id="como-funciona-title" eyebrow="Cómo funciona">
        ¿Cómo te ayuda EVOLUSA?
      </Heading>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Elige lo que buscas y recorre el camino paso a paso.
      </p>

      <div role="tablist" aria-label="¿Qué buscas en EVOLUSA?" className="mt-10 inline-flex rounded-full border border-[var(--border)] bg-white p-1">
        {audiences.map((key) => {
          const selected = key === audience;
          return (
            <button
              key={key}
              id={`${baseId}-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectAudience(key)}
              onKeyDown={onTabKeyDown}
              className={cn(
                "min-h-11 rounded-full px-5 text-sm font-semibold transition sm:px-6 sm:text-base",
                selected ? "bg-[var(--brand-navy)] text-white" : "text-[var(--brand-navy)] hover:bg-[var(--surface-subtle)]",
              )}
            >
              {tracks[key].tab}
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${audience}`} className="mt-8">
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">{track.intro}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ol className="space-y-2">
            {track.steps.map((item, index) => {
              const current = index === active;
              const done = index < active;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition",
                      current
                        ? "border-[var(--brand-blue)] bg-white shadow-sm"
                        : "border-transparent hover:border-[var(--border)] hover:bg-white/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        current
                          ? "bg-[var(--brand-navy)] text-white"
                          : done
                            ? "bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]"
                            : "bg-white text-[var(--muted)] ring-1 ring-[var(--border)]",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-[var(--brand-navy)]">{item.title}</span>
                      <span className="block text-sm leading-6 text-[var(--muted)]">{item.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${audience}-${active}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <StepIcon aria-hidden className="text-[var(--brand-blue)]" size={28} />
                  <span className="text-sm font-semibold text-[var(--brand-blue)]">
                    Paso {active + 1} de {track.steps.length}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-[var(--brand-navy)]">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">{step.detail}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--brand-blue)] transition-all duration-300"
                style={{ width: `${((active + 1) / track.steps.length) * 100}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActive((value) => Math.max(0, value - 1))}
                disabled={active === 0}
                className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--surface-subtle)] disabled:opacity-40"
              >
                <ArrowLeft aria-hidden className="mr-2" size={16} />
                Anterior
              </button>
              {isLast ? (
                <>
                  <ButtonLink href={track.primary.href} variant="primary">
                    {track.primary.label}
                    <ArrowRight aria-hidden className="ml-2" size={16} />
                  </ButtonLink>
                  <ButtonLink href={track.secondary.href} variant="secondary">
                    {track.secondary.label}
                  </ButtonLink>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive((value) => Math.min(track.steps.length - 1, value + 1))}
                  className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-navy)] px-5 font-semibold text-white transition hover:opacity-90"
                >
                  Siguiente
                  <ArrowRight aria-hidden className="ml-2" size={16} />
                </button>
              )}
            </div>

            <p className="mt-6 text-sm leading-6 text-[var(--muted)]">{track.note}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
