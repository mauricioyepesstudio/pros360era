import ProfessionalDraftForm from "@/components/professional-drafts/ProfessionalDraftForm";
import { getMyProfessionalDraft } from "@/lib/professional-drafts/persistence";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/account/persistence";

export default async function ProfessionalDashboard() {
 const supabase = await createSupabaseServerClient();
 const user = supabase ? (await supabase.auth.getUser()).data.user : null;
 if (!user) redirect("/login?next=%2Fdashboard%2Fprofessional");
 const role = await getCurrentRole();
 if (role === "PROFESSIONAL" || role === "ADMIN") redirect("/panel-profesional");
 const draft = await getMyProfessionalDraft();
 return <div className="space-y-8">
  <PageHeader eyebrow="Borrador privado" title="Tu presentación profesional" description="Prepara cómo quieres presentarte mientras completas el proceso de solicitud." />
  <section className="rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Este es tu espacio profesional</h2>
   <p className="mt-3">Tu cuenta está activa. Aquí puedes preparar tu presentación.</p>
   <p className="mt-3 text-sm text-[var(--muted)]">Guardarla no envía una solicitud, no publica un perfil y no cambia tu rol.</p>
   <p className="mt-3 text-sm">Si aún no enviaste el formulario, <Link className="underline" href="/aplicar-profesional">completa tu solicitud</Link>. La solicitud y esta presentación se revisan por separado.</p>
  </section>
  <ProfessionalDraftForm initial={draft} />
  <section id="proceso" className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Cómo funciona para ti</h2>
   <ol className="mt-4 list-decimal space-y-3 pl-5">
    <li>Envías tu información y creas tu cuenta.</li>
    <li>Completas tu perfil privado y preparas tu pitch mientras el equipo revisa tu solicitud.</li>
    <li>Revisas tu pitch, servicios, ubicación y enlaces antes de que se publiquen.</li>
    <li>Las integraciones de redes requieren autorización específica. Registrar un enlace no autoriza publicaciones.</li>
    <li>Revisas las oportunidades que correspondan a tu perfil. No prometemos clientes ni ingresos.</li>
   </ol>
  </section>
  <section className="rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Tu pitch profesional</h2>
   <p className="mt-3 font-semibold">{draft?.headline || "Tu presentación todavía está pendiente."}</p>
   <p className="mt-3 whitespace-pre-line">{draft?.bio || "Describe a quién ayudas, qué servicio ofreces y tu experiencia real. No añadas credenciales que no puedas respaldar."}</p>
  </section>
  <section id="redes" className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Redes sociales y permisos</h2>
   <p className="mt-3">Puedes añadir enlaces a tus redes en tu perfil. Son enlaces de presentación, no cuentas conectadas.</p>
   <p className="mt-3 text-sm text-[var(--muted)]">La conexión para consultar estadísticas o preparar contenido necesita un flujo de autorización verificado por plataforma. No está habilitada en este recorrido. Nunca compartas contraseñas; cada permiso debe indicar su finalidad y cómo revocarlo.</p>
  </section>
 </div>;
}
