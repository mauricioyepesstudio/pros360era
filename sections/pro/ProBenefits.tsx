"use client";

import { BarChart3, CalendarDays, Inbox, MessageSquareQuote, UserRoundCheck, Users } from "lucide-react";
import BenefitCard from "@/components/evolusa/BenefitCard";
import { useAccountRole } from "@/components/layout/useAccountRole";

/**
 * What a profesional gets, one card per benefit (owner, 13-nov). Only tools
 * the professional panel has today. No promised number of clients; paying
 * never changes ranking or approval; "perfil aprobado", never "verificado".
 * Content published from a pro's accounts carries their own brand, never
 * EVOLUSA's (owner rule, 7-nov).
 */
const rowLine = "flex items-center justify-between gap-3 border-b border-[var(--border)] py-2.5 text-[13px]";
const pill = "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold";

const benefits = [
  {
    icon: Inbox,
    title: "Solicitudes de tu nicho",
    body: "Personas que buscan lo que tú haces. Llegan con lo que necesitan, su zona y su idioma.",
    panel: "/panel-profesional/oportunidades",
    preview: (
      <div className="border-t-2 border-[var(--brand-navy)]">
        <div className={rowLine}><span className="truncate">Ordenar documentos · Doral</span><span className={`${pill} bg-[var(--brand-red-strong)] text-white`}>Nueva</span></div>
        <div className={rowLine}><span className="truncate">Organizar mi negocio · Kendall</span><span className={`${pill} bg-[var(--brand-navy)] text-white`}>Respondida</span></div>
      </div>
    ),
  },
  {
    icon: UserRoundCheck,
    title: "Tu perfil profesional",
    body: "Una página con tus servicios, tu zona y tus idiomas. La revisamos antes de publicarla como perfil aprobado.",
    panel: "/panel-profesional/perfil",
    preview: (
      <div className="flex items-center gap-3 border-t-2 border-[var(--brand-navy)] pt-3">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--brand-navy)] text-sm font-extrabold text-white">TN</span>
        <span className="min-w-0 text-[13px]"><span className="block truncate font-bold">Tu nombre · Tu servicio</span><span className="text-[var(--muted)]">Miami-Dade · Español e inglés</span></span>
        <span className={`${pill} ml-auto bg-[#e7f6ec] text-[#1d6b3a]`}>Perfil aprobado</span>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Tu CRM de clientes",
    body: "Cada contacto y en qué va. Los comentarios y mensajes de tus redes entran como prospectos.",
    panel: "/crm",
    preview: (
      <div className="grid grid-cols-3 gap-3 border-t-2 border-[var(--brand-navy)] pt-3 text-[13px]">
        {([["Nuevo", ["Ana R.", "Luis P."]], ["En curso", ["Carla M."]], ["Cliente", ["José T."]]] as const).map(([col, names]) => (
          <div key={col}>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{col}</p>
            {names.map((n) => <p key={n} className="border-b border-[var(--border)] py-1">{n}</p>)}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: CalendarDays,
    title: "Tus redes, planeadas y publicadas",
    body: "Planeamos tu semana y, con tus cuentas conectadas, tus publicaciones salen en Instagram, Facebook y LinkedIn.",
    panel: "/panel-profesional/planner",
    preview: (
      <div className="grid grid-cols-5 gap-2 border-t-2 border-[var(--brand-navy)] pt-3 text-center text-[11px] font-semibold">
        {[["Lun", "ig"], ["Mar", "li"], ["Mié", ""], ["Jue", "fb"], ["Vie", "ig"]].map(([d, k]) => (
          <div key={d}>{d}<span className={`mt-1.5 block h-9 rounded-md ${k === "ig" ? "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" : k === "li" ? "bg-[#0a66c2]" : k === "fb" ? "bg-[#1877f2]" : "bg-[var(--border)]"}`} /></div>
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquareQuote,
    title: "Contenido con tu voz y tu marca",
    body: "Defines tu tono, tus palabras y tu llamado a la acción. Lo que sale en tus cuentas habla de tu negocio, no de EVOLUSA.",
    panel: "/panel-profesional/perfil",
    preview: (
      <div className="flex flex-wrap gap-2 border-t-2 border-[var(--brand-navy)] pt-3 text-[12px] font-semibold">
        {["Cercano", "Español primero", "Palabras que sí usas", "Tu llamado a la acción"].map((t) => (
          <span key={t} className="rounded-full bg-[var(--role-pro-soft)] px-3 py-1 text-[var(--role-pro)]">{t}</span>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Tus números en el CRM",
    body: "Leads totales, leads del mes y conversaciones abiertas, en un vistazo.",
    panel: "/crm",
    preview: (
      <div className="border-t-2 border-[var(--brand-navy)] pt-3">
        <div className="flex h-16 items-end gap-2">
          {[30, 42, 38, 58, 66, 84].map((h, i) => <span key={i} className={`flex-1 rounded-t ${i > 3 ? "bg-[var(--brand-red)]" : "bg-[var(--brand-navy)]"}`} style={{ height: `${h}%` }} />)}
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Ejemplo ilustrativo, no son datos reales.</p>
      </div>
    ),
  },
] as const;

export default function ProBenefits() {
  const { role } = useAccountRole();
  const inside = role === "PROFESSIONAL" || role === "ADMIN";
  return (
    <section id="lo-que-recibes" aria-labelledby="kit-title" className="scroll-mt-24 bg-[var(--role-pro-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-red-strong)]">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />{inside ? "Tu panel profesional" : "Lo que recibes al registrarte"}
        </p>
        <h2 id="kit-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">
          {inside ? "Todo esto ya es tuyo." : "Tu oficina digital, completa."}
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg text-slate-600">
          {inside ? "Cada tarjeta te lleva directo a esa parte de tu panel." : "Seis herramientas que hoy buscarías por separado, en un solo panel y pensadas para atender a la comunidad hispana."}
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon, title, body, panel, preview }) => (
            <BenefitCard key={title} tone="pro" icon={icon} title={title} body={body} preview={preview} link={inside ? { href: panel, label: "Abrir en mi panel" } : undefined} />
          ))}
        </ul>
      </div>
    </section>
  );
}
