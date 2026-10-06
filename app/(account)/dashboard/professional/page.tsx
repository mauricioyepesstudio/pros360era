import ProfessionalDraftForm from "@/components/professional-drafts/ProfessionalDraftForm";
import { getMyProfessionalDraft } from "@/lib/professional-drafts/persistence";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";
import { getCurrentRole } from "@/lib/account/persistence";

export default async function ProfessionalDashboard() {
 const supabase = await createSupabaseServerClient();
 const user = supabase ? (await supabase.auth.getUser()).data.user : null;
 if (!user) redirect("/login?next=%2Fdashboard%2Fprofessional");
 const [profile, role, draft] = await Promise.all([getMyProfessionalProfile(), getCurrentRole(), getMyProfessionalDraft()]);
 const canEdit = role === "PROFESSIONAL" && !!profile;
 return <div className="space-y-8">
  <PageHeader eyebrow="Tu espacio profesional" title={profile ? `Hola, ${profile.displayName}` : "Bienvenido a tu espacio profesional"} description="Prepara tu presentación, conoce el proceso y revisa los próximos pasos." />
  <section className="rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Estado de tu perfil</h2>
   <p className="mt-3">{profile ? (profile.isApproved ? "Perfil aprobado" : "Perfil pendiente de revisión") : "Tu cuenta está activa. Puedes completar tu perfil privado ahora. La publicación sigue pendiente de revisión."}</p>
   <p className="mt-3 text-sm text-[var(--muted)]">Crear una cuenta no publica tu perfil ni acredita tu identidad. La aprobación y la verificación son pasos separados.</p>
   {!profile && <p className="mt-3 text-sm">Si ya enviaste el formulario, usa el mismo correo. Si no lo enviaste, <Link className="underline" href="/aplicar-profesional">completa tu solicitud</Link>. Aquí no mostramos solicitudes por coincidencia de correo.</p>}
  </section>
  {!profile && <ProfessionalDraftForm initial={draft} />}
  <section className="rounded-xl border border-[var(--border)] bg-white p-6">
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
   <p className="mt-3 font-semibold">{profile?.headline || draft?.headline || "Tu presentación todavía está pendiente."}</p>
   <p className="mt-3 whitespace-pre-line">{profile?.bio || draft?.bio || "Describe a quién ayudas, qué servicio ofreces y tu experiencia real. No añadas credenciales que no puedas respaldar."}</p>
   {canEdit && <Link className="mt-4 inline-block font-bold underline" href="/panel-profesional/perfil">Editar mi perfil y presentación</Link>}
  </section>
  <section className="rounded-xl border border-[var(--border)] bg-white p-6">
   <h2 className="text-xl font-bold">Redes sociales y permisos</h2>
   <p className="mt-3">Puedes añadir enlaces a tus redes en tu perfil. Son enlaces de presentación, no cuentas conectadas.</p>
   <p className="mt-3 text-sm text-[var(--muted)]">La conexión para consultar estadísticas o preparar contenido necesita un flujo de autorización verificado por plataforma. No está habilitada en este recorrido. Nunca compartas contraseñas; cada permiso debe indicar su finalidad y cómo revocarlo.</p>
   {canEdit && <Link className="mt-4 inline-block underline" href="/panel-profesional/perfil">Añadir enlaces de mis redes</Link>}
  </section>
  {canEdit && <Link className="inline-block rounded-full bg-[var(--brand-blue)] px-6 py-3 font-bold text-white" href="/panel-profesional/oportunidades">Revisar mis oportunidades</Link>}
 </div>;
}
