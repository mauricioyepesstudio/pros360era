"use client";

import { useState } from "react";
import { ArrowRight, Bot, CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import type { DemoProfile } from "@/data/professional/demo-templates";

/** Explicitly local demonstration. Does not call an agent or write to a CRM. */
export default function DemoAgentWorkbench({ profile }: { profile: DemoProfile }) {
  const [stage, setStage] = useState(0);
  const total = profile.tasks.length;
  return (
    <div className="mt-9 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)]"><Bot size={17}/> Simulador · Agente de {profile.category}</div>
          <h3 className="text-2xl font-extrabold text-[var(--brand-navy)]">De la solicitud al seguimiento</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Prueba el recorrido propuesto, paso a paso. Esta simulación es local: no ejecuta agentes reales, no crea leads y no envía notificaciones.</p>
        </div>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-950">Entorno de demostración</span>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {profile.tasks.map((task, index) => {
          const finished = stage > index;
          const current = stage === index;
          return <div key={task.title} className={`rounded-2xl border p-5 transition ${finished?"border-emerald-200 bg-emerald-50":current?"border-[var(--brand-blue)] bg-[var(--sky-surface)]":"border-[var(--border)] bg-white"}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className={`flex size-9 items-center justify-center rounded-full text-sm font-black ${finished?"bg-emerald-800 text-white":current?"bg-[var(--brand-navy)] text-white":"bg-slate-100 text-slate-500"}`}>{finished?<CheckCircle2 size={20}/>:index+1}</span>
              <span className={`text-[11px] font-bold ${finished?"text-emerald-800":current?"text-[var(--brand-blue)]":"text-slate-500"}`}>{finished?"Simulado":current?"Siguiente":"Pendiente"}</span>
            </div>
            <h4 className="text-base font-bold text-[var(--brand-navy)]">{task.title}</h4>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]"><strong>Disparador:</strong> {task.trigger}</p>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]"><strong>Resultado esperado:</strong> {task.result}</p>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-700"><ShieldCheck className="shrink-0" size={15}/>{task.approval}</p>
          </div>;
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button disabled={stage===total} onClick={()=>setStage(s=>Math.min(total,s+1))} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{stage===total?"Simulación terminada":"Simular siguiente paso"} <ArrowRight size={16}/></button>
        <button onClick={()=>setStage(0)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--brand-navy)]"><RotateCcw size={16}/> Reiniciar</button>
        <span className="ml-auto text-sm font-semibold text-[var(--muted)]">{stage}/{total} pasos simulados</span>
      </div>
      {stage===total&&<div role="status" className="mt-6 flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><Sparkles className="shrink-0" size={20}/> Simulación completada. Para ejecutar tareas reales aún hacen falta conectores autorizados, permisos, control de datos y aprobación del profesional.</div>}
    </div>
  );
}
