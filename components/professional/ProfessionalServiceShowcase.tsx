import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileCheck2, Globe2, Handshake, LayoutDashboard, Megaphone, ShieldCheck, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import type { ProfessionalProfilePublic } from "@/data/professional/types";
import { safeHttpUrl, safeSocialLinks } from "@/lib/professional/links";

type Offering = { title: string; detail: string; icon: LucideIcon };
const offerings: Record<string, Offering[]> = {
  IMMIGRATION_DOCUMENT_SUPPORT: [
    { title: "Residencia y ajuste de estatus", detail: "Apoyo administrativo en formularios y organización documental.", icon: FileCheck2 },
    { title: "Asilo y documentación de apoyo", detail: "Preparación de documentos bajo instrucciones del solicitante.", icon: ShieldCheck },
    { title: "Ciudadanía y renovaciones", detail: "Preparación documental para formularios y solicitudes.", icon: BadgeCheck },
    { title: "Peticiones familiares", detail: "Organización de documentación de apoyo.", icon: Handshake },
  ],
  NOTARY: [
    { title: "Servicios notariales", detail: "Consulta los documentos y modalidades disponibles con el profesional.", icon: FileCheck2 },
    { title: "Atención y citas", detail: "Confirma cobertura, requisitos y horario directamente.", icon: BadgeCheck },
    { title: "Documentos y requisitos", detail: "Pregunta qué identificación y documentación debes presentar.", icon: ShieldCheck },
  ],
  BUSINESS_OPERATIONS: [
    { title: "Análisis financiero", detail: "Comprende resultados, presupuestos y desempeño financiero.", icon: Wallet },
    { title: "Flujo de caja y proyecciones", detail: "Organiza información para tomar decisiones de negocio.", icon: LayoutDashboard },
    { title: "Procesos y operaciones", detail: "Consulta apoyo para reportes y planificación.", icon: BriefcaseBusiness },
  ],
  BUSINESS_MARKETING: [
    { title: "Identidad de marca", detail: "Comunica tu oferta con una presencia visual profesional.", icon: Sparkles },
    { title: "Web y presencia digital", detail: "Presenta tus servicios y facilita que te encuentren.", icon: Globe2 },
    { title: "Marketing y seguimiento", detail: "Explora contenido, campañas y procesos comerciales.", icon: Megaphone },
  ],
};
export default function ProfessionalServiceShowcase({ professional, capturePilotEnabled = false }: { professional: ProfessionalProfilePublic; capturePilotEnabled?: boolean }) {
  const items = offerings[professional.category] ?? [];
  if (!items.length) return null;
  const social = safeSocialLinks(professional.socialLinks);
  const website = safeHttpUrl(professional.websiteUrl);
  const contact = professional.isAcceptingClients ? (social.whatsapp || website) : null;
  const canSubmitOpportunity = ["mauricio-yepes-b96cae", "jose-miguel-acosta-34c676", "1migration-b2bfe2", "marie-fernandez-efff0e"].includes(professional.slug);
  return (
    <section aria-labelledby="professional-showcase" className="bg-[var(--surface-subtle)] py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[var(--brand-blue)]">Descubre lo que puede ofrecerte</p>
            <h2 id="professional-showcase" className="max-w-2xl text-3xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-4xl">Soluciones para tu próximo paso</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Explora áreas de servicio y consulta directamente el alcance, los costos y la disponibilidad.</p>
          </div>
          {contact && <a href={contact} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-bold text-white">Consultar servicios <ArrowRight size={17} aria-hidden /></a>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return <article key={item.title} className="group relative flex min-h-[255px] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div aria-hidden className={index % 2 === 0 ? "absolute -right-8 -top-8 size-40 rounded-full bg-[var(--sky-surface)]" : "absolute -right-8 -top-8 size-40 rounded-full bg-slate-100"} />
              <div className="relative mb-8 flex size-16 items-center justify-center rounded-2xl bg-[var(--brand-navy)] text-white"><Icon aria-hidden size={30} strokeWidth={1.6}/></div>
              <h3 className="relative text-lg font-bold leading-6 text-[var(--brand-navy)]">{item.title}</h3>
              <p className="relative mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
              <div className="relative mt-auto pt-5 text-sm font-bold text-[var(--brand-blue)]">{contact ? "Preguntar por este servicio" : "Conocer especialidad"} <ArrowRight aria-hidden className="inline" size={15}/></div>
              {contact && <a href={contact} target="_blank" rel="noopener noreferrer" aria-label={`Consultar ${item.title} con ${professional.displayName}`} className="absolute inset-0 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)]" />}
            </article>;
          })}
        </div>
        {capturePilotEnabled && professional.isAcceptingClients && canSubmitOpportunity && <div className="mt-7 rounded-2xl border border-[var(--border)] bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><h3 className="font-bold text-[var(--brand-navy)]">¿Quieres registrar una solicitud en EvolUSA?</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Inicia sesión, describe tu necesidad y autoriza compartir tus datos solo con este profesional. Piloto restringido, sin notificaciones automáticas.</p></div>
          <Link href={`/conexiones/solicitar/${professional.slug}`} className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white sm:mt-0">Registrar solicitud <ArrowRight aria-hidden size={16}/></Link>
        </div>}
        {professional.category === "IMMIGRATION_DOCUMENT_SUPPORT" && <p className="mt-6 text-sm leading-6 text-[var(--muted)]">Se ofrece únicamente apoyo de preparación documental; no constituye asesoría legal ni representación ante autoridades migratorias.</p>}
      </div>
    </section>
  );
}
