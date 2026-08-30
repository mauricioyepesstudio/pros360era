import {
  consentDataCategories,
  type ConsentDataCategory,
  type OpportunityProfessionalSummary,
} from "../../data/opportunities/types.ts";

export type OpportunityStartPhase =
  | { name: "form" }
  | {
      name: "error";
      message: string;
      retry: "form" | "consent";
      opportunityId?: string;
      matchedProfessional?: OpportunityProfessionalSummary | null;
    }
  | { name: "no-match" }
  | { name: "consent"; opportunityId: string; matchedProfessional: OpportunityProfessionalSummary | null }
  | { name: "done" };

export const defaultConsentDataCategories: readonly ConsentDataCategory[] = ["NAME", "CONTACT_EMAIL", "NEED_SUMMARY"];

export function normalizeOpportunityCity(city: string): string | null {
  const normalized = city.trim().replace(/\s+/g, " ");
  return normalized || null;
}

export function toggleConsentCategory(
  selected: readonly ConsentDataCategory[],
  category: ConsentDataCategory,
): ConsentDataCategory[] {
  const next = selected.includes(category) ? selected.filter((item) => item !== category) : [...selected, category];
  return consentDataCategories.filter((item) => next.includes(item));
}

export function canConfirmConsent(selected: readonly ConsentDataCategory[]): boolean {
  return selected.length > 0 && selected.every((category) => consentDataCategories.includes(category));
}

export function getOpportunityRetryPhase(phase: OpportunityStartPhase): OpportunityStartPhase {
  if (phase.name !== "error" || phase.retry === "form" || !phase.opportunityId) return { name: "form" };
  return { name: "consent", opportunityId: phase.opportunityId, matchedProfessional: phase.matchedProfessional ?? null };
}
