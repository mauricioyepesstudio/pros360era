"use server";

import { revalidatePath } from "next/cache";
import {
  completeRoadmapItem,
  recordLifeEvent,
  removeLifeEvent,
  saveOnboardingResponse,
  updateProfileFields,
} from "@/lib/account/persistence";
import type { RoadmapCategory, UserProfile } from "@/data/account/types";

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
