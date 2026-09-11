import Image from "next/image";
import { Building2, CalendarClock, ExternalLink, Globe, MapPin, Users, Video } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import ButtonLink from "@/components/ui/ButtonLink";
import EvolusaIsotype from "@/components/brand/EvolusaIsotype";
import { getProfessionalCategory } from "@/data/professional/categories";
import { socialLinkPlatformLabels, socialLinkPlatforms, type ConsultationMode, type ProfessionalProfilePublic } from "@/data/professional/types";
import { cn } from "@/lib/cn";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import { safeHttpUrl, safeSocialLinks } from "@/lib/professional/links";

export type ProfessionalWorkSample = {
  title: string;
  image: string;
  description?: string;
};

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
export default function ProfessionalProfileView({
  professional,
  photoUrl,
  contactEmail,
  workSamples,
}: {
  professional: ProfessionalProfilePublic;
  /** Explicit override for professional.photoUrl — used by the temporary local-fixture preview route (app/profesionales/preview-mauricio) to show a photo without writing to Supabase. Every real caller should leave this unset and let professional.photoUrl (migration 0015) drive it. */
  photoUrl?: string;
  /** Real inbox to reach this professional. Without an Appointments system yet, "Agendar una consulta" opens a real email rather than a fabricated calendar widget. */
  contactEmail?: string;
  /** Real completed work samples, shown only when provided — never a placeholder gallery. No DB-backed source exists yet (see 0015's migration notes); only the local preview fixture populates this today. */
  workSamples?: readonly ProfessionalWorkSample[];
}) {
  const category = getProfessionalCategory(professional.category);
  const categoryLabel = category?.label ?? "Profesional EVOLUSA";
  const location = [professional.city, professional.state].filter(Boolean).join(", ");
  const languages = professional.languages.map((code) => languageLabels[code] ?? code.toUpperCase());
  const consultation = consultationCopy[professional.consultationMode];
  const mailtoHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Consulta a través de EVOLUSA — ${professional.displayName}`)}`
    : undefined;

  // photo_url (migration 0015) is owner-supplied, arbitrary-hostname text —
  // rendered with a plain <img>, never next/image, since next/image
  // requires each remote hostname to be allow-listed in
  // next.config.ts ahead of time and this field's hostnames are unbounded
  // per-professional. Same "validate at render, plain text at rest" posture
  // as booking_url; see lib/professional/links.ts#safeHttpUrl.
  const resolvedPhotoUrl = safeHttpUrl(photoUrl ?? professional.photoUrl);
  const portfolioHref = safeHttpUrl(professional.portfolioUrl);
  const websiteHref = safeHttpUrl(professional.websiteUrl);
  const socialLinks = safeSocialLinks(professional.socialLinks);
  const hasLinks = Boolean(portfolioHref || websiteHref || Object.keys(socialLinks).length > 0);

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative bg-[var(--brand-navy)] pb-16 pt-32 sm:pt-40">
        <Container className="relative">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <span
              aria-hidden
              className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 sm:size-28"
            >
              {resolvedPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external hostname, see resolvedPhotoUrl's comment above.
                <img src={resolvedPhotoUrl} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <EvolusaIsotype variant="reverse" size="app" />
              )}
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

              {mailtoHref && professional.isAcceptingClients && (
                <ButtonLink href={mailtoHref} className="mt-6">
                  <CalendarClock aria-hidden size={18} className="mr-2" />
                  Agendar una consulta
                </ButtonLink>
              )}
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

      {hasLinks && (
        <Section className="bg-[var(--surface-subtle)]" labelledBy="professional-links-title">
          <Heading id="professional-links-title" eyebrow="Más de este profesional">
            Enlaces
          </Heading>
          <div className="mt-5 flex flex-wrap gap-3">
            {portfolioHref && (
              <a
                href={portfolioHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
              >
                <ExternalLink aria-hidden size={16} />
                Portafolio
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
              >
                <Globe aria-hidden size={16} />
                Sitio web
              </a>
            )}
            {socialLinkPlatforms.map(
              (platform) =>
                socialLinks[platform] && (
                  <a
                    key={platform}
                    href={socialLinks[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                  >
                    <ExternalLink aria-hidden size={16} />
                    {socialLinkPlatformLabels[platform]}
                  </a>
                ),
            )}
          </div>
        </Section>
      )}

      {workSamples && workSamples.length > 0 && (
        <Section labelledBy="professional-portfolio-title">
          <Heading id="professional-portfolio-title" eyebrow="Trabajo reciente">
            Algunos proyectos de {professional.displayName}
          </Heading>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workSamples.map((sample) => (
              <div key={sample.title} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={sample.image} alt={sample.title} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-[var(--brand-navy)]">{sample.title}</p>
                  {sample.description && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{sample.description}</p>}
                </div>
              </div>
            ))}
          </div>
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
