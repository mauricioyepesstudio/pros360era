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
  title: `Cómo aparecer en Google gratis: 5 pasos | ${brand.displayName}`,
  description:
    "Guía en español para que tu negocio aparezca en Google Search y Maps con un Business Profile gratis: crear, verificar, completar, fotos y reseñas.",
  openGraph: {
    title: "Cómo aparecer en Google gratis: 5 pasos",
    description: "Guía en español con enlaces a las fuentes oficiales.",
    images: ["/social/guia-google-negocio/slide-1.jpg"],
  },
};

/**
 * Educational guide (organic-content hub). Facts taken from Google's own
 * Business Profile pages linked next to each step, checked 2026-09-26.
 * Operational / educational guidance only — see data/compliance/claims.ts
 * "roadmap-guidance"; no ranking or outcome promises.
 */
const steps = [
  {
    title: "Crea tu perfil gratis (o reclama el que ya existe)",
    body: "Crear un Business Profile en Google es gratis. Entra a business.google.com, busca tu negocio: si ya aparece en Maps, reclámalo; si no, créalo con el nombre exacto que usas con tus clientes.",
    source: { label: "Google — Business Profile", href: "https://business.google.com/us/business-profile/" },
  },
  {
    title: "Verifica que el negocio es tuyo",
    body: "Google te pide verificar antes de mostrar tus cambios. Según el caso, puede ser con un video corto que muestre tu negocio o con una postal con código enviada a tu dirección.",
    source: { label: "Google — Verifica tu negocio", href: "https://support.google.com/business/answer/7107242?hl=es" },
  },
  {
    title: "Completa toda la información",
    body: "Elige la categoría que mejor describe lo que haces, y agrega horario, teléfono, sitio web y el área donde das servicio. Un perfil incompleto le da menos razones a un cliente para llamarte.",
    source: { label: "Google — Ayuda de Business Profile", href: "https://support.google.com/business/?hl=es" },
  },
  {
    title: "Sube fotos reales de tu trabajo",
    body: "Fotos del local, del equipo y de trabajos terminados. Que sean tuyas y recientes: muestran que el negocio existe y cómo trabajas.",
    source: { label: "Google — Ayuda de Business Profile", href: "https://support.google.com/business/?hl=es" },
  },
  {
    title: "Pide reseñas reales y respóndelas todas",
    body: "Pídele a tus clientes satisfechos que dejen una reseña y responde a cada una, también a las negativas, con respeto. Nunca compres reseñas ni ofrezcas algo a cambio de ellas.",
    source: { label: "Google — Ayuda de Business Profile", href: "https://support.google.com/business/?hl=es" },
  },
] as const;

export default function GuiaAparecerEnGooglePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="guia-title">
          <Heading as="h1" id="guia-title" eyebrow="Guía · Crece">
            Cómo aparecer en Google gratis: 5 pasos
          </Heading>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Cómo lograr que tu negocio aparezca en Google Search y Maps sin pagar, en español y con el enlace a la ayuda oficial de Google.
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
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">¿Quieres ayuda con tu presencia en Google?</h2>
            <p className="mt-2 leading-7 text-[var(--muted)]">
              EVOLUSA te conecta con un profesional de marketing aprobado en tu ciudad que puede ayudarte a configurar y
              mantener tu perfil.
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
            de seguros. Google puede cambiar sus pasos y requisitos: confirma siempre en su ayuda oficial. Aparecer en Google no garantiza
            ventas ni una posición específica en los resultados. Revisado el 26 de
            septiembre de 2026.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
