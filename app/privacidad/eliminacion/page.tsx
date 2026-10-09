import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import { findDeletionRequestDate } from "@/lib/social/connections";

export const metadata: Metadata = {
  title: "Estado de eliminación de datos | EVOLUSA",
  robots: { index: false },
};

/**
 * Status page Meta links to after a data-deletion request. The code is
 * random and only confirms that the deletion ran; it reveals no account data.
 */
export default async function EliminacionPage({ searchParams }: { searchParams: Promise<{ codigo?: string | string[] }> }) {
  const raw = (await searchParams).codigo;
  const code = typeof raw === "string" && /^[a-f0-9]{24}$/.test(raw) ? raw : null;
  const deletedAt = code ? await findDeletionRequestDate(code) : null;

  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="eliminacion-title">
          <Heading as="h1" id="eliminacion-title" eyebrow="Privacidad">
            Eliminación de datos de Instagram
          </Heading>
          <div className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {deletedAt && code ? (
              <p>
                Listo. El {new Date(deletedAt).toLocaleDateString("es-US", { day: "numeric", month: "long", year: "numeric" })} borramos los datos de Instagram asociados a esta solicitud (código <strong className="text-[var(--brand-navy)]">{code}</strong>).
              </p>
            ) : (
              <p>No encontramos una solicitud con ese código. Revisa el enlace que te mostró Instagram o escríbenos.</p>
            )}
            <p className="mt-4">
              Más detalles en la <Link href="/privacidad" className="font-semibold text-[var(--brand-blue)] underline">política de privacidad</Link>.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
