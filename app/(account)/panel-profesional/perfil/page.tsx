import GoogleAccountLink from "@/components/professional/GoogleAccountLink";
import { getOwnGoogleLinkState } from "@/lib/account/google-link-state";
import ButtonLink from "@/components/ui/ButtonLink";
import {getMyBrandFile} from "@/lib/cerebro/persistence";
import PageHeader from "@/components/account/PageHeader";
import ProfessionalProfileEditor from "@/components/professional/ProfessionalProfileEditor";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";

/**
 * Page-level role gate — same UX-nicety-not-security-boundary pattern as
 * panel-profesional/oportunidades/page.tsx: update_own_professional_profile
 * (0005) already scopes every row to user_id = auth.uid(), so a MEMBER-role
 * account landing here directly would just get a null profile back (see
 * the empty-state below), not a leak.
 */
export default async function ProfessionalSelfProfilePage() {
  await requireProfessionalArea();

  const [profile, file, accountAccess] = await Promise.all([getMyProfessionalProfile(), getMyBrandFile(), getOwnGoogleLinkState()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Tu perfil profesional"
        description="Esta es la información que ven los miembros de EVOLUSA emparejados contigo y, una vez aprobada, tu perfil público."
      />
      {profile ? (
        <><section id="mi-marca" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5"><h2 className="text-lg font-bold text-[var(--brand-navy)]">Mi marca</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tu negocio, tu voz y tu brandbook ahora están en «Mi marca». {file.ready ? "Tu expediente está completo." : `Te falta: ${file.missing.join(", ")}.`}</p><ButtonLink href="/panel-profesional/marca" className="mt-4">{file.ready ? "Ver mi marca" : "Completar mi marca"}</ButtonLink></section><ProfessionalProfileEditor profile={profile} /><GoogleAccountLink state={accountAccess} /></>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[var(--brand-navy)]">Todavía no encontramos tu perfil profesional.</p>
          <p className="mx-auto mt-2 max-w-md leading-6 text-[var(--muted)]">
            Si crees que esto es un error, contáctanos para que podamos revisarlo.
          </p>
        </div>
      )}
    </div>
  );
}
