import { CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import OpportunityStatus from "@/components/opportunities/OpportunityStatus";
import ExpirationIndicator from "@/components/opportunities/ExpirationIndicator";
import ConsentSummary from "@/components/opportunities/ConsentSummary";
import ProfessionalActions from "@/components/professional/ProfessionalActions";
import { declineOpportunityAction, markContactedAction } from "@/app/(account)/actions";
import { getNeed } from "@/data/needs/catalog";
import { statusLabels } from "@/data/opportunities/copy";
import type { ProfessionalOpportunityView } from "@/data/opportunities/types";

/**
 * Everything shown here comes from get_my_routed_opportunities() alone
 * (lib/opportunities/persistence.ts#getMyRoutedOpportunitiesForProfessional)
 * — no separate query against profiles, professional_profiles, or
 * auth.users from this component or its data source. Match reasons are
 * fixed, safe, user-facing sentences derived only from fields the RPC
 * already returns (never organic_match_score, which this RPC's own column
 * list excludes by construction — there is nothing to accidentally expose).
 *
 * memberName/contactEmail/city/state are rendered as-is, with no extra
 * client-side gating: the RPC's own CASE expressions already null out any
 * field the member didn't consent to share, so "the value exists" and "it
 * was consented" are the same fact by construction — there is no unconsented
 * path for one of these to be non-null.
 */
export default function ProfessionalOpportunityCard({ opportunity }: { opportunity: ProfessionalOpportunityView }) {
  const need = opportunity.needId ? getNeed(opportunity.needId) : null;

  const matchReasons = [
    "Coincide con el tipo de ayuda que buscas.",
    ...(opportunity.city || opportunity.state ? ["Trabaja en tu área."] : []),
    "Actualmente está aceptando nuevas oportunidades.",
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Nueva oportunidad</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--brand-navy)]">{need?.labelEs ?? "Necesidad general"}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OpportunityStatus status={opportunity.effectiveStatus} />
          <ExpirationIndicator status={opportunity.status} expiresAt={opportunity.expiresAt} />
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm leading-6 text-[var(--muted)]">
        {matchReasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2">
            <CheckCircle2 aria-hidden size={16} className="mt-0.5 shrink-0 text-[var(--success)]" />
            {reason}
          </li>
        ))}
      </ul>

      {opportunity.effectiveStatus === "COMPLETED" && (
        <p className="mt-4 text-sm font-semibold text-[var(--success)]">El miembro confirmó que recibió ayuda.</p>
      )}
      {(opportunity.effectiveStatus === "DECLINED" || opportunity.effectiveStatus === "EXPIRED") && (
        <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{statusLabels[opportunity.effectiveStatus]} — no se requiere ninguna acción.</p>
      )}

      {(opportunity.memberName || opportunity.contactEmail || opportunity.city || opportunity.state) && (
        <div className="mt-5 space-y-1 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6">
          {opportunity.memberName && (
            <p>
              <span className="font-semibold text-[var(--brand-navy)]">Nombre:</span> {opportunity.memberName}
            </p>
          )}
          {opportunity.contactEmail && (
            <p>
              <span className="font-semibold text-[var(--brand-navy)]">Correo:</span> {opportunity.contactEmail}
            </p>
          )}
          {(opportunity.city || opportunity.state) && (
            <p>
              <span className="font-semibold text-[var(--brand-navy)]">Ubicación:</span> {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      )}

      <div className="mt-5">
        <ConsentSummary categories={opportunity.consentedDataCategories} heading="Información que puedes ver" />
      </div>

      <div className="mt-6">
        <ProfessionalActions
          effectiveStatus={opportunity.effectiveStatus}
          onMarkContacted={markContactedAction.bind(null, opportunity.opportunityId)}
          onDecline={declineOpportunityAction.bind(null, opportunity.opportunityId)}
        />
      </div>
    </Card>
  );
}
