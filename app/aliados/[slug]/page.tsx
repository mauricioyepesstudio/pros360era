import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookOpen, Compass, Map as MapIcon, Users } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Card from "@/components/ui/Card";
import ButtonLink from "@/components/ui/ButtonLink";
import PartnerRefCapture from "@/components/partners/PartnerRefCapture";
import { partners } from "@/data/partners";
import { disclaimers } from "@/data/compliance/claims";
import { journeyStages } from "@/data/journey/stages";
import { getPartner } from "@/lib/partners/ref";
import { brand } from "@/config/brand";

/**
 * Página de aliado (co-marca). Explica lo que EVOLUSA ofrece gratis a los
 * miembros y guarda la atribución del aliado (cookie propia, 30 días) para
 * pasarla como metadato al crear la cuenta. Nunca presenta ni vende el
 * servicio del aliado: si es de categoría regulada, se muestra el aviso
 * `partner-regulated-services` de data/compliance/claims.ts. Sin pagos ni
 * comisiones por referido.
 */

type PartnerPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return partners.map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartner(slug);
  if (!partner) return {};
  return {
    title: `Recomendado por ${partner.name}`,
    description: `${partner.name} te recomienda ${brand.displayName}: tu Journey de 6 etapas y tu Roadmap, gratis y en español.`,
    robots: { index: false },
  };
}

const partnerNotice = disclaimers.find((item) => item.id === "partner-regulated-services");

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { slug } = await params;
  const partner = getPartner(slug);
  if (!partner) notFound();

  const signupHref = `/signup?ref=${encodeURIComponent(partner.slug)}`;
  const offers = [
    { icon: Compass, title: "Journey de 6 etapas", body: journeyStages.map((stage) => stage.shortLabel).join(" · ") },
    { icon: MapIcon, title: "Tu Roadmap personalizado", body: "Respondes unas preguntas y ves tu próximo paso, con fuentes oficiales cuando aplican." },
    { icon: BookOpen, title: "Guías prácticas", body: "Guías en español para organizar tu día a día y tu negocio." },
    { icon: Users, title: "Profesionales aprobados", body: "En categorías permitidas (hoy marketing y operaciones de negocio en Florida). La verificación de identidad, cuando existe, se indica en cada perfil." },
  ];

  return (
    <>
      <Suspense fallback={null}><PartnerRefCapture slug={partner.slug} /></Suspense>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="partner-title">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Recomendado por {partner.name}</p>
          </div>
          <div className="mt-6">
            <Heading as="h1" id="partner-title">Tu próximo paso en Estados Unidos, gratis y en español</Heading>
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {partner.name} te invita a {brand.displayName}: una guía para organizar tu llegada, tu vida y tu negocio, paso a paso.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupHref}>Crear mi cuenta gratis</ButtonLink>
            <ButtonLink href="/onboarding" variant="secondary">Empezar mi diagnóstico</ButtonLink>
          </div>

          <h2 className="mt-16 text-2xl font-bold text-[var(--brand-navy)]">Lo que {brand.displayName} te ofrece sin costo</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {offers.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <div className="flex items-start gap-4">
                  <Icon aria-hidden className="mt-1 flex-none text-[var(--brand-blue)]" size={24} />
                  <div>
                    <h3 className="font-bold text-[var(--brand-navy)]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {partner.regulated && partnerNotice ? (
            <aside aria-labelledby="partner-notice-title" className="mt-12 max-w-3xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--sky-surface)] p-6">
              <h2 id="partner-notice-title" className="font-bold text-[var(--brand-navy)]">{partnerNotice.short}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{partnerNotice.full}</p>
              {partner.serviceNotice ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{partner.serviceNotice}</p> : null}
              {partner.website || partner.whatsapp ? (
                <p className="mt-3 text-sm">
                  Para trámites con {partner.name}:{" "}
                  {partner.website ? <a className="font-bold text-[var(--brand-blue)] underline" href={partner.website} rel="noopener noreferrer" target="_blank">sitio web</a> : null}
                  {partner.website && partner.whatsapp ? " · " : null}
                  {partner.whatsapp ? <a className="font-bold text-[var(--brand-blue)] underline" href={partner.whatsapp} rel="noopener noreferrer" target="_blank">WhatsApp</a> : null}
                </p>
              ) : null}
            </aside>
          ) : null}
        </Section>
      </main>
      <Footer />
    </>
  );
}
