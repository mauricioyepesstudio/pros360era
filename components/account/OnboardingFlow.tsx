"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import { journeyStages } from "@/data/journey/stages";
import { needOptions } from "@/data/account/foundation";
import type { RoadmapCategory, UserProfile } from "@/data/account/types";
import type { StageId } from "@/data/journey/types";
import { cn } from "@/lib/cn";

export const ONBOARDING_STORAGE_KEY = "evolusa_pending_onboarding";

type Answers={stage?:StageId;time?:string;goal?:string;employment?:string;business?:string;needs:RoadmapCategory[]};

const businessStatusMap: Record<string, UserProfile["businessStatus"]> = {
  "No por ahora": "NONE",
  "Quiero iniciar uno": "WANTS_TO_START",
  "Ya tengo un negocio": "OWNER",
};
const employmentMap: Record<string, UserProfile["employment"]> = {
  "Actualmente trabajo": "EMPLOYED",
  "Trabajo por mi cuenta": "SELF_EMPLOYED",
  "No trabajo actualmente": "NOT_WORKING",
  "Prefiero no decirlo": "PREFER_NOT_TO_SAY",
};
const steps=["Situación","Tiempo","Meta","Trabajo","Negocio","Áreas"];
const goals=["Establecerme y organizarme","Conseguir o estabilizar mi trabajo","Crear un negocio","Proteger lo que estoy construyendo","Conseguir más clientes","Preparar mi siguiente etapa"];
function Choice({active,children,onClick}:{active:boolean;children:React.ReactNode;onClick:()=>void}){return <button type="button" aria-pressed={active} onClick={onClick} className={cn("min-h-14 rounded-[var(--radius-md)] border p-4 text-left font-semibold transition",active?"border-[var(--brand-blue)] bg-[var(--brand-navy)] text-white":"border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-blue)]")}>{children}</button>}
export default function OnboardingFlow(){const [step,setStep]=useState(0);const [answers,setAnswers]=useState<Answers>({needs:[]});const result=useMemo(()=>journeyStages.find((item)=>item.id===answers.stage)??journeyStages[1],[answers.stage]);const complete=step===steps.length;const canContinue=step===0?!!answers.stage:step===1?!!answers.time:step===2?!!answers.goal:step===3?!!answers.employment:step===4?!!answers.business:answers.needs.length>0;
  useEffect(()=>{
    if(!complete) return;
    const pending={
      answers,
      selectedNeeds:answers.needs,
      profileUpdates:{
        currentStage:answers.stage,
        businessStatus:answers.business?businessStatusMap[answers.business]:undefined,
        employment:answers.employment?employmentMap[answers.employment]:undefined,
      },
    };
    try{sessionStorage.setItem(ONBOARDING_STORAGE_KEY,JSON.stringify(pending));}catch{ /* sessionStorage unavailable (private mode, etc.) — signup still works, just without carried-over answers */ }
  },[complete,answers]);
  return <main className="min-h-screen bg-[var(--warm-canvas)]"><header className="border-b border-[var(--border)] bg-white"><div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between px-5"><Link href="/"><BrandMark size="sm"/></Link><span className="text-xs font-bold text-[var(--muted)]">Diagnóstico inicial</span></div></header><div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">{!complete?<><div className="flex items-center justify-between gap-4"><p className="text-sm font-bold text-[var(--brand-blue)]">Paso {step+1} de {steps.length}</p><p className="text-sm text-[var(--muted)]">{steps[step]}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-[var(--brand-blue)] transition-all" style={{width:`${((step+1)/steps.length)*100}%`}}/></div><section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-8">
    {step===0&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)] sm:text-3xl">¿Qué describe mejor tu situación actual?</h1><p className="mt-3 text-[var(--muted)]">Esto nos ayuda a sugerir una etapa inicial.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{journeyStages.map(s=><Choice key={s.id} active={answers.stage===s.id} onClick={()=>setAnswers({...answers,stage:s.id})}><span className="block text-xs opacity-70">{String(s.order).padStart(2,"0")}</span>{s.shortLabel}<span className="mt-1 block text-sm font-normal opacity-80">{s.primaryGoal}</span></Choice>)}</div></>}
    {step===1&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)]">¿Cuánto tiempo llevas en Estados Unidos?</h1><p className="mt-3 text-[var(--muted)]">Solo usamos un rango general; puedes preferir no decirlo.</p><div className="mt-6 grid gap-3">{[["under","Menos de 6 meses"],["middle","Entre 6 meses y 2 años"],["long","Más de 2 años"],["private","Prefiero no decirlo"]].map(([v,l])=><Choice key={v} active={answers.time===v} onClick={()=>setAnswers({...answers,time:v})}>{l}</Choice>)}</div></>}
    {step===2&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)]">¿Qué quieres lograr ahora?</h1><p className="mt-3 text-[var(--muted)]">Elegiremos prioridades relacionadas con tu meta inmediata.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{goals.map(g=><Choice key={g} active={answers.goal===g} onClick={()=>setAnswers({...answers,goal:g})}>{g}</Choice>)}</div></>}
    {step===3&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)]">¿Cuál es tu situación de trabajo?</h1><p className="mt-3 text-[var(--muted)]">Ayuda a ordenar tareas generales de estabilidad y planificación.</p><div className="mt-6 grid gap-3">{["Actualmente trabajo","Trabajo por mi cuenta","No trabajo actualmente","Prefiero no decirlo"].map(v=><Choice key={v} active={answers.employment===v} onClick={()=>setAnswers({...answers,employment:v})}>{v}</Choice>)}</div></>}
    {step===4&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)]">¿Tienes o quieres iniciar un negocio?</h1><p className="mt-3 text-[var(--muted)]">Esto activa únicamente orientación empresarial general.</p><div className="mt-6 grid gap-3">{["No por ahora","Quiero iniciar uno","Ya tengo un negocio"].map(v=><Choice key={v} active={answers.business===v} onClick={()=>setAnswers({...answers,business:v})}>{v}</Choice>)}</div></>}
    {step===5&&<><h1 className="text-2xl font-extrabold text-[var(--brand-navy)]">¿Qué áreas necesitas organizar?</h1><p className="mt-3 text-[var(--muted)]">Selecciona una o varias. No solicitamos datos sensibles.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{needOptions.map(n=><Choice key={n.id} active={answers.needs.includes(n.id)} onClick={()=>setAnswers({...answers,needs:answers.needs.includes(n.id)?answers.needs.filter(x=>x!==n.id):[...answers.needs,n.id]})}>{n.label}</Choice>)}</div></>}
  </section><div className="mt-6 flex justify-between gap-3"><button type="button" onClick={()=>step===0?history.back():setStep(step-1)} className="inline-flex min-h-12 items-center rounded-full px-5 font-bold text-[var(--brand-navy)]"><ArrowLeft className="mr-2" size={18}/>Atrás</button><button type="button" disabled={!canContinue} onClick={()=>setStep(step+1)} className="inline-flex min-h-12 items-center rounded-full bg-[var(--brand-coral)] px-6 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{step===steps.length-1?"Ver mi resultado":"Continuar"}<ArrowRight className="ml-2" size={18}/></button></div><p className="mt-8 text-center text-xs leading-5 text-[var(--muted)]">EVOLUSA debe saber solo lo necesario para ayudarte. No pedimos estatus migratorio, números de identificación, cuentas financieras ni información médica.</p></>:<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-10"><CheckCircle2 className="text-[var(--success)]" size={42}/><p className="mt-6 text-sm font-bold uppercase tracking-wider text-[var(--brand-blue)]">Tu resultado preliminar</p><h1 className="mt-3 text-4xl font-extrabold text-[var(--brand-navy)]">{result.shortLabel}</h1><p className="mt-4 text-lg leading-8 text-[var(--muted)]">{result.description}</p><div className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">Próximo paso sugerido</p><p className="mt-2 font-bold text-[var(--brand-navy)]">{result.primaryGoal}</p></div><p className="mt-6 text-sm leading-6 text-[var(--muted)]">Este resultado es orientación educativa preliminar, no asesoría profesional.</p><Link href="/signup" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-coral)] px-6 font-bold text-white">Crear cuenta gratis y guardar mi camino</Link><Link href="/login" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border)] px-6 font-bold text-[var(--brand-navy)]">Ya tengo cuenta, continuar</Link></section>}</div></main>;
}
