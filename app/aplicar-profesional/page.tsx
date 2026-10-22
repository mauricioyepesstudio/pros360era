import Link from "next/link";
import { CalendarDays, IdCard, ImageIcon, Rocket, ShieldCheck, Sparkles, Users } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import ProfessionalApplicationForm from "@/components/professional-applications/ProfessionalApplicationForm";
import { professionalApplicationsAcceptingSubmissions } from "@/data/professional-applications/categories";
import { brand } from "@/config/brand";

/**
 * Lo que el profesional viene a buscar, solo con herramientas que existen
 * hoy en el panel profesional (planner, CRM, creativos, perfil y agenda).
 * Sin precios, cifras ni resultados prometidos.
 */
const tools = [
  {
    icon: CalendarDays,
    title: "Marketing automatizado",
    body: "Planner de publicaciones: decides qué publicas y cuándo. Con tu Instagram y tu Facebook conectados, lo que marcas «Listo para publicar» sale solo a su hora.",
  },
  {
    icon: Users,
    title: "CRM de clientes",
    body: "Tus contactos, conversaciones y seguimientos en un solo lugar.",
  },
  {
    icon: ImageIcon,
    title: "Estudio creativo",
    body: "Cuando preparamos tu kit, tus piezas quedan organizadas por concepto y formato, listas para revisar y descargar.",
  },
  {
    icon: IdCard,
    title: "Perfil profesional y agenda",
    body: "Tu perfil público con foto, descripción, idiomas y enlaces, y tu enlace de reservas para que te agenden.",
  },
];

const pillars = [
  {
    icon: Rocket,
    title: "Solicitudes de miembros que necesitan tu servicio",
    body: "En categorías permitidas, te llegan miembros que ya pasaron por un perfil de necesidad, elegibilidad y ubicación.",
  },
  {
    icon: ShieldCheck,
    title: "Confianza real, no comprada",
    body: "En EVOLUSA la confianza nunca se vende: nadie paga por aparecer primero.",
  },
];

export default function AplicarProfesionalPage() {
  return (
    <main className="min-h-screen bg-[var(--warm-canvas)] pb-24">
      <div className="border-b border-[var(--border)] bg-[var(--brand-navy)] py-16 text-white">
        <Container>
          <Link href="/">
            <BrandMark theme="dark" size="md" />
          </Link>
          <div className="mt-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-on-dark)]">Para profesionales</p>
            <h1 className="mt-3 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">Herramientas para hacer crecer tu práctica profesional, en español.</h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-slate-200">
              Marketing automatizado, CRM, estudio creativo y tu perfil profesional en un solo panel. Y cuando un miembro de EVOLUSA necesita tu servicio en una categoría permitida, te llega su solicitud.
            </p>
          </div>
        </Container>
      </div>

      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <Heading as="h2" eyebrow="Lo que encuentras">
              Tu panel profesional
            </Heading>
            <div className="mt-8 space-y-6">
              {tools.map((tool) => (
                <div key={tool.title} className="flex gap-4">
                  <tool.icon aria-hidden className="mt-1 flex-none text-[var(--brand-blue)]" size={26} />
                  <div>
                    <h3 className="font-bold text-[var(--brand-navy)]">{tool.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{tool.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-12 text-xl font-bold text-[var(--brand-navy)]">Además: clientes que te buscan</h2>
            <p className="mt-4 max-w-lg leading-7 text-[var(--muted)]">
              No te prometemos resultados garantizados — te prometemos un sistema honesto: tú apareces cuando de verdad puedes ayudar, y solo pagas por la conexión cuando ya es real.
            </p>

            <div className="mt-8 space-y-6">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-4">
                  <pillar.icon aria-hidden className="mt-1 flex-none text-[var(--brand-blue)]" size={26} />
                  <div>
                    <h3 className="font-bold text-[var(--brand-navy)]">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-2 text-[var(--brand-coral)]">
                <Sparkles aria-hidden size={18} />
                <p className="text-xs font-bold uppercase tracking-wider">Todavía en construcción</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Somos honestos: estamos en una etapa temprana. Hoy invitamos a profesionales de Marketing y Operaciones de Negocio en Florida. Si ofreces otro servicio de negocio, cuéntanos y te ubicamos en la categoría correcta.
              </p>
            </div>
          </div>

          <div>
            {professionalApplicationsAcceptingSubmissions ? (
              <ProfessionalApplicationForm />
            ) : (
              <Card className="max-w-xl">
                <h2 className="text-xl font-bold text-[var(--brand-navy)]">Estamos abriendo esto por partes</h2>
                <p className="mt-3 leading-6 text-[var(--muted)]">
                  El formulario de aplicación todavía no está conectado. Para no perder tu interés, escríbenos directamente y te contactamos con los siguientes pasos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={brand.contact.whatsappLink}>{brand.cta.whatsapp}</ButtonLink>
                  <ButtonLink href={brand.contact.phoneHref} variant="secondary">
                    Llamar
                  </ButtonLink>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
