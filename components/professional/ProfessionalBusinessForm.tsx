"use client";
import Link from "next/link";
import {useState,useTransition} from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import {businessActivities} from "@/data/professional/business-activities";
import type {ProfessionalBusiness} from "@/lib/professional-business/validation";
import {saveProfessionalBusinessAction} from "@/app/(account)/panel-profesional/perfil/business-actions";
export default function ProfessionalBusinessForm({initial,displayName,location}:{initial:ProfessionalBusiness|null;displayName:string;location:string}){
 const [fields,setFields]=useState<ProfessionalBusiness>(initial??{activity:"other",businessName:displayName,audience:"",services:"",offer:"",location});
 const [pending,startTransition]=useTransition(),[message,setMessage]=useState(""),[saved,setSaved]=useState(false);
 function update(key:keyof ProfessionalBusiness,value:string){setFields(current=>({...current,[key]:value}));setSaved(false);setMessage("");}
 function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setMessage("");setSaved(false);const submitted={...fields};startTransition(async()=>{try{const result=await saveProfessionalBusinessAction(submitted);setMessage(result.message);setSaved(result.saved);}catch{setMessage("No pudimos conectar. Tus respuestas siguen aquí; vuelve a guardar.");}});}
 return <Card><form onSubmit={submit} className="space-y-5" aria-labelledby="business-heading"><div><h2 id="business-heading" className="text-lg font-bold text-[var(--brand-navy)]">Mi negocio y mi contenido</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Este formulario es privado y adapta tus propuestas a tu actividad, tu público y tus servicios. Tu categoría aprobada y tus permisos se revisan por separado.</p></div>
 <fieldset disabled={pending} className="space-y-5 disabled:opacity-70"><FormField id="business-activity" label="Actividad de tu negocio"><select id="business-activity" required value={fields.activity} onChange={event=>update("activity",event.target.value)} className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2">{businessActivities.map(activity=><option key={activity.id} value={activity.id}>{activity.label}</option>)}</select></FormField>
 <FormField id="business-name" label="Nombre del negocio"><Input id="business-name" required maxLength={120} value={fields.businessName} onChange={event=>update("businessName",event.target.value)} /></FormField>
 <FormField id="business-audience" label="¿A quién quieres llegar?"><Input id="business-audience" required maxLength={240} value={fields.audience} onChange={event=>update("audience",event.target.value)} placeholder="Ej.: familias que buscan comprar su primera vivienda" /></FormField>
 <FormField id="business-services" label="Servicios o productos que ofreces" hint="Solo información real del negocio; no incluyas datos de clientes ni documentos sensibles."><textarea id="business-services" required maxLength={1200} value={fields.services} onChange={event=>update("services",event.target.value)} rows={4} className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3" /></FormField>
 <FormField id="business-offer" label="¿Qué oferta quieres comunicar?"><Input id="business-offer" required maxLength={300} value={fields.offer} onChange={event=>update("offer",event.target.value)} placeholder="Describe un servicio y su siguiente paso, sin prometer resultados" /></FormField>
 <FormField id="business-location" label="Zona en la que atiendes"><Input id="business-location" required maxLength={120} value={fields.location} onChange={event=>update("location",event.target.value)} /></FormField>
 <p className="text-sm text-[var(--muted)]">El sitio web y LinkedIn se toman de tus enlaces del perfil. Guardarlos no conecta una cuenta de publicación.</p>
 <Button type="submit" disabled={pending}>{pending?"Guardando…":"Guardar mi negocio"}</Button></fieldset>
 {message&&<p role="status" aria-live="polite" className={saved?"text-sm font-semibold text-[var(--success)]":"text-sm text-[var(--danger)]"}>{message}</p>}
 {saved&&<Link href="/panel-profesional/planner?review=weekly#propuestas" className="inline-flex min-h-11 items-center font-bold underline">Revisar mis propuestas personalizadas</Link>}
 </form></Card>;
}
