"use client";

import { useTransition } from "react";
import Button from "@/components/ui/Button";
import DeclineDialog from "@/components/opportunities/DeclineDialog";
import { getProfessionalActions } from "@/lib/opportunities/lifecycle";
import type { DeclineReason, EffectiveOpportunityStatus } from "@/data/opportunities/types";

type ProfessionalActionsProps = {
  effectiveStatus: EffectiveOpportunityStatus;
  onMarkContacted: () => Promise<unknown>;
  onDecline: (reason: DeclineReason) => Promise<unknown>;
};

/**
 * There is deliberately no "mark completed" branch here, ever — the action
 * union this reads from (ProfessionalAction, lib/opportunities/lifecycle.ts)
 * has no such member, matching that no mark_opportunity_completed RPC
 * exists at all. This isn't a hidden UI choice; it's structurally
 * impossible to render by construction.
 */
export default function ProfessionalActions({ effectiveStatus, onMarkContacted, onDecline }: ProfessionalActionsProps) {
  const [pending, startTransition] = useTransition();
  const actions = getProfessionalActions(effectiveStatus);

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.includes("MARK_CONTACTED") && (
        <Button type="button" disabled={pending} onClick={() => startTransition(async () => { await onMarkContacted(); })}>
          Marcar como contactado
        </Button>
      )}
      {actions.includes("DECLINE") && <DeclineDialog actor="PROFESSIONAL" onConfirm={async (reason) => { await onDecline(reason); }} />}
    </div>
  );
}
