"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Info, ShieldCheck, Users } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";

/**
 * Demo pública de las herramientas para profesionales. TODO el contenido es
 * «Ejemplo ilustrativo»: sin cifras de seguidores, interacción, clientes ni
 * ingresos, sin proyecciones y sin reparto de ingresos. Solo describe
 * herramientas que existen en el panel profesional (planner, redes
 * conectadas, CRM y solicitudes de miembros en categorías permitidas).
 * Las categorías reguladas (inmigración, legal, impuestos, etc.) no entran
 * en automatización ni en reparto de ingresos (regla provisional
 * 2026-09-30, docs/cerebro/decisiones.md).
 */

type Tab = "como" | "planner" | "crm" | "medicion";

const tabs: { id: Tab; label: string }[] = [
  { id: "como", label: "Cómo funciona" },
  { id: "planner", label: "Planner (ejemplo)" },
  { id: "crm", label: "CRM (ejemplo)" },
  { id: "medicion", label: "Qué medimos" },
];

const EXAMPLE_POSTS = [
  { id: 1, status: "Publicado", channel: "Instagram", date: "Lunes 10:00", content: "Abrimos agenda de esta semana para revisar la presencia digital de tu negocio. Escríbenos por mensaje directo." },
  { id: 2, status: "Listo para publicar", channel: "Facebook", date: "Miércoles 12:30", content: "Tres cosas que revisar en tu ficha de Google Business: horario, fotos y forma de contacto." },
  { id: 3, status: "Idea", channel: "Instagram", date: "Viernes", content: "Detrás de cámaras: así preparamos el calendario de contenido de un cliente." },
];

const EXAMPLE_CONTACTS = [
  { name: "Contacto de ejemplo A", source: "Instagram", interest: "Página web para su negocio", status: "Nuevo" },
  { name: "Contacto de ejemplo B", source: "WhatsApp", interest: "Calendario de contenido", status: "Contactado" },
  { name: "Contacto de ejemplo C", source: "Sitio web", interest: "Organizar operaciones", status: "Calificado" },
];

const steps = [
  { title: "Conecta tus redes", body: "Conectas tu Instagram y tu Facebook desde tu panel. Puedes desconectarlos cuando quieras." },
  { title: "Planifica tu contenido", body: "En el planner decides qué publicas y cuándo. Solo sale lo que tú marcas «Listo para publicar»." },
  { title: "Da seguimiento en el CRM", body: "Tus contactos, conversaciones y seguimientos quedan en un solo lugar." },
  { title: "Recibe solicitudes", body: "En categorías permitidas, miembros de EVOLUSA que necesitan tu servicio pueden llegar a tu panel." },
];

function ExampleBadge() {
  return <span className="rounded-full bg-[var(--sky-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">Ejemplo ilustrativo</span>;
}

