"use client";

import { useState, useTransition } from "react";
import { createOpportunityAction, consentAndRouteOpportunityAction } from "@/app/(account)/actions";
import type { ConsentDataCategory, IntentReadiness } from "@/data/opportunities/types";
import type { ConsultationMode } from "@/data/professional/types";
import type { NeedId } from "@/data/needs/catalog";
import OpportunityStartForm from "@/components/opportunities/start/OpportunityStartForm";
import OpportunityConsentStep from "@/components/opportunities/start/OpportunityConsentStep";
import OpportunityStartResult from "@/components/opportunities/start/OpportunityStartResult";
import { getOpportunityFailureMessage } from "@/lib/opportunities/errors";
import {
  canConfirmConsent,
  defaultConsentDataCategories,
  getOpportunityRetryPhase,
  normalizeOpportunityCity,
  toggleConsentCategory,
  type OpportunityStartPhase,
} from "@/lib/opportunities/start";

type NeedOption = { id: NeedId; labelEs: string; descriptionEs: string };

/**
 * Milestone 04D — the previously-missing UI for create_qualified_opportunity
 * / consent_and_route_opportunity (see docs/EVOLUSA-OPPORTUNITY-EXPERIENCE.md's
 * "What remains deferred"). Milestone 04E adds an allowlisted public summary
 * of the matched professional through a member-owned RPC. Internal profile
 * ids and organic_match_score still never reach this Client Component.
 */
export default function NewOpportunityFlow({ needs }: { needs: readonly NeedOption[] }) {
  const [phase, setPhase] = useState<OpportunityStartPhase>({ name: "form" });
  const [needId, setNeedId] = useState<NeedId | "">(needs[0]?.id ?? "");
  const [city, setCity] = useState("");
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>("VIRTUAL");
  const [readiness, setReadiness] = useState<IntentReadiness>("CONSIDERING");
  const [categories, setCategories] = useState<ConsentDataCategory[]>([...defaultConsentDataCategories]);
  const [pending, startTransition] = useTransition();

  function toggleCategory(category: ConsentDataCategory) {
    setCategories((current) => toggleConsentCategory(current, category));
  }

  function handleSubmitNeed() {
    if (!needId) return;
    startTransition(async () => {
      const result = await createOpportunityAction(needId, normalizeOpportunityCity(city), consultationMode, readiness);
      if (!result.saved) {
        setPhase({ name: "error", message: getOpportunityFailureMessage(result.reason), retry: "form" });
        return;
      }
      if (result.matchedProfessionalCount === 0) {
        setPhase({ name: "no-match" });
        return;
      }
      setPhase({ name: "consent", opportunityId: result.opportunityId, matchedProfessional: result.matchedProfessional });
    });
  }

  function handleConfirmConsent(opportunityId: string) {
    if (!canConfirmConsent(categories)) return;
    startTransition(async () => {
      const result = await consentAndRouteOpportunityAction(opportunityId, categories);
      setPhase(
        result.saved
          ? { name: "done" }
          : {
              name: "error",
              message: getOpportunityFailureMessage(result.reason),
              retry: "consent",
              opportunityId,
              matchedProfessional: phase.name === "consent" ? phase.matchedProfessional : null,
            },
      );
    });
  }

  if (phase.name === "error") {
    return <OpportunityStartResult kind="error" message={phase.message} onRetry={() => setPhase(getOpportunityRetryPhase(phase))} />;
  }

  if (phase.name === "no-match") {
    return <OpportunityStartResult kind="no-match" />;
  }

  if (phase.name === "done") {
    return <OpportunityStartResult kind="done" />;
  }

  if (phase.name === "consent") {
    return (
      <OpportunityConsentStep
        selected={categories}
        pending={pending}
        onToggle={toggleCategory}
        onConfirm={() => handleConfirmConsent(phase.opportunityId)}
        matchedProfessional={phase.matchedProfessional}
      />
    );
  }

  return (
    <OpportunityStartForm
      needs={needs}
      needId={needId}
      city={city}
      consultationMode={consultationMode}
      readiness={readiness}
      pending={pending}
      onNeedChange={setNeedId}
      onCityChange={setCity}
      onConsultationModeChange={setConsultationMode}
      onReadinessChange={setReadiness}
      onSubmit={handleSubmitNeed}
    />
  );
}
