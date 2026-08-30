import Card from "@/components/ui/Card";
import OpportunityStatus from "@/components/opportunities/OpportunityStatus";
import OpportunityTimeline from "@/components/opportunities/OpportunityTimeline";
import ExpirationIndicator from "@/components/opportunities/ExpirationIndicator";
import ConsentSummary from "@/components/opportunities/ConsentSummary";
import MemberActions from "@/components/opportunities/MemberActions";
import { completeOpportunityAction, declineOpportunityAction } from "@/app/(account)/actions";
import { getEffectiveStatus } from "@/lib/opportunities/lifecycle";
import { memberStateCopy } from "@/data/opportunities/copy";
import { getNeed } from "@/data/needs/catalog";
import { getProfessionalCategory } from "@/data/professional/categories";
import type { MemberOpportunityView } from "@/data/opportunities/types";
import OpportunityProfessionalSummary from "@/components/opportunities/OpportunityProfessionalSummary";

/**
 * A Server Component on purpose, not "use client": `opportunity` (read via
 * getMyOpportunities) includes organicMatchScore, a field this milestone's
 * "no internal scoring" rule says must never reach the client — not just
 * "never rendered," but never serialized into a Client Component's props at
 * all. Only opportunity.id (a string) and effectiveStatus ever cross that
 * boundary, via MemberActions and the two bound server actions below.
 */
export default function OpportunityCard({ opportunity }: { opportunity: MemberOpportunityView }) {
  const effectiveStatus = getEffectiveStatus(opportunity.status, opportunity.expiresAt);
  if (effectiveStatus === "CREATED") return null;

  const copy = memberStateCopy[effectiveStatus];
  const need = getNeed(opportunity.needId);
  const category = getProfessionalCategory(opportunity.professionalCategory);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{category?.label ?? "Categoría profesional"}</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--brand-navy)]">{need?.labelEs ?? "Tu solicitud"}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OpportunityStatus status={effectiveStatus} />
          <ExpirationIndicator status={opportunity.status} expiresAt={opportunity.expiresAt} />
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-bold text-[var(--brand-navy)]">{copy.headline}</h3>
        <p className="mt-2 leading-6 text-[var(--muted)]">{copy.supporting}</p>
      </div>

      {effectiveStatus === "COMPLETED" && opportunity.completedAt && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Confirmado el {new Date(opportunity.completedAt).toLocaleDateString("es-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      {(effectiveStatus === "ROUTED" || effectiveStatus === "CONTACTED" || effectiveStatus === "COMPLETED") && (
        <div className="mt-6">
          <OpportunityTimeline status={effectiveStatus} />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {opportunity.matchedProfessional && <OpportunityProfessionalSummary professional={opportunity.matchedProfessional} />}
        <ConsentSummary categories={opportunity.consentedDataCategories} heading="Lo que autorizaste compartir" />
        <MemberActions
          effectiveStatus={effectiveStatus}
          onConfirmCompletion={completeOpportunityAction.bind(null, opportunity.id)}
          onDecline={declineOpportunityAction.bind(null, opportunity.id)}
        />
      </div>
    </Card>
  );
}
