import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Bot, BriefcaseBusiness, CircleAlert, FileCheck2, House, Megaphone, Shield, Stamp, Wrench, ChartColumnIncreasing, Calculator } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import { demoProfiles } from "@/data/professional/demo-templates";
export const metadata: Metadata = { title: "Laboratorio de perfiles | EvolUSA", description: "Demostraciones ficticias de perfiles comerciales y agentes por categoría. No son profesionales activos." };
const icons = { house:House, file:FileCheck2, stamp:Stamp, chart:ChartColumnIncreasing, megaphone:Megaphone, calculator:Calculator, shield:Shield, hammer:Wrench };
export default function DemoProfilesPage() {
  return <><SiteHeader/><main className="min-h-screen bg-[var(--background)] pb-24 pt-32 text-[var(--foreground)] sm:pt-40">
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-950"><CircleAlert size={16}/> Laboratorio privado de producto · Datos ficticios</div>
      <p className="text-sm font-bold uppercase tracking-widest text-[var(--brand-blue)]">EvolUSA · Product Studio</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--brand-navy)] sm:text-6xl">Un perfil que vende. Un agente que conoce su negocio.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">Explora plantillas comerciales y módulos de trabajo específicos para cada industria. Todos los ejemplos son demostraciones: no representan profesionales reales, cuentas conectadas ni automatizaciones activadas.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {demoProfiles.map((profile) => {
          const Icon=icons[profile.icon];
          return <Link href={`/demo/profesionales/${profile.slug}`} key={profile.slug} className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className={`relative flex h-48 items-center justify-between overflow-hidden bg-gradient-to-br p-7 text-white ${profile.accent}`}>
              <span className="absolute right-0 top-0 translate-x-8 -translate-y-7 text-[11rem] font-black opacity-10" aria-hidden>EV</span>
              <span className="relative rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">Demo · {profile.category}</span>
              <Icon className="relative shrink-0" size={54} strokeWidth={1.3} aria-hidden/>
            </div>
            <div className="flex flex-1 flex-col p-7">
              <h2 className="text-2xl font-extrabold text-[var(--brand-navy)]">{profile.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">{profile.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-2">{profile.modules.slice(0,2).map(m=><span key={m.title} className="rounded-full bg-[var(--sky-surface)] px-3 py-1 text-xs font-semibold text-[var(--brand-navy)]">{m.title}</span>)}</div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5 text-sm font-bold text-[var(--brand-blue)]">Explorar template y agente <ArrowRight size={18} aria-hidden/></div>
            </div>
          </Link>;
        })}
      </div>
      <div className="mt-12 grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--sky-surface)] p-7 sm:grid-cols-3">
        <div><BriefcaseBusiness className="mb-3" size={28}/><h3 className="font-bold">Plantilla por industria</h3><p className="mt-2 text-sm leading-6">Servicio, galería o catálogo según su nicho.</p></div>
        <div><Bot className="mb-3" size={28}/><h3 className="font-bold">Agente dedicado</h3><p className="mt-2 text-sm leading-6">Tareas, disparadores, resultados y aprobaciones previstas.</p></div>
        <div><Shield className="mb-3" size={28}/><h3 className="font-bold">Sin datos falsos en producción</h3><p className="mt-2 text-sm leading-6">Los demos no se publican en el directorio real ni generan leads.</p></div>
      </div>
      <p className="mt-8 text-sm text-[var(--muted)]">El despliegue de estas plantillas no habilita por sí solo conexiones sociales, Dots, ejecución de tareas ni automatización de seguimiento.</p>
      <Link href="/profesionales" className="mt-5 inline-flex items-center gap-2 font-bold text-[var(--brand-blue)]">Ir al directorio real <ArrowRight size={17}/></Link>
    </div>
  </main><Footer/></>;
}
