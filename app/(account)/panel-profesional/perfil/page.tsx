import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import ProfessionalProfileEditor from "@/components/professional/ProfessionalProfileEditor";
import { getCurrentRole } from "@/lib/account/persistence";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";

/**
 * Page-level role gate — same UX-nicety-not-security-boundary pattern as
 * panel-profesional/oportunidades/page.tsx: update_own_professional_profile
 * (0005) already scopes every row to user_id = auth.uid(), so a MEMBER-role
 * account landing here directly would just get a null profile back (see
 * the empty-state below), not a leak.
 */
export default async function ProfessionalSelfProfilePage() {
  const role = await getCurrentRole();
  if (role !== "PROFESSIONAL") redirect("/dashboard");

  const profile = await getMyProfessionalProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Tu perfil profesional"
        description="Esta es la información que ven los miembros de EVOLUSA emparejados contigo y, una vez aprobada, tu perfil público."
      />
      {profile ? (
        <ProfessionalProfileEditor profile={profile} />
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
