import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Card from "@/components/ui/Card";
import ProfessionalsDirectory from "@/components/professionals/ProfessionalsDirectory";
import { getPublicProfessionals } from "@/lib/professional/public-profile";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Profesionales | ${brand.displayName}`,
  description: `Conoce a los profesionales aprobados de la red ${brand.displayName}.`,
};

/**
 * Public directory of approved professionals — the missing inbound link to
 * /profesionales/[slug] (previously reachable only by typing the exact URL,
 * per the launch-readiness audit's orphan-route finding). Reads the same
 * professional_profiles_public view as the profile page itself; no schema
 * change, no new query surface. Filtering by profession/stage lives in
 * ProfessionalsDirectory (client component) since the full list is already
 * small and fetched once — no server round-trip needed per filter change.
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
            <div className="mt-10">
              <ProfessionalsDirectory professionals={professionals} />
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
