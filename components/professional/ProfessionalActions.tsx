"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import DeclineDialog from "@/components/opportunities/DeclineDialog";
import { getProfessionalActions } from "@/lib/opportunities/lifecycle";
import type { DeclineReason, EffectiveOpportunityStatus } from "@/data/opportunities/types";

type ProfessionalActionsProps = {
  effectiveStatus: EffectiveOpportunityStatus;
  onMarkContacted: () => Promise<{ url: string } | { error: string }>;
  onDecline: (reason: DeclineReason) => Promise<unknown>;
};

/**
 * There is deliberately no "mark completed" branch here, ever — the action
 * union this reads from (ProfessionalAction, lib/opportunities/lifecycle.ts)
 * has no such member, matching that no mark_opportunity_completed RPC
 * exists at all. This isn't a hidden UI choice; it's structurally
 * impossible to render by construction.
 *
 * "Marcar como contactado" now starts a Stripe Checkout redirect rather
 * than confirming contact directly — onMarkContacted returns a URL to
 * navigate to, or an error to show inline. The actual status change
 * happens later, server-side, once Stripe confirms payment.
 */
export default function ProfessionalActions({ effectiveStatus, onMarkContacted, onDecline }: ProfessionalActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = getProfessionalActions(effectiveStatus);

  if (actions.length === 0) return null;

  function handleMarkContacted() {
    setError(null);
    startTransition(async () => {
      const result = await onMarkContacted();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {actions.includes("MARK_CONTACTED") && (
          <Button type="button" disabled={pending} onClick={handleMarkContacted}>
            Marcar como contactado
          </Button>
        )}
        {actions.includes("DECLINE") && <DeclineDialog actor="PROFESSIONAL" onConfirm={async (reason) => { await onDecline(reason); }} />}
      </div>
      {error && <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
    </div>
  );
}
