import PlannerAlerts from "@/components/professional/PlannerAlerts";
import {professionalToday} from "@/lib/professional-planner/reminders";
import {getMyProfessionalBusiness} from "@/lib/professional-business/persistence";
import { weeklyPlannerSuggestions, pendingWeeklySuggestions } from "@/lib/professional-planner/weekly-review";
import { getMyProfessionalPlanner } from "@/lib/professional-planner/persistence";
import Link from "next/link";
import { ArrowRight, AtSign, Briefcase, CalendarDays, IdCard, ImageIcon, Rocket, Users } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import PreparedKitWelcome from "@/components/professional/PreparedKitWelcome";
import { getProfessionalCategory } from "@/data/professional/categories";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyRoutedOpportunitiesForProfessional } from "@/lib/opportunities/persistence";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";
import { getMyInstagramState } from "@/lib/social/connections";

/**
 * Home of the professional panel (PROFESSIONAL role). Applicants who are
 * still MEMBER use /dashboard/professional for their private draft. Only
 * real data from the professional's own rows, no projected followers, leads
 * or income.
 */
export default async function ProfessionalPanelPage() {
  await requireProfessionalArea();

  const [profile, opportunities, kit, instagram, business] = await Promise.all([getMyProfessionalProfile(), getMyRoutedOpportunitiesForProfessional(), getMyPreparedKit(), getMyInstagramState(), getMyProfessionalBusiness()]);
  const today = professionalToday();
  const planner = await getMyProfessionalPlanner(today);
  const weeklyPending = planner.available ? pendingWeeklySuggestions(weeklyPlannerSuggestions(profile?{...profile,business:business.business}:null,today),planner.planner.posts).length : 0;
  const waitingForContact = opportunities.filter((opportunity) => opportunity.effectiveStatus === "ROUTED").length;
  const categoryLabel = profile ? getProfessionalCategory(profile.category)?.label : undefined;

  const tools = [
    {href:"/profesionales/planes",title:"Servicios para mi negocio",description:"Marca, web, WhatsApp Business, Google, contenido y seguimiento según tu operación.",detail:"Ver alcances y solicitar cotización",icon:Rocket},
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
      title: "Clientes y seguimiento",
      description: "Tus contactos, conversaciones y seguimiento en un solo lugar.",
      detail: "Próxima acción y borrador por prospecto",
      icon: Users,
    },
    {
      href: "/panel-profesional/agenda",
      title: "Agenda",
      description: "Tus preferencias de disponibilidad y el enlace de reservas.",
      detail: "Configura tu horario",
      icon: CalendarDays,
    },
    ...[
          {
            href: "/panel-profesional/creativos",
            title: "Creativos",
            description: "Tus piezas por concepto y formato, listas para revisar y descargar.",
            detail: kit ? `${kit.creatives.concepts.length} conceptos · ${kit.creatives.formats.length} formatos` : "Propuestas de tu actividad",
            icon: ImageIcon,
          },
        ],
    {
      href: "/panel-profesional/planner",
      title: "Planner de publicaciones",
      description: "Tu calendario de contenido: qué publicas, cuándo y en qué red.",
      detail: kit ? "Propuesta lista con tus creativos" : "Planifica tu contenido",
      icon: CalendarDays,
    },
    {
      href: "/panel-profesional/redes",
      title: "Redes conectadas",
      description: "Conecta tu Instagram para que tu planner y tu CRM trabajen con tu cuenta.",
      detail: instagram.connection?.status === "ACTIVE" ? `Instagram: @${instagram.connection.username}` : "Sin redes conectadas",
      icon: AtSign,
    },
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

      {profile && business.available && !business.business && <section role="status" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6"><h2 className="font-bold">Personaliza el contenido para tu actividad</h2><p className="mt-2 text-sm">Completa el negocio, público, servicios y oferta. Tus propuestas usarán ese contexto.</p><Link href="/panel-profesional/perfil#mi-negocio" className="inline-flex min-h-11 items-center font-bold underline">Completar mi negocio</Link></section>}
      {weeklyPending > 0 && <section role="status" className="rounded-[var(--radius-lg)] border border-[var(--brand-blue)] bg-[var(--sky-surface)] p-6"><h2 className="font-bold">Tienes {weeklyPending} propuestas de contenido para esta semana</h2><p className="mt-2 text-sm">Revisa los textos, el carrusel y el guion para reel. No se publican al seleccionarlos.</p><Link href="/panel-profesional/planner?review=weekly#propuestas" className="mt-3 inline-flex min-h-11 items-center font-bold underline">Revisar propuestas en mi planner</Link></section>}
      <PlannerAlerts planner={planner} today={today} instagram={profile?.socialLinks.instagram} />
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
