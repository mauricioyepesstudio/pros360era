import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Landmark, Stamp } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import { getPublicProfessionalsBySlugs } from "@/lib/professional/public-profile";

export const metadata: Metadata = {
  title: "Servicios profesionales en Miami | EVOLUSA",
  description:
    "Conoce opciones de apoyo documental, notaría, finanzas y marketing en Miami. Revisa la disponibilidad y el perfil de cada profesional en EVOLUSA.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Encuentra profesionales en Miami | EVOLUSA",
    description: "Notaría bilingüe, marketing y branding, finanzas de negocios y apoyo documental. Conoce los perfiles y contacta directamente cuando estén disponibles.",
    url: "https://www.evolusa.us/servicios-miami",
    siteName: "EVOLUSA",
    type: "website",
  },
};

const featured = [
  {
    sector: "immigration",
    slug: "1migration-b2bfe2",
    fallbackName: "1MIGRATION",
    label: "Apoyo documental migratorio",
    description: "Preparación y organización de documentos. No incluye asesoría ni representación legal.",
    icon: FileText,
  },
  {
    sector: "notary",
    slug: "marie-fernandez-efff0e",
    fallbackName: "Marie Fernandez",
    label: "Servicios notariales",
    description: "Notaría en Florida: conoce servicios declarados, idiomas y modalidad de atención.",
    icon: Stamp,
  },
  {
    sector: "finance",
    slug: "jose-miguel-acosta-34c676",
    fallbackName: "José Miguel Acosta",
    label: "Análisis financiero y operaciones",
    description: "Apoyo para entender los números y organizar decisiones empresariales.",
    icon: Landmark,
  },
  {
    sector: "marketing",
    slug: "mauricio-yepes-b96cae",
    fallbackName: "Mauricio Yepes Lotero",
    label: "Marketing, branding y digital",
    description: "Diseño, identidad de marca, presencia web y marketing para empresas.",
    icon: BriefcaseBusiness,
  },
] as const;

/** Public profiles and live availability are the source of truth; never invent bookings. */
export default async function ServiciosMiamiPage() {
  const profiles = await getPublicProfessionalsBySlugs(featured.map((f) => f.slug));

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white pt-32 text-[var(--brand-navy)] sm:pt-40">
        <section className="mx-auto max-w-[1150px] px-5 pb-16">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-red)]">EVOLUSA · Miami y South Florida</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Tu próxima decisión merece al profesional adecuado.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            ¿Necesitas un notario en Florida, mejorar la presencia digital de tu negocio,
            organizar tus finanzas o preparar documentación? Explora perfiles reales, compara sus servicios
            y contacta al profesional que mejor se ajuste a tu necesidad.
          </p>
          <Link href="/profesionales" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-6 font-bold text-white hover:bg-[#a90016]">
            Ver directorio completo <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className="bg-[var(--surface-subtle)] py-16" aria-labelledby="services-title">
          <div className="mx-auto max-w-[1150px] px-5">
            <h2 id="services-title" className="text-3xl font-bold sm:text-4xl">Cuatro áreas para avanzar.</h2>
            <p className="mt-4 max-w-2xl text-[var(--muted)]">Conoce el perfil antes de comunicarte. La disponibilidad es individual y puede cambiar.</p>
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {featured.map(({ sector, slug, fallbackName, label, description, icon: Icon }) => {
                const profile = profiles.get(slug);
                // A preview environment may not have Supabase read access. Show an
                // explicitly unverified public-profile link instead of an empty page.
                const active = profile?.isAcceptingClients === true;
                return (
                  <article key={slug} id={`sector-${sector}`} className="flex scroll-mt-28 flex-col rounded-xl border border-[var(--border)] bg-white p-7">
                    <div className="flex items-start justify-between gap-3">
                      <Icon size={30} className="text-[var(--brand-red)]" aria-hidden="true"/>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-[#e7f6ec] text-[#1d6b3a]" : "bg-[#f0f1f3] text-[#515968]"}`}>
                        {!profile ? "Disponibilidad por confirmar" : active ? "Acepta clientes" : "No recibe nuevos clientes ahora"}
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[var(--brand-red)]">{label}</p>
                    <h3 className="mt-2 text-2xl font-bold">{profile?.displayName ?? fallbackName}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{profile?.headline || description}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
                    <div className="mt-auto pt-7">
                      <Link href={`/profesionales/${encodeURIComponent(slug)}?utm_source=evolusa&utm_medium=organic&utm_campaign=miami-services`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--brand-navy)] px-5 font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white">
                        {active ? "Ver perfil y contacto" : "Ver perfil y disponibilidad"} <ArrowRight size={17} aria-hidden="true"/>
                      </Link>
                      {active && slug === "marie-fernandez-efff0e" && profile?.socialLinks.whatsapp?.startsWith("https://wa.me/") ? (
                        <a
                          href={profile.socialLinks.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Escribir por WhatsApp a Marie Fernandez"
                          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-5 font-bold text-white hover:bg-[#a90016]"
                        >
                          Solicitar cita notarial <ArrowRight size={17} aria-hidden="true"/>
                        </a>
                      ) : null}
                      {active && slug === "mauricio-yepes-b96cae" && profile?.websiteUrl?.startsWith("https://") ? (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Visitar la web profesional de Mauricio Yepes"
                          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-5 font-bold text-white hover:bg-[#a90016]"
                        >
                          Cotizar marketing y diseño <ArrowRight size={17} aria-hidden="true"/>
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              EVOLUSA no garantiza disponibilidad, resultados ni número de clientes. Los servicios de apoyo documental no sustituyen asesoría migratoria o legal de un profesional autorizado.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1150px] px-5 py-16">
          <h2 className="text-3xl font-bold">¿Eres profesional y quieres unirte?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Presenta tu experiencia y solicita participar en el directorio profesional de EVOLUSA.</p>
          <Link href="/aplicar-profesional" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 font-bold text-white">Aplicar como profesional <ArrowRight size={18} aria-hidden="true"/></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
