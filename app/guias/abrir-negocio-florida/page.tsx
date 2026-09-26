import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Card from "@/components/ui/Card";
import ButtonLink from "@/components/ui/ButtonLink";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Cómo abrir tu negocio en Florida: 5 pasos | ${brand.displayName}`,
  description:
    "Guía en español para registrar tu LLC en Florida: nombre, Sunbiz, EIN, licencia local en Miami-Dade, cuenta bancaria y reporte anual. Con enlaces a las fuentes oficiales.",
  openGraph: {
    title: "Cómo abrir tu negocio en Florida: 5 pasos",
    description: "Guía en español con enlaces a las fuentes oficiales.",
    images: ["/social/guia-negocio-florida/slide-1.jpg"],
  },
};

/**
 * Educational guide (organic-content hub). Every figure is taken from the
 * official source linked next to it, checked 2026-09-26. Operational /
 * educational guidance only — see data/compliance/claims.ts
 * "roadmap-guidance"; no legal, tax or immigration advice.
 */
const steps = [
  {
    title: "Elige el nombre y confirma que esté disponible",
    body: "Antes de registrar nada, busca el nombre en la base de datos de la División de Corporaciones de Florida (Sunbiz). Si ya existe un negocio con un nombre igual o muy parecido, tendrás que elegir otro.",
    source: { label: "Sunbiz — Búsqueda de nombres", href: "https://dos.fl.gov/sunbiz/search/" },
  },
  {
    title: "Registra tu LLC en Sunbiz",
    body: "Se presentan los Articles of Organization en línea. El pago mínimo es $125: $100 de la presentación más $25 por la designación del agente registrado. La copia certificada ($30) es opcional.",
    source: { label: "Florida Department of State — Tarifas LLC", href: "https://dos.fl.gov/sunbiz/forms/fees/llc-fees/" },
  },
  {
    title: "Solicita tu EIN directamente en IRS.gov",
    body: "El EIN es el número de identificación de tu negocio ante el IRS. Lo necesitas para abrir la cuenta bancaria y contratar. Solicítalo solo en el sitio oficial del IRS.",
    source: { label: "IRS — Employer Identification Number", href: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
  },
  {
    title: "Saca tu licencia local (Local Business Tax Receipt)",
    body: "En Miami-Dade se requiere un Local Business Tax Receipt por cada lugar de negocio. Si tu negocio está dentro de una ciudad, como Miami, necesitas el de la ciudad y también el del condado.",
    source: { label: "Miami-Dade Tax Collector", href: "https://mdctaxcollector.gov/services/local-business-tax-receipt" },
  },
  {
    title: "Separa las finanzas y no olvides el reporte anual",
    body: "Abre una cuenta bancaria a nombre del negocio y no mezcles gastos personales. Cada año la LLC presenta su reporte anual en Sunbiz: cuesta $138.75 si lo presentas entre el 1 de enero y el 1 de mayo. Después de esa fecha hay recargo.",
    source: { label: "Sunbiz — Reporte anual LLC", href: "https://efile.sunbiz.org/llc_ar_help.html" },
  },
] as const;

export default function GuiaAbrirNegocioFloridaPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="guia-title">
          <Heading as="h1" id="guia-title" eyebrow="Guía · Emprende">
            Cómo abrir tu negocio en Florida: 5 pasos
          </Heading>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            El camino básico para registrar una LLC en Florida, en español y con el enlace a la fuente oficial de cada dato.
          </p>

          <ol className="mt-12 grid max-w-3xl gap-5">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:gap-5">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-navy)] text-lg font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--brand-navy)]">{step.title}</h2>
                    <p className="mt-2 leading-7 text-[var(--muted)]">{step.body}</p>
                    <a
                      href={step.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-[var(--brand-blue)] underline underline-offset-4"
                    >
                      Fuente: {step.source.label}
                    </a>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          <Card className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">¿Y después de registrarte?</h2>
            <p className="mt-2 leading-7 text-[var(--muted)]">
              Si necesitas ayuda con el marketing o la operación de tu negocio, EVOLUSA te conecta con un profesional aprobado
              en tu ciudad.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/onboarding">Encontrar mi próximo paso</ButtonLink>
              <Link href="/profesionales" className="self-center text-sm font-semibold text-[var(--brand-blue)] underline underline-offset-4">
                Ver profesionales
              </Link>
            </div>
          </Card>

          <p className="mt-10 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Esta guía ofrece orientación operacional y educativa; no constituye asesoría legal, migratoria, fiscal, financiera ni
            de seguros. Las tarifas y requisitos pueden cambiar: confirma siempre en la fuente oficial. Revisado el 26 de
            septiembre de 2026.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
