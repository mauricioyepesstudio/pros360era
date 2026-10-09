import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, IdCard, ImageIcon, Rocket, Users } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import PreparedKitWelcome from "@/components/professional/PreparedKitWelcome";
import { getProfessionalCategory } from "@/data/professional/categories";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyRoutedOpportunitiesForProfessional } from "@/lib/opportunities/persistence";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";

/**
 * Home of the professional panel (PROFESSIONAL role). Applicants who are
 * still MEMBER use /dashboard/professional for their private draft. Only
 * real data from the professional's own rows, no projected followers, leads
 * or income.
 */
export default async function ProfessionalPanelPage() {
  await requireProfessionalArea();

  const [profile, opportunities, kit] = await Promise.all([getMyProfessionalProfile(), getMyRoutedOpportunitiesForProfessional(), getMyPreparedKit()]);
  const waitingForContact = opportunities.filter((opportunity) => opportunity.effectiveStatus === "ROUTED").length;
  const categoryLabel = profile ? getProfessionalCategory(profile.category)?.label : undefined;

  const tools = [
    {
      href: "/panel-profesional/oportunidades",
      title: "Oportunidades",
      description: "Miembros de EVOLUSA emparejados contigo, con la información que autorizaron compartir.",
      detail: opportunities.length === 0 ? "Sin oportunidades por ahora" : `${waitingForContact} por contactar de ${opportunities.length}`,
      icon: Briefcase,
    },
    {
      href: "/panel-profesional/perfil",
      title: "Mi perfil profesional",
      description: "Tu foto, descripción, idiomas, enlaces y si estás aceptando clientes.",
      detail: profile ? (profile.isApproved ? "Perfil aprobado" : "Perfil en revisión") : "Perfil pendiente",
      icon: IdCard,
    },
    {
      href: "/crm",
      title: "Clientes",
      description: "Tus contactos, conversaciones y seguimiento en un solo lugar.",
      detail: "Herramienta de gestión",
      icon: Users,
    },
    {
      href: "/panel-profesional/agenda",
      title: "Agenda",
      description: "Tus preferencias de disponibilidad y el enlace de reservas.",
      detail: "Configura tu horario",
      icon: CalendarDays,
    },
    ...(kit
      ? [
          {
            href: "/panel-profesional/creativos",
            title: "Creativos",
            description: "Tus piezas por concepto y formato, listas para revisar y descargar.",
            detail: `${kit.creatives.concepts.length} conceptos · ${kit.creatives.formats.length} formatos`,
            icon: ImageIcon,
          },
        ]
      : []),
    {
      href: "/growth-automation",
      title: "Crecimiento",
      description: "Conexión de redes y automatizaciones aún no disponibles.",
      detail: "En preparación",
      icon: Rocket,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title={profile ? `Hola, ${profile.displayName}` : "Tu panel profesional"}
        description="Aquí gestionas tu presencia en EVOLUSA y las personas que te contactan. Los miembros no ven este panel."
      />

      {kit ? <PreparedKitWelcome kit={kit} hasPhoto={Boolean(profile?.photoUrl)} /> : null}

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">Estado de tu perfil</h2>
        {profile ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={profile.isApproved ? "rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700" : "rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700"}>
              {profile.isApproved ? "Perfil aprobado" : "Perfil en revisión"}
            </span>
            <span className="rounded-full bg-[var(--sky-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-navy)]">
              {profile.isAcceptingClients ? "Aceptando clientes" : "No está aceptando clientes"}
            </span>
            {categoryLabel ? <span className="text-sm text-[var(--muted)]">{categoryLabel}</span> : null}
          </div>
        ) : (
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Todavía no encontramos tu perfil profesional. Si ya aplicaste, lo estamos revisando; si crees que es un error, contáctanos.
          </p>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {tools.map(({ href, title, description, detail, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--brand-blue)]">
            <div className="flex items-start gap-4">
              <span className="rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-3 text-[var(--brand-blue)]">
                <Icon aria-hidden size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[var(--brand-navy)]">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">{detail}</p>
              </div>
              <ArrowRight aria-hidden size={18} className="mt-1 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--brand-blue)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
