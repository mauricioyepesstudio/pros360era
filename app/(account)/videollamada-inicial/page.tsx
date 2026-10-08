import PageHeader from "@/components/account/PageHeader";
import InitialCallForm from "@/components/initial-call/InitialCallForm";
import { getMyInitialCall } from "@/lib/initial-call/persistence";
import { safeReturnPath } from "@/lib/auth/return-path";
export default async function InitialCallPage({searchParams}: {searchParams: Promise<{returnTo?: string}>}) {
 const params = await searchParams; const result = await getMyInitialCall();
 const destination = safeReturnPath(params.returnTo); const returnTo = destination.startsWith("/videollamada-inicial") ? "/dashboard" : destination;
 return <div className="mx-auto max-w-2xl space-y-6"><PageHeader eyebrow="Contacto inicial" title="Solicitar una videollamada inicial" description="Conversemos sobre cómo empezar en EVOLUSA o preparar tu espacio profesional."/><p className="leading-7 text-[var(--muted)]">Esto registra una solicitud. No reserva una cita y todavía no crea un enlace de videollamada. La conversación inicial explica el uso de EVOLUSA; no sustituye asesoría legal, migratoria, fiscal ni financiera.</p><InitialCallForm initial={result.request} available={result.available} returnTo={returnTo}/></div>;
}
