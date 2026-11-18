import Link from "next/link";
import { ArrowRight, CreditCard, MapPinned, Target } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import RoadmapBoard from "@/components/account/RoadmapBoard";
import LifeEvents from "@/components/account/LifeEvents";
import { getCurrentProfile } from "@/lib/account/persistence";
import { journeyStages } from "@/data/journey/stages";
import { generateAccountRoadmap } from "@/lib/account/roadmap-engine";
import { requireMemberArea } from "@/lib/account/role-gate";

export default async function DashboardPage(){
await requireMemberArea();
const profile=await getCurrentProfile();const roadmap=generateAccountRoadmap(profile);const stage=journeyStages.find(s=>s.id===profile.currentStage)!;const next=roadmap.now[0];
// Una sola acción principal: la siguiente del roadmap. Lo que ya está en el
// menú (Roadmap, Asistente, Perfil) no se repite aquí como tarjeta.
return <div className="space-y-8">
<PageHeader eyebrow="Cuenta de usuario" title={profile.name?`Hola, ${profile.name}`:"Hola, este es tu camino"} description="Tu etapa, tu siguiente paso y lo que sigue."/>
<section className="rounded-[var(--radius-lg)] bg-[var(--role-member)] p-6 text-white sm:p-8">
<div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
<div><p className="flex items-center gap-2 text-sm font-bold text-white/80"><MapPinned aria-hidden size={18}/>Etapa actual</p><h2 className="mt-2 text-3xl font-extrabold">{stage.shortLabel}</h2><div className="mt-5 max-w-md"><div className="flex justify-between text-sm"><span>Progreso general</span><strong>{profile.progress}%</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{width:`${profile.progress}%`}}/></div></div></div>
{next?<div className="rounded-[var(--radius-md)] bg-white p-5 text-[var(--brand-navy)]"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--role-member)]"><Target aria-hidden size={16}/>Tu siguiente paso</p><h3 className="mt-2 text-xl font-bold">{next.title}</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{next.description}</p><Link href="/roadmap" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--role-member)] px-5 text-sm font-bold text-white hover:bg-[var(--role-member-strong)]">Hacerlo ahora<ArrowRight aria-hidden className="ml-2" size={16}/></Link></div>:null}
</div></section>
<section><h2 className="mb-5 text-2xl font-extrabold text-[var(--brand-navy)]">Ahora, esta semana y próximamente</h2><RoadmapBoard roadmap={roadmap} compact/></section>
<LifeEvents selectedIds={profile.lifeEventIds}/>
<Link href="/plan-credito" className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 hover:border-[var(--role-member)]"><CreditCard aria-hidden className="shrink-0 text-[var(--role-member)]"/><span className="flex-1"><strong className="block text-[var(--brand-navy)]">Plan de Crédito</strong><span className="text-sm text-[var(--muted)]">Construye tu historial de crédito paso a paso, por tu cuenta.</span></span><ArrowRight aria-hidden className="text-[var(--muted)]" size={18}/></Link>
</div>}
