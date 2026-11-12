import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Bot, Check, CircleAlert, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import { demoProfiles, getDemoProfile } from "@/data/professional/demo-templates";
type Props={params:Promise<{slug:string}>};
export async function generateStaticParams(){return demoProfiles.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const p=getDemoProfile((await params).slug);return {title:p?`Demo ${p.category} | EvolUSA`:"Demo no encontrado",robots:{index:false,follow:false}};}
export default async function DemoProfessionalPage({params}:Props){
  const profile=getDemoProfile((await params).slug);if(!profile)notFound();
  return <><SiteHeader/><main className="bg-[var(--background)] text-[var(--foreground)]">
    <section className={`relative overflow-hidden bg-gradient-to-br pb-20 pt-32 text-white sm:pt-40 ${profile.accent}`}>
      <div className="pointer-events-none absolute -right-12 -top-10 text-[24rem] font-black leading-none opacity-10" aria-hidden>EV</div>
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Link href="/demo/profesionales" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft size={16}/> Todas las plantillas</Link>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider"><CircleAlert size={16}/> Demostración ficticia · No disponible para contratar</div>
        <p className="font-bold uppercase tracking-widest text-white/75">{profile.category}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight sm:text-7xl">{profile.title}</h1>
        <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">{profile.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#servicios" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950">Explorar servicios <ArrowRight size={16}/></a><a href="#agente" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white">Ver tareas del agente <Bot size={16}/></a></div>
        <p className="mt-5 text-xs text-white/80">Los botones son navegación de demostración. No envían solicitudes ni contactan negocios.</p>
      </div>
    </section>
    <section id="servicios" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)]">Catálogo de muestra</p>
      <h2 className="mt-3 text-3xl font-extrabold text-[var(--brand-navy)] sm:text-4xl">Una vitrina específica para este mercado</h2>
      <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">Estos módulos ilustran la experiencia que recibiría un profesional real al publicar contenido autorizado y conectar sus herramientas.</p>
      <div className="mt-9 grid gap-6 md:grid-cols-3">{profile.modules.map((mod,i)=><article key={mod.title} className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-7 shadow-sm">
        <div className={`mb-6 flex h-28 items-end overflow-hidden rounded-2xl bg-gradient-to-tr p-5 text-white ${profile.accent}`}><span className="text-6xl font-black opacity-80">{String(i+1).padStart(2,"0")}</span></div>
        <h3 className="text-xl font-extrabold text-[var(--brand-navy)]">{mod.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">{mod.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5 font-bold text-[var(--brand-blue)]">{mod.cta}<ArrowRight size={18}/></div>
        <p className="mt-2 text-xs text-[var(--muted)]">Vista previa · Acción deshabilitada</p>
      </article>)}</div>
    </section>
    <section id="agente" className="bg-[var(--surface-subtle)] py-20"><div className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="flex items-center gap-3"><Bot className="text-[var(--brand-blue)]" size={30}/><p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)]">Agent blueprint</p></div>
      <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-[var(--brand-navy)] sm:text-4xl">Un agente adaptado al negocio</h2>
      <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">Diseño de tareas propuestas, aún no activadas. Cada acción futura debe ejecutarse con autorización, límites por perfil y registro de auditoría.</p>
      <div className="mt-9 grid gap-5 lg:grid-cols-3">{profile.tasks.map((task,i)=><article key={task.title} className="rounded-3xl border border-[var(--border)] bg-white p-6">
        <div className="mb-5 flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--sky-surface)] font-extrabold text-[var(--brand-navy)]">{i+1}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Propuesto · No activo</span></div>
        <h3 className="text-lg font-bold text-[var(--brand-navy)]">{task.title}</h3>
        <div className="mt-5 space-y-4 text-sm leading-6"><p><Clock3 size={16} className="mr-2 inline text-[var(--brand-blue)]"/><b>Disparador:</b> {task.trigger}</p><p><Check size={16} className="mr-2 inline text-[var(--brand-blue)]"/><b>Resultado:</b> {task.result}</p><p><ShieldCheck size={16} className="mr-2 inline text-[var(--brand-blue)]"/><b>Control:</b> {task.approval}</p></div>
      </article>)}</div>
      <div className="mt-9 rounded-3xl border border-[var(--border)] bg-white p-7"><div className="flex items-center gap-3"><Sparkles size={24} className="text-[var(--brand-blue)]"/><h3 className="text-xl font-bold text-[var(--brand-navy)]">Cómo se convertiría en un ARM real</h3></div><p className="mt-3 max-w-4xl leading-7 text-[var(--muted)]">Al conectar un profesional auténtico, los módulos tomarían datos de su catálogo y recibirían solicitudes con consentimiento. El ARM asignaría responsable, próxima acción, estado y seguimiento. Las automatizaciones solo se habilitarían tras configurar permisos, fuentes, seguridad y pruebas. Aquí no se generan clientes ni se envían mensajes.</p></div>
      <Link href="/demo/profesionales" className="mt-8 inline-flex items-center gap-2 font-bold text-[var(--brand-blue)]"><ArrowLeft size={17}/> Volver a las plantillas</Link>
    </div></section>
  </main><Footer/></>;
}
