import { Building2, MapPin, Users, Video } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import ButtonLink from "@/components/ui/ButtonLink";
import EvolusaIsotype from "@/components/brand/EvolusaIsotype";
import { getProfessionalCategory } from "@/data/professional/categories";
import type { ConsultationMode, ProfessionalProfilePublic } from "@/data/professional/types";
import { cn } from "@/lib/cn";
import VerifiedBadge from "@/components/professional/VerifiedBadge";

// Presentation-only mapping of stored language codes to Spanish display
// labels — not a business-logic catalog (doesn't gate anything), so it
// stays local rather than becoming a new data/ module for one field.
const languageLabels: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
  fr: "Francés",
};

const consultationCopy: Record<ConsultationMode, { title: string; description: string }> = {
  VIRTUAL: { title: "Consulta virtual", description: "Disponible para consulta virtual." },
  IN_PERSON: { title: "Consulta presencial", description: "Disponible para consulta presencial." },
  BOTH: { title: "Virtual y presencial", description: "Ofrece opciones de consulta virtual y presencial." },
};

/**
 * The public EVOLUSA professional trust profile's rendered content — pulled
 * out of app/profesionales/[slug]/page.tsx so the exact same markup can be
 * exercised with a local fixture during visual QA without ever querying the
 * live database (see the temporary QA route used for Milestone 02, deleted
 * before this milestone was reported complete).
 */
export default function ProfessionalProfileView({ professional }: { professional: ProfessionalProfilePublic }) {
  const category = getProfessionalCategory(professional.category);
  const categoryLabel = category?.label ?? "Profesional EVOLUSA";
  const location = [professional.city, professional.state].filter(Boolean).join(", ");
  const languages = professional.languages.map((code) => languageLabels[code] ?? code.toUpperCase());
  const consultation = consultationCopy[professional.consultationMode];

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative bg-[var(--brand-navy)] pb-16 pt-32 sm:pt-40">
        <Container className="relative">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <span
              aria-hidden
              className="flex size-24 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 sm:size-28"
            >
              <EvolusaIsotype variant="reverse" size="app" />
            </span>
            <div className="text-white">
              <div className="flex flex-wrap items-start gap-2">
                <span className="inline-flex rounded-[var(--radius-pill)] bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-blue-on-dark)]">
                  {categoryLabel}
                </span>
                <VerifiedBadge verified={professional.identityVerified} />
              </div>
              <h1 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-5xl">{professional.displayName}</h1>
              {professional.headline && <p className="mt-3 max-w-xl text-lg leading-7 text-white/80">{professional.headline}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden size={16} />
                    {location}
                  </span>
                )}
                {languages.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users aria-hidden size={16} />
                    {languages.join(" · ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  {professional.consultationMode === "IN_PERSON" ? <Building2 aria-hidden size={16} /> : <Video aria-hidden size={16} />}
                  {consultation.title}
                </span>
              </div>

              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full", professional.isAcceptingClients ? "bg-[var(--success)]" : "bg-white/30")}
                />
                {professional.isAcceptingClients ? "Aceptando nuevos clientes" : "No está aceptando nuevos clientes por ahora"}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {professional.bio && (
        <Section labelledBy="professional-about-title">
          <Heading id="professional-about-title" eyebrow="Sobre este profesional">
            Acerca de {professional.displayName}
          </Heading>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{professional.bio}</p>
        </Section>
      )}

      <Section className="bg-[var(--surface-subtle)]" labelledBy="professional-work-title">
        <Heading id="professional-work-title" eyebrow="Cómo puede ayudarte">
          Cómo trabaja con clientes
        </Heading>
        <div className="mt-6 max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          <p className="text-lg font-bold text-[var(--brand-navy)]">{consultation.title}</p>
          <p className="mt-2 leading-6 text-[var(--muted)]">{consultation.description}</p>
        </div>
      </Section>

      <Section labelledBy="professional-trust-title">
        <Heading id="professional-trust-title" eyebrow="Confianza EVOLUSA">
          Cómo forma parte de la red EVOLUSA
        </Heading>
        <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">
          Este perfil es parte de la base de la red de profesionales de EVOLUSA. El alcance de los servicios depende de la categoría
          profesional indicada arriba. EVOLUSA no inventa credenciales ni certificaciones: las insignias de verificación regulada
          aparecerán únicamente cuando EVOLUSA Verified esté disponible.
        </p>
      </Section>

      <Section className="bg-[var(--brand-navy)]">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-balance text-2xl font-bold text-white sm:text-3xl">¿Quieres seguir explorando tu camino?</p>
          <p className="mt-3 leading-7 text-white/70">Tu Roadmap te ayuda a identificar el próximo paso adecuado para ti.</p>
          <ButtonLink href="/roadmap" className="mt-6">
            Volver al Roadmap
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
