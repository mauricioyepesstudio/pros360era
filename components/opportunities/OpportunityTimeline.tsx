import ProgressStep from "@/components/ui/ProgressStep";
import type { EffectiveOpportunityStatus } from "@/data/opportunities/types";

/**
 * Only rendered for the three states that represent real forward progress
 * — ROUTED, CONTACTED, COMPLETED. DECLINED and effective EXPIRED are
 * deliberately excluded: forcing either into a 3-step "progress" visual
 * would imply momentum that didn't happen. Those two states show their own
 * terminal headline/supporting copy instead (see data/opportunities/copy.ts).
 */
export default function OpportunityTimeline({ status }: { status: EffectiveOpportunityStatus }) {
  if (status !== "ROUTED" && status !== "CONTACTED" && status !== "COMPLETED") return null;

  const contactStatus = status === "ROUTED" ? "current" : "complete";
  const confirmStatus = status === "COMPLETED" ? "complete" : status === "CONTACTED" ? "current" : "upcoming";

  return (
    <ol className="space-y-4">
      <ProgressStep status="complete" title="Encontramos opción" />
      <ProgressStep status={contactStatus} title="Contacto iniciado" />
      <ProgressStep status={confirmStatus} title="Confirmar resultado" />
    </ol>
  );
}
