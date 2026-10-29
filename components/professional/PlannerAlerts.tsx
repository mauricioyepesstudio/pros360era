import Link from "next/link";
import type {PlannerResult} from "@/lib/professional-planner/persistence";
import {plannerReminders} from "@/lib/professional-planner/reminders";
export default function PlannerAlerts({planner,today,instagram}:{planner:PlannerResult;today:string;instagram?:string|null}){
 if(!planner.available)return null;
 const alerts=plannerReminders(planner.planner.posts,planner.publications,planner.networks,today,instagram);
 if(!alerts.length)return null;
 return <section aria-labelledby="planner-alerts" role="status" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6"><h2 id="planner-alerts" className="font-bold text-[var(--brand-navy)]">Tu planner necesita atención</h2><ul className="mt-3 space-y-3">{alerts.map(alert=><li key={alert.id} className="text-sm leading-6"><p>{alert.message}</p><Link href={alert.href} className="inline-flex min-h-11 items-center font-semibold underline">{["networks","brand-account"].includes(alert.id)?"Revisar mis redes":"Revisar mi planner"}</Link></li>)}</ul><p className="mt-2 text-xs text-[var(--muted)]">Avisos dentro de tu panel, basados en el planner guardado. No se envían correos ni se publica contenido por mostrar un aviso.</p></section>;
}
