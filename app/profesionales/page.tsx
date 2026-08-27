import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Card from "@/components/ui/Card";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import { getPublicProfessionals } from "@/lib/professional/public-profile";
import { getProfessionalCategory } from "@/data/professional/categories";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Profesionales | ${brand.displayName}`,
  description: `Conoce a los profesionales aprobados de la red ${brand.displayName}.`,
};

const languageLabels: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
  fr: "Francés",
};

/**
 * Public directory of approved professionals — the missing inbound link to
 * /profesionales/[slug] (previously reachable only by typing the exact URL,
 * per the launch-readiness audit's orphan-route finding). Reads the same
 * professional_profiles_public view as the profile page itself; no schema
 * change, no new query surface.
 */
export default async function ProfessionalesPage() {
  const professionals = await getPublicProfessionals();

  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="professionals-directory-title">
          <Heading id="professionals-directory-title" eyebrow="Red de profesionales">
            Profesionales de EVOLUSA
          </Heading>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Profesionales aprobados por EVOLUSA, listos para ayudarte según tu etapa. La verificación de identidad, cuando existe,
            se indica explícitamente en cada perfil.
          </p>

          {professionals.length === 0 ? (
            <Card className="mt-10 max-w-xl">
              <p className="text-[var(--muted)]">
                Todavía no hay profesionales públicos disponibles. Vuelve pronto — la red está creciendo.
              </p>
            </Card>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {professionals.map((professional) => {
                const category = getProfessionalCategory(professional.category);
                const location = [professional.city, professional.state].filter(Boolean).join(", ");
                const languages = professional.languages.map((code) => languageLabels[code] ?? code.toUpperCase());

                return (
                  <Link key={professional.slug} href={`/profesionales/${professional.slug}`} className="group block h-full">
                    <Card className="flex h-full flex-col transition group-hover:border-[var(--brand-blue)] group-hover:shadow-[var(--shadow-md)]">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--sky-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-navy)]">
                          {category?.label ?? "Profesional EVOLUSA"}
                        </span>
                        <VerifiedBadge verified={professional.identityVerified} />
                      </div>
                      <h2 className="mt-4 text-xl font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-blue)]">
                        {professional.displayName}
                      </h2>
                      {professional.headline && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{professional.headline}</p>}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                        {location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin aria-hidden size={14} />
                            {location}
                          </span>
                        )}
                        {languages.length > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <Users aria-hidden size={14} />
                            {languages.join(" · ")}
                          </span>
                        )}
                      </div>
                      {!professional.isAcceptingClients && (
                        <p className="mt-4 text-xs font-semibold text-[var(--muted)]">No está aceptando nuevos clientes por ahora</p>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
