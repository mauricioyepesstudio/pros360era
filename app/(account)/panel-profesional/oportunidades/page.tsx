import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import ProfessionalOpportunityCard from "@/components/professional/ProfessionalOpportunityCard";
import { getCurrentRole } from "@/lib/account/persistence";
import { getMyRoutedOpportunitiesForProfessional } from "@/lib/opportunities/persistence";

/**
 * Page-level role gate — a UX nicety, not the real security boundary.
 * get_my_routed_opportunities() (0008) already scopes every row to
 * professional_profiles.user_id = auth.uid(); a MEMBER-role account calling
 * it directly would simply get zero rows back, not a leak. This redirect
 * just keeps a non-professional from landing on an always-empty page.
 */
export default async function ProfessionalOpportunitiesPage() {
  const role = await getCurrentRole();
  if (role !== "PROFESSIONAL") redirect("/dashboard");

  const opportunities = await getMyRoutedOpportunitiesForProfessional();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Tus oportunidades"
        description="Miembros que fueron emparejados contigo, con la información que autorizaron compartir."
      />
      {opportunities.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[var(--brand-navy)]">No tienes nuevas oportunidades por ahora.</p>
          <p className="mx-auto mt-2 max-w-md leading-6 text-[var(--muted)]">
            Revisa esta página periódicamente — todavía no enviamos notificaciones automáticas.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {opportunities.map((opportunity) => (
            <ProfessionalOpportunityCard key={opportunity.opportunityId} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