export default function ProfessionalDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("como");

  return (
    <div className="min-h-screen bg-[var(--warm-canvas)]">
      <header className="sticky top-0 z-50 border-b-4 border-[var(--brand-red)] bg-[var(--brand-navy)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <Link href="/"><BrandMark theme="dark" size="md" /></Link>
          <p className="text-sm text-[var(--sky-surface)]">Demo de herramientas para profesionales</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div role="note" className="mb-10 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
          <Info aria-hidden size={20} className="mt-0.5 flex-none text-[var(--brand-blue)]" />
          <p><strong className="text-[var(--brand-navy)]">Ejemplo ilustrativo.</strong> Los contenidos, contactos y estados de esta demo son ficticios. No son resultados reales ni una proyección de seguidores, clientes o ingresos.</p>
        </div>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-[var(--brand-navy)] sm:text-5xl">Tu marca profesional, organizada</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--muted)]">Planner de publicaciones, redes conectadas y CRM en un solo panel. Tú decides qué se publica y a quién respondes.</p>
          <Link href="/professional-demo-tutorial" className="inline-block rounded-[var(--radius-pill)] bg-[var(--brand-blue)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--brand-blue-strong)]">Ver paso a paso</Link>
        </div>

        <div role="tablist" aria-label="Secciones de la demo" className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id
                ? "rounded-[var(--radius-md)] border-2 border-[var(--brand-red)] bg-[var(--brand-red)] p-4 font-semibold text-white"
                : "rounded-[var(--radius-md)] border-2 border-[var(--brand-blue)] bg-[var(--sky-surface)] p-4 font-semibold text-[var(--brand-navy)]"}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "como" && (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
                  <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">{index + 1}</span>
                  <div>
                    <h2 className="font-bold text-[var(--brand-navy)]">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--sky-surface)] p-6 text-sm leading-6 text-[var(--muted)]">
              <p className="flex items-center gap-2 font-bold text-[var(--brand-navy)]"><ShieldCheck aria-hidden size={18} className="text-[var(--brand-blue)]" /> Categorías reguladas</p>
              <p className="mt-2">Inmigración, legal, impuestos, seguros, notaría y similares quedan fuera de la automatización y de cualquier reparto de ingresos. EVOLUSA no ofrece servicios ni orientación migratoria, legal, fiscal ni notarial.</p>
            </div>
          </div>
        )}

        {activeTab === "planner" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3"><ExampleBadge /><p className="text-sm text-[var(--muted)]">Así se ve un calendario de contenido de un negocio de marketing ficticio.</p></div>
            {EXAMPLE_POSTS.map((post) => (
              <article key={post.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                  <CalendarDays aria-hidden size={18} className="text-[var(--brand-blue)]" />
                  <span className="font-semibold text-[var(--brand-navy)]">{post.date} · {post.channel}</span>
                  <span className="rounded-full bg-[var(--stone-surface)] px-3 py-1 text-xs font-bold text-[var(--brand-navy)]">{post.status}</span>
                </div>
                <p className="leading-relaxed text-[var(--brand-navy)]">{post.content}</p>
              </article>
            ))}
            <p className="text-sm text-[var(--muted)]">Nada se publica sin que tú lo marques como listo. Sin cifras de alcance ni de interacción en esta demo.</p>
          </div>
        )}

        {activeTab === "crm" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3"><ExampleBadge /><p className="text-sm text-[var(--muted)]">Contactos ficticios para mostrar cómo se organiza el seguimiento.</p></div>
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--sky-surface)]">
                  <tr>
                    <th className="px-6 py-3 font-bold text-[var(--brand-navy)]">Contacto</th>
                    <th className="px-6 py-3 font-bold text-[var(--brand-navy)]">Origen</th>
                    <th className="px-6 py-3 font-bold text-[var(--brand-navy)]">Interés</th>
                    <th className="px-6 py-3 font-bold text-[var(--brand-navy)]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {EXAMPLE_CONTACTS.map((contact) => (
                    <tr key={contact.name}>
                      <td className="px-6 py-4 font-semibold text-[var(--brand-navy)]">{contact.name}</td>
                      <td className="px-6 py-4 text-[var(--muted)]">{contact.source}</td>
                      <td className="px-6 py-4 text-[var(--muted)]">{contact.interest}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-[var(--stone-surface)] px-3 py-1 text-xs font-bold text-[var(--brand-navy)]">{contact.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="flex items-center gap-2 text-sm text-[var(--muted)]"><Users aria-hidden size={16} className="text-[var(--brand-blue)]" /> Tú decides a quién respondes y cuándo.</p>
          </div>
        )}

        {activeTab === "medicion" && (
          <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8">
            <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Sin proyecciones</h2>
            <p className="leading-7 text-[var(--muted)]">EVOLUSA no tiene datos históricos que permitan proyectar seguidores, contactos, clientes o ingresos, así que no los mostramos. En tu panel ves solo tus propios datos reales.</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {["Qué publicaste y cuándo, desde tu planner", "Tus contactos y su estado, desde tu CRM", "Las solicitudes de miembros que te llegaron"].map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 aria-hidden size={18} className="flex-none text-[var(--brand-blue)]" />{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-16 rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white">¿Quieres usar estas herramientas?</h2>
          <p className="mb-8 text-lg text-[var(--sky-surface)]">Cuéntanos de tu práctica y te mostramos los siguientes pasos.</p>
          <Link href="/aplicar-profesional" className="inline-flex items-center gap-3 rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-8 py-4 text-lg font-bold text-white hover:bg-[var(--brand-red-strong)]">
            Aplicar como profesional
            <ArrowRight aria-hidden size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}
