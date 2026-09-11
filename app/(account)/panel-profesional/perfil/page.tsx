import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import ProfessionalProfileForm from "@/components/professional/ProfessionalProfileForm";
import { getCurrentRole } from "@/lib/account/persistence";
import { getMyProfessionalProfile } from "@/lib/professional/persistence";

/**
 * Page-level role gate — same UX-nicety-not-security-boundary pattern as
 * app/(account)/panel-profesional/oportunidades/page.tsx: the real
 * boundary is RLS (select_own_professional_profile /
 * update_own_professional_profile, 0005), scoped to
 * professional_profiles.user_id = auth.uid(). A MEMBER-role account calling
 * getMyProfessionalProfile directly would just get null back (no matching
 * row), not a leak. This redirect only keeps a non-professional from
 * landing on a page that can never show them anything.
 */
export default async function PanelProfesionalPerfilPage() {
  const role = await getCurrentRole();
  if (role !== "PROFESSIONAL") redirect("/dashboard");

  const profile = await getMyProfessionalProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Tu perfil"
        description="Esto es lo que ven los miembros de EVOLUSA cuando te recomendamos. La categoría y la aprobación son controladas por el equipo de EVOLUSA."
      />
      {profile ? (
        <ProfessionalProfileForm profile={profile} />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[var(--brand-navy)]">Todavía no tienes un perfil profesional configurado.</p>
          <p className="mx-auto mt-2 max-w-md leading-6 text-[var(--muted)]">
            Contacta al equipo de EVOLUSA para completar tu alta como profesional antes de poder editar tu perfil aquí.
          </p>
        </div>
      )}
    </div>
  );
}
