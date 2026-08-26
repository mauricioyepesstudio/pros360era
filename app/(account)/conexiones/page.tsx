import PageHeader from "@/components/account/PageHeader";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import ButtonLink from "@/components/ui/ButtonLink";
import { getMyOpportunities } from "@/lib/opportunities/persistence";

export default async function ConexionesPage() {
  const opportunities = await getMyOpportunities();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tus conexiones"
        title="Sigue el progreso de tus conexiones"
        description="Aquí puedes ver el estado de cada conexión con un profesional y qué es lo siguiente para ti."
      />
      {opportunities.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[var(--brand-navy)]">Todavía no tienes conexiones activas.</p>
          <p className="mx-auto mt-2 max-w-md leading-6 text-[var(--muted)]">
            Cuando encontremos una opción compatible, podrás seguir su progreso aquí.
          </p>
          <ButtonLink href="/roadmap" className="mt-5">
            Descubrir mi próximo paso
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-5">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
