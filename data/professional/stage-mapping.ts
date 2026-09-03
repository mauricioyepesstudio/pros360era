import { services } from "@/data/services/services";
import { journeyStages } from "@/data/journey/stages";
import { professionalCategories } from "./categories";

/**
 * Derives, for each professional category, which journey stages it's
 * relevant to — not a separately-maintained list, so it can never drift
 * from services.ts's own category/stageIds fields. A category with no
 * matching enabled service (e.g. NOTARY, which has no services.ts entry
 * yet) simply maps to an empty stage list; callers should treat that as
 * "not stage-specific" rather than an error.
 */
export function getStagesForProfessionalCategory(categoryId: string): string[] {
  const category = professionalCategories.find((item) => item.id === categoryId);
  if (!category) return [];

  const stageIds = new Set<string>();
  for (const service of services) {
    if (service.category === category.mapsToServiceCategory) {
      for (const stageId of service.stageIds) stageIds.add(stageId);
    }
  }

  return journeyStages
    .filter((stage) => stageIds.has(stage.id))
    .sort((a, b) => a.order - b.order)
    .map((stage) => stage.id);
}

export const journeyStageOptions = journeyStages.map((stage) => ({
  id: stage.id,
  label: stage.shortLabel,
}));
