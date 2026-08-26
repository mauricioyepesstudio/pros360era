"use server";

import { revalidatePath } from "next/cache";
import {
  completeRoadmapItem,
  recordLifeEvent,
  removeLifeEvent,
  saveOnboardingResponse,
  updateProfileFields,
} from "@/lib/account/persistence";
import {
  completeOpportunity,
  declineOpportunity,
  markOpportunityContacted,
} from "@/lib/opportunities/persistence";
import type { RoadmapCategory, UserProfile } from "@/data/account/types";
import type { DeclineReason } from "@/data/opportunities/types";

export async function completeRoadmapItemAction(catalogItemId: string) {
  const result = await completeRoadmapItem(catalogItemId);
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  return result;
}

export async function toggleLifeEventAction(catalogEventId: string, category: RoadmapCategory, active: boolean) {
  const result = active ? await recordLifeEvent(catalogEventId, category) : await removeLifeEvent(catalogEventId);
  revalidatePath("/dashboard");
  return result;
}

/**
 * Called once, client-side, the first time an account page mounts after a
 * successful signup/login that followed the public onboarding flow. Persists
 * the raw onboarding answers plus the profile fields that map cleanly onto
 * `profiles` columns. The deterministic roadmap engine still owns
 * recommendation logic — this only saves what the user told us.
 */
export async function syncOnboardingAction(
  answers: Record<string, unknown>,
  selectedNeeds: RoadmapCategory[],
  profileUpdates: {
    currentStage?: UserProfile["currentStage"];
    businessStatus?: UserProfile["businessStatus"];
    employment?: UserProfile["employment"];
  },
) {
  const onboardingResult = await saveOnboardingResponse(answers, selectedNeeds);
  const profileResult = await updateProfileFields(profileUpdates);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/roadmap");
  return { onboardingResult, profileResult };
}

/**
 * Milestone 04C — thin wrappers over the Milestone 04B lifecycle RPCs.
 * These do not re-check who is allowed to call them: mark_opportunity_contacted,
 * complete_opportunity, and decline_opportunity (0008) each re-verify the
 * caller's exact authority from auth.uid() themselves and reject anything
 * else. This file's only job is to invoke the right RPC and revalidate the
 * pages that read its result — the database remains the sole authority.
 */
export async function markContactedAction(opportunityId: string) {
  const result = await markOpportunityContacted(opportunityId);
  revalidatePath("/panel-profesional/oportunidades");
  return result;
}

export async function completeOpportunityAction(opportunityId: string) {
  const result = await completeOpportunity(opportunityId);
  revalidatePath("/conexiones");
  return result;
}

export async function declineOpportunityAction(opportunityId: string, reason: DeclineReason) {
  const result = await declineOpportunity(opportunityId, reason);
  revalidatePath("/conexiones");
  revalidatePath("/panel-profesional/oportunidades");
  return result;
}
