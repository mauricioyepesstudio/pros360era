import {
  ArrowUpRight, BadgeCheck, CalendarDays, CheckCircle2, ClipboardCheck,
  FileText, Home, Image as ImageIcon, Landmark, MapPin, Megaphone,
  ShieldCheck, Sparkles, TrendingUp, Wrench
} from "lucide-react";
import type { DemoProfile } from "@/data/professional/demo-templates";

/**
 * Portfolio-style niche mockups. No fake professionals, properties, ratings,
 * testimonials, verified status, or backend metrics. Presentation only.
 */
export default function DemoNicheVisual({ profile, compact = false }: { profile: DemoProfile; compact?: boolean }) {
  const common = "rounded-2xl border border-white/20 bg-white/95 text-slate-900 shadow-2xl";
  if (profile.slug === "realtor") return (
    <div className={`${common} overflow-hidden`}>
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-sky-200 via-slate-100 to-blue-300 sm:h-56">
        <div className="absolute left-6 top-5 rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wide text-slate-700">FICHA DE MUESTRA</div>
        <div className="absolute bottom-0 right-7 flex items-end gap-1 text-slate-600/80">
          <div className="h-20 w-8 bg-slate-500/30"/><div className="h-28 w-12 bg-slate-500/30"/><div className="h-16 w-9 bg-slate-500/30"/>
        </div>
        <Home size={88} strokeWidth={1} className="relative text-slate-700"/>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2"><b className="text-base">Galería de propiedades</b><span className="text-xs text-slate-500">Demo</span></div>
        <p className="flex items-center gap-1 text-xs text-slate-600"><MapPin size={13}/> Ubicación · Fotos · Características</p>
        <div className="flex gap-2">{["Fotos", "Detalles", "Solicitar visita"].map(x=><span key={x} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold">{x}</span>)}</div>
      </div>
    </div>
  );
  if (profile.slug === "home-improvement") return (
    <div className={`${common} overflow-hidden`}>
      <div className="grid h-48 grid-cols-2 gap-1 bg-slate-300">
        <div className="relative flex items-center justify-center bg-gradient-to-br from-stone-400 to-stone-700 text-white"><Wrench size={62} strokeWidth={1}/><span className="absolute bottom-4 left-4 rounded bg-black/45 px-2 py-1 text-xs font-bold">ANTES</span></div>
        <div className="relative flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-300 text-amber-950"><Home size={62} strokeWidth={1}/><span className="absolute bottom-4 left-4 rounded bg-white/75 px-2 py-1 text-xs font-bold">DESPUÉS</span></div>
      </div>
      <div className="p-5"><b>Portafolio de proyectos</b><p className="mt-2 text-xs text-slate-600">Galerías, acabados y solicitud de presupuesto</p></div>
    </div>
  );
  if (profile.slug === "marketing") return (
    <div className={`${common} p-5`}>
      <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold"><Sparkles size={17} className="text-fuchsia-700"/> Brand Studio</span><span className="rounded-full bg-fuchsia-100 px-2 py-1 text-[10px] text-fuchsia-900">PREVIEW</span></div>
      <div className="grid h-40 grid-cols-[1.4fr_1fr] gap-2">
        <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-fuchsia-900 to-violet-500 p-4 text-white"><span className="text-2xl font-black">BRAND<br/>STORY.</span><span className="text-[11px]">Campaña creativa</span></div>
        <div className="grid grid-rows-2 gap-2"><div className="flex items-center justify-center rounded-xl bg-pink-100"><ImageIcon className="text-pink-800" size={30}/></div><div className="flex items-center justify-center rounded-xl bg-violet-100"><Megaphone className="text-violet-900" size={30}/></div></div>
      </div><p className="mt-4 text-xs text-slate-600">Diseño · Contenido · Campañas · CRM</p>
    </div>
  );
  if (profile.slug === "finanzas") return (
    <div className={`${common} p-5`}>
      <div className="flex items-center justify-between"><b className="text-sm">Financial overview</b><span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-900">DEMO</span></div>
      <p className="mt-2 text-xs text-slate-500">Tendencias ilustrativas · Sin datos reales</p>
      <div className="mt-5 flex h-32 items-end justify-between gap-2 rounded-xl bg-emerald-50 px-4 pb-3 pt-4">{[34,52,45,66,59,78,86,70].map((h,i)=><div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-900 to-emerald-400" style={{height:`${h}%`}}/>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-2">{["Cash flow","Reportes","Objetivos"].map(t=><span key={t} className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-bold">{t}</span>)}</div>
    </div>
  );
  if (profile.slug === "inmigracion-documental" || profile.slug === "taxes") {
    const tax=profile.slug==="taxes";
    return <div className={`${common} p-5`}>
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4"><div className="rounded-xl bg-sky-100 p-3 text-blue-900">{tax?<Landmark size={27}/>:<FileText size={27}/>}</div><div><b className="text-sm">{tax?"Organizador fiscal":"Organizador de documentos"}</b><p className="text-[11px] text-slate-500">Panel ilustrativo · Demo</p></div></div>
      <div className="mt-4 space-y-3">{(tax?["Información general","Documentos necesarios","Revisión del preparador"]:["Documentación inicial","Formularios y soportes","Revisión de pendientes"]).map((x,i)=><div key={x} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-xs font-medium"><span className="flex items-center gap-2"><ClipboardCheck size={15} className="text-blue-800"/>{x}</span><span className="text-slate-400">{i+1}/3</span></div>)}</div>
    </div>;
  }
  if (profile.slug === "notaria") return (
    <div className={`${common} p-5`}>
      <div className="flex items-center justify-between"><b className="text-sm">Reservar atención</b><span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] text-rose-900">DEMO</span></div>
      <div className="mt-5 grid grid-cols-5 gap-2">{["L","M","M","J","V"].map((d,i)=><div key={i} className={`rounded-xl p-2 text-center text-xs font-bold ${i===2?"bg-rose-800 text-white":"bg-slate-100 text-slate-600"}`}>{d}<div className="mt-2 text-lg">{i+12}</div></div>)}</div>
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><CalendarDays size={24} className="text-rose-800"/><div><b className="text-xs">Solicitar cita</b><p className="text-[11px] text-slate-500">Confirmación por el profesional</p></div></div>
    </div>
  );
  return (
    <div className={`${common} p-5`}>
      <div className="flex items-center justify-between"><b className="text-sm">Insurance intake</b><span className="rounded-full bg-cyan-100 px-2 py-1 text-[10px] text-cyan-900">DEMO</span></div>
      <div className="my-5 flex justify-center"><div className="rounded-full bg-cyan-50 p-8"><ShieldCheck size={72} strokeWidth={1.2} className="text-cyan-900"/></div></div>
      <div className="flex flex-wrap gap-2">{["Cobertura","Cotización","Asesor"].map(x=><span key={x} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">{x}</span>)}</div>
    </div>
  );
}
