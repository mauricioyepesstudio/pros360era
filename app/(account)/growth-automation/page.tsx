import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, MessageSquare, ShieldCheck, Users, Workflow } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import { getCurrentProfile } from "@/lib/account/persistence";
import { getService } from "@/data/services/services";

/**
 * Professional automation hub. Existing tools remain authoritative:
 * this page never promises posting, messaging or billing that has not been connected.
 */
const existingTools = [
  {
    title: "Contactos y seguimiento",
    description: "Organiza contactos, conversaciones y próximos pasos desde tu CRM/ARM.",
    href: "/crm",
    cta: "Abrir mis clientes",
    icon: Users,
  },
  {
    title: "Oportunidades de EVOLUSA",
    description: "Consulta solicitudes asignadas a tu perfil profesional y gestiona su respuesta.",
    href: "/panel-profesional/oportunidades",
    cta: "Ver oportunidades",
    icon: MessageSquare,
  },
  {
    title: "Calendario de contenido",
    description: "Prepara contenido y revisa lo que tienes programado antes de publicar.",
    href: "/panel-profesional/planner",
    cta: "Abrir planner",
    icon: CalendarDays,
  },
  {
    title: "Conexiones",
    description: "Revisa las cuentas conectadas y los permisos disponibles para cada canal.",
    href: "/growth-automation/connect",
    cta: "Ver conexiones",
    icon: Workflow,
  },
] as const;

const proposedServices = [
  ["Captura inteligente", "Conectar formularios, campañas y canales autorizados a una bandeja comercial."],
  ["Seguimiento personalizado", "Avisar sobre solicitudes pendientes, responsables y próximas acciones."],
  ["Reportes de conversión", "Medir consultas, cotizaciones y clientes cerrados con datos registrados."],
] as const;

export default async function GrowthAutomationPage() {
  const profile = await getCurrentProfile();
  const service = getService("growth-automation");
  if (!profile || !service) {
    return (
      <PageHeader
        eyebrow="Servicios profesionales"
        title="Servicio no disponible"
        description="No podemos mostrar la automatización de crecimiento en esta sesión."
      />
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="EVOLUSA · Oficina digital"
        title="Automatiza tu crecimiento"
        description="Herramientas de tu perfil profesional y servicios adicionales que podremos configurar según tus necesidades."
      />

      <section className="rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-7 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ff9aa3]">Una oficina, una sola información</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Cada contacto necesita una próxima acción.</h2>
        <p className="mt-5 max-w-2xl leading-7 text-white/85">
          EVOLUSA reúne tus herramientas para organizar solicitudes, revisar tu actividad y mantener el seguimiento.
          La captación desde fuentes externas y los mensajes automáticos requieren una conexión y autorización específicas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/crm" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-6 font-bold text-white transition hover:bg-[#a90016]">
            Abrir mi CRM <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/panel-profesional" className="inline-flex min-h-12 items-center rounded-full border border-white/70 px-6 font-bold text-white transition hover:bg-white/10">Mi panel profesional</Link>
        </div>
      </section>

      <section aria-labelledby="current-tools-heading">
        <div className="flex items-center gap-3"><CheckCircle2 className="text-[var(--brand-red)]" aria-hidden="true" /><h2 id="current-tools-heading" className="text-2xl font-bold text-[var(--brand-navy)]">Herramientas de tu panel</h2></div>
        <p className="mt-3 text-[var(--muted)]">Enlaces a funciones existentes. Su disponibilidad depende de tu perfil, permisos y conexiones.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {existingTools.map(({title,description,href,cta,icon:Icon})=>(
            <article key={href} className="rounded-xl border border-[var(--border)] bg-white p-6">
              <Icon size={26} className="text-[var(--brand-red)]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold text-[var(--brand-navy)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              <Link href={href} className="mt-5 inline-flex min-h-10 items-center gap-2 font-bold text-[var(--brand-red-strong)] hover:underline">{cta}<ArrowRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="additional-services-heading" className="rounded-xl border border-[var(--border)] bg-[#f7f9fc] p-7 sm:p-9">
        <div className="flex items-center gap-3"><BarChart3 className="text-[var(--brand-red)]" aria-hidden="true" /><h2 id="additional-services-heading" className="text-2xl font-bold text-[var(--brand-navy)]">Automatizaciones adicionales</h2></div>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">Servicios que se pueden configurar para cada negocio; <strong>no están activados automáticamente</strong> al registrarte. Requieren revisión de alcance, consentimiento para las conexiones y propuesta de precio por separado.</p>
        <ul className="mt-7 grid gap-5 md:grid-cols-3">
          {proposedServices.map(([title,description])=><li key={title} className="border-t-2 border-[var(--brand-navy)] pt-4"><h3 className="font-bold text-[var(--brand-navy)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p></li>)}
        </ul>
        <p className="mt-7 flex items-start gap-2 text-sm leading-6 text-[var(--muted)]"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--brand-navy)]" size={18} aria-hidden="true" />Tus datos y contactos son privados de tu cuenta. Una automatización contratada no comparte clientes con otros profesionales ni con otras empresas.</p>
      </section>

      <p className="text-sm leading-6 text-[var(--muted)]">El piloto de profesionales existentes no genera cobros automáticos nuevos. Publicidad, WhatsApp Business y consumo de herramientas externas se cotizan por separado. No garantizamos un número de clientes ni ingresos.</p>
    </div>
  );
}
