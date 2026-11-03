import PlannerAlerts from "@/components/professional/PlannerAlerts";
import {professionalToday} from "@/lib/professional-planner/reminders";
import {getMyProfessionalBusiness} from "@/lib/professional-business/persistence";
import { weeklyPlannerSuggestions, pendingWeeklySuggestions } from "@/lib/professional-planner/weekly-review";
import { getMyProfessionalPlanner } from "@/lib/professional-planner/persistence";
import Link from "next/link";
import { ArrowRight, AtSign, Briefcase, CalendarDays, IdCard, ImageIcon, Users } from "lucide-react";
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
    {
      href: "/panel-profesional/oportunidades",
      title: "Oportunidades",
      description: "Miembros de EVOLUSA emparejados contigo, con la información que autorizaron compartir.",
      detail: opportunities.length === 0 ? "Sin oportunidades por ahora" : `${waitingForContact} por contactar de ${opportunities.length}`,
      icon: Briefcase,
    },
    {
      href: "/panel-profesional/perfil",
      title: "Mi perfil",
      description: "Tu foto, descripción, idiomas, enlaces y si estás aceptando clientes.",
      detail: profile ? (profile.isApproved ? "Perfil aprobado" : "Perfil en revisión") : "Perfil pendiente",
      icon: IdCard,
    },
    {
      href: "/crm",
      title: "Clientes",
      description: "Tus contactos, conversaciones y seguimiento en un solo lugar.",
      detail: "Contactos y conversaciones",
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
      title: "Planner",
      description: "Tu calendario de contenido: qué publicas, cuándo y en qué red.",
      detail: kit ? "Propuesta lista con tus creativos" : "Planifica tu contenido",
      icon: CalendarDays,
    },
    {
      href: "/panel-profesional/redes",
      title: "Redes",
      description: "Conecta tu Instagram para que tu planner y tu CRM trabajen con tu cuenta.",
      detail: instagram.connection?.status === "ACTIVE" ? `Instagram: @${instagram.connection.username}` : "Sin redes conectadas",
      icon: AtSign,
    },
  ];

  // Un solo "siguiente paso" en dorado: lo más importante que falta hacer.
  // Los avisos sueltos de antes (negocio sin completar, propuestas de la
  // semana) se convierten en este bloque en lugar de apilarse.
  const igActive = instagram.connection?.status === "ACTIVE";
  const nextStep = !profile
    ? { title: "Termina tu aplicación", body: "Todavía no encontramos tu perfil profesional. Si ya aplicaste, lo estamos revisando.", href: "/aplicar-profesional", cta: "Ver mi aplicación" }
    : waitingForContact > 0
      ? { title: `Tienes ${waitingForContact} ${waitingForContact === 1 ? "persona" : "personas"} por contactar`, body: "Miembros emparejados contigo que autorizaron compartir su información.", href: "/panel-profesional/oportunidades", cta: "Contactar ahora" }
      : business.available && !business.business
        ? { title: "Completa tu negocio", body: "Público, servicios y oferta. Tus propuestas de contenido usarán ese contexto.", href: "/panel-profesional/perfil#mi-negocio", cta: "Completar mi negocio" }
        : weeklyPending > 0
          ? { title: `Revisa ${weeklyPending} propuestas de contenido`, body: "Textos, carrusel y guion para reel de esta semana. No se publican al seleccionarlos.", href: "/panel-profesional/planner?review=weekly#propuestas", cta: "Revisar propuestas" }
          : !igActive
            ? { title: "Conecta tu Instagram", body: "Así tu planner publica y tu CRM recibe comentarios y mensajes.", href: "/panel-profesional/redes", cta: "Conectar Instagram" }
            : { title: "Planifica tu contenido de la semana", body: "Tu calendario: qué publicas, cuándo y en qué red.", href: "/panel-profesional/planner", cta: "Abrir planner" };

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          eyebrow="Panel profesional"
          title={profile ? `Hola, ${profile.displayName}` : "Tu panel profesional"}
          description="Tu negocio en EVOLUSA. Los miembros no ven este panel."
        />
        {profile ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={profile.isApproved ? "rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700" : "rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700"}>
              {profile.isApproved ? "Perfil aprobado" : "Perfil en revisión"}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[var(--brand-navy)] ring-1 ring-[var(--border)]">
              {profile.isAcceptingClients ? "Aceptando clientes" : "No está aceptando clientes"}
            </span>
            {categoryLabel ? <span className="text-sm text-[var(--muted)]">{categoryLabel}</span> : null}
          </div>
        ) : null}
      </div>

      <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] bg-[var(--role-pro)] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Tu siguiente paso</p>
          <h2 className="mt-2 text-2xl font-extrabold">{nextStep.title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/85">{nextStep.body}</p>
        </div>
        <Link href={nextStep.href} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 font-bold text-white hover:bg-[var(--brand-navy-strong)]">
          {nextStep.cta}<ArrowRight aria-hidden className="ml-2" size={18} />
        </Link>
      </section>

      <PlannerAlerts planner={planner} today={today} instagram={profile?.socialLinks.instagram} />
      {kit ? <PreparedKitWelcome kit={kit} hasPhoto={Boolean(profile?.photoUrl)} /> : null}

      <section aria-labelledby="herramientas">
        <h2 id="herramientas" className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Tus herramientas</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tools.map(({ href, title, detail, icon: Icon }) => (
            <Link key={href} href={href} className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 transition hover:border-[var(--role-pro-strong)] sm:p-5">
              <span className="w-fit rounded-[var(--radius-md)] bg-[var(--role-pro-soft)] p-2.5 text-[var(--role-pro-strong)]">
                <Icon aria-hidden size={20} />
              </span>
              <h3 className="mt-3 font-bold text-[var(--brand-navy)]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)] sm:text-sm">{detail}</p>
            </Link>
          ))}
        </div>
        <Link href="/profesionales/planes" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--brand-navy)] underline underline-offset-4">
          ¿Necesitas marca, web o Google para tu negocio? Ver servicios
        </Link>
      </section>
    </div>
  );
}
