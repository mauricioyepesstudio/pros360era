import type { StageId } from "@/data/journey/types";
import type { ProfessionalCategoryId } from "@/data/professional/types";

/**
 * Milestone 04A scope only: the smallest V1 Need catalog, mirroring the
 * exact pattern already established for professional categories and
 * verification types (one MVP value set, widened later — not a config
 * flip). Reuses ProfessionalCategoryId directly rather than a parallel
 * ServiceCategory field: a Need's compliance category is always resolvable
 * via getProfessionalCategory(id).mapsToServiceCategory for any id in
 * possibleProfessionalCategories, so storing ServiceCategory here too would
 * just be a second place the same fact could drift.
 *
 * possibleProfessionalCategories may legitimately be empty for a future
 * Need (a recognized need EVOLUSA can talk about but can't yet route) —
 * that must never be read as implying live supply exists. It is never
 * empty for a V1 catalog entry, since only needs with real, live supply
 * are populated here at all (see docs/EVOLUSA-INTELLIGENCE-MATCH.md).
 */
export type NeedId = "BRANDING" | "WEBSITE";

export type Need = {
  id: NeedId;
  labelEs: string;
  descriptionEs: string;
  /** Where this need is most likely to surface in the existing Roadmap/Journey UI — a hint, not a gate. */
  roadmapStages: readonly StageId[];
  possibleProfessionalCategories: readonly ProfessionalCategoryId[];
  /** Mirrors serviceCompliance.requiresVerification for this need's category — drives the RegulatoryPolicy lookup, never guessed per-question. */
  regulated: boolean;
  /** True once a need's eligibility genuinely depends on which state governs it beyond simple service-area matching (e.g., a license valid in one state only). False for every V1 entry. */
  jurisdictionSensitive: boolean;
};

export const needs = [
  {
    id: "BRANDING",
    labelEs: "Definir mi marca",
    descriptionEs: "Ayuda para definir identidad de marca, mensaje y presencia visual del negocio.",
    roadmapStages: ["CRECE"],
    possibleProfessionalCategories: ["BUSINESS_MARKETING"],
    regulated: false,
    jurisdictionSensitive: false,
  },
  {
    id: "WEBSITE",
    labelEs: "Crear o mejorar mi sitio web",
    descriptionEs: "Ayuda para crear una presencia web clara que explique tu oferta y genere confianza.",
    roadmapStages: ["CRECE"],
    possibleProfessionalCategories: ["BUSINESS_MARKETING"],
    regulated: false,
    jurisdictionSensitive: false,
  },
] as const satisfies readonly Need[];

export function getNeed(id: string) {
  return needs.find((need) => need.id === id);
}
