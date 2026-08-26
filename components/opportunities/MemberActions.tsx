"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import DeclineDialog from "@/components/opportunities/DeclineDialog";
import { getMemberActions } from "@/lib/opportunities/lifecycle";
import type { DeclineReason, EffectiveOpportunityStatus } from "@/data/opportunities/types";

type MemberActionsProps = {
  effectiveStatus: EffectiveOpportunityStatus;
  onConfirmCompletion: () => Promise<unknown>;
  onDecline: (reason: DeclineReason) => Promise<unknown>;
};

/**
 * "Todavía no" is local component state only — it is never sent to the
 * server and never calls any action. Refreshing the page brings the prompt
 * back, exactly as it should: nothing was ever recorded, per the explicit
 * "MUST NOT write a negative outcome" requirement.
 *
 * Receives only primitives + bound server-action references as props
 * (never the raw opportunity row) — see OpportunityCard.tsx's header
 * comment for why.
 */
export default function MemberActions({ effectiveStatus, onConfirmCompletion, onDecline }: MemberActionsProps) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();
  const actions = getMemberActions(effectiveStatus);

  if (actions.length === 0) return null;

  const showConfirmPrompt = actions.includes("CONFIRM_COMPLETION") && !dismissed;

  return (
    <div className="space-y-3">
      {showConfirmPrompt && <p className="font-semibold text-[var(--brand-navy)]">¿Recibiste la ayuda que necesitabas?</p>}
      <div className="flex flex-wrap items-center gap-3">
        {showConfirmPrompt && (
          <Button type="button" disabled={pending} onClick={() => startTransition(async () => { await onConfirmCompletion(); })}>
            Sí, recibí ayuda
          </Button>
        )}
        {showConfirmPrompt && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="min-h-11 rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-[var(--muted)] hover:bg-slate-100"
          >
            Todavía no
          </button>
        )}
        {actions.includes("DECLINE") && <DeclineDialog actor="MEMBER" onConfirm={async (reason) => { await onDecline(reason); }} />}
        {actions.includes("START_NEW_SEARCH") && <ButtonLink href="/roadmap">Buscar otra opción</ButtonLink>}
      </div>
    </div>
  );
}
