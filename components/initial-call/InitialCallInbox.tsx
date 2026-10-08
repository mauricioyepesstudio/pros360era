"use client";
import { useEffect, useState } from "react";
import { callTopics, callWindows, type InitialCallRequest } from "@/lib/initial-call/validation";
type Row = InitialCallRequest & {id: string; email: string | null; createdAt: string};
export default function InitialCallInbox() {
 const [rows,setRows]=useState<Row[]|null>(null); const [error,setError]=useState("");
 useEffect(()=>{let active=true; fetch("/api/admin/initial-calls",{cache:"no-store"}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error ?? "No pudimos consultar.");if(active)setRows(data.requests);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 return <section className="rounded-xl border border-[var(--border)] bg-white p-6"><h2 className="text-xl font-bold">Videollamadas iniciales por coordinar</h2><p className="mt-2 text-sm text-[var(--muted)]">Hasta 100 solicitudes recientes. No tienen hora ni enlace confirmados; esta bandeja no envía correos.</p>{error?<p role="alert" className="mt-4">{error}</p>:rows===null?<p role="status" className="mt-4">Cargando solicitudes…</p>:rows.length===0?<p className="mt-4">No hay solicitudes pendientes en esta consulta.</p>:<ul className="mt-4 space-y-4">{rows.map(row=><li key={row.id} className="rounded-xl border border-[var(--border)] p-4"><p className="font-bold">{row.preferredName}</p><p>{row.email ?? "Correo no disponible"}</p><p>{callTopics[row.topic]} · {callWindows[row.availability]} · {row.timeZone}</p><p className="mt-2 text-sm">Autorizó contacto para coordinar esta solicitud. Confirma disponibilidad antes de reservar.</p></li>)}</ul>}</section>;
}
