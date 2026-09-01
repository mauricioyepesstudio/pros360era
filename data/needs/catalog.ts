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
export type NeedId = "BRANDING" | "WEBSITE" | "CRM_SETUP" | "NOTARIZE_DOCUMENT";

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
  /** False until the matching migration actually lands live (need_id/professional_category CHECK constraints + the create_qualified_opportunity SQL case, supabase/migrations/0007 and its successors). A Need can exist in this catalog — for docs, for a UI preview, for a migration draft — before it's selectable. Consumers that call the live create_qualified_opportunity RPC (e.g. app/(account)/conexiones/nueva) MUST filter on this before rendering the option, or a real user can submit a need_id the database will reject. */
  liveInDatabase: boolean;
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
    liveInDatabase: true,
  },
  {
    id: "WEBSITE",
    labelEs: "Crear o mejorar mi sitio web",
    descriptionEs: "Ayuda para crear una presencia web clara que explique tu oferta y genere confianza.",
    roadmapStages: ["CRECE"],
    possibleProfessionalCategories: ["BUSINESS_MARKETING"],
    regulated: false,
    jurisdictionSensitive: false,
    liveInDatabase: true,
  },
  {
    id: "CRM_SETUP",
    labelEs: "Organizar mi seguimiento de clientes",
    descriptionEs: "Ayuda para organizar contactos, oportunidades y seguimiento comercial de tu negocio.",
    roadmapStages: ["CRECE", "EVOLUCIONA"],
    possibleProfessionalCategories: ["BUSINESS_OPERATIONS"],
    regulated: false,
    jurisdictionSensitive: false,
    // Migration 0011 applied live 2026-09-01 (see docs/CURRENT-STATE.md,
    // Milestone 04F) — professional_profiles/opportunities CHECK constraints
    // and create_qualified_opportunity's need_id->category case both widened
    // and verified live. Selectable now. Still needs at least one real
    // approved BUSINESS_OPERATIONS professional before a match can succeed
    // (create_qualified_opportunity fails closed with no eligible candidate
    // otherwise, same as any need with zero live supply).
    liveInDatabase: true,
  },
  {
    id: "NOTARIZE_DOCUMENT",
    labelEs: "Notarizar un documento",
    descriptionEs:
      "Conexión con un notario público con comisión verificada por EVOLUSA en tu estado para notarizar un documento.",
    roadmapStages: ["PROTEGETE"],
    possibleProfessionalCategories: ["NOTARY"],
    regulated: true,
    // A Florida notary commission is valid only in Florida — this need's
    // eligibility genuinely depends on which state governs it, not just
    // simple service-area matching. First V1 entry where this is true.
    jurisdictionSensitive: true,
    // Migration 0013 (NOTARY as a REGULATED professional category, the
    // matching data/compliance/regulatory-policy.ts NOTARY/FL row, and the
    // hard verification gate inside create_qualified_opportunity /
    // consent_and_route_opportunity) is AUTHORED, NOT YET APPLIED. Flip this
    // to true only after that migration is applied and live-verified — same
    // gate CRM_SETUP sat behind until 0011 shipped. Even once true, this
    // need has zero live supply until an operator manually verifies a real
    // notary's Florida commission (out of scope for 0013 itself) and inserts
    // a VERIFIED professional_verifications row — until then,
    // create_qualified_opportunity correctly returns no match, never a
    // false one.
    liveInDatabase: false,
  },
] as const satisfies readonly Need[];

export function getNeed(id: string) {
  return needs.find((need) => need.id === id);
}

/** The subset of `needs` the live database can actually route today — use this (never the raw `needs` export) anywhere that renders a user-selectable option feeding create_qualified_opportunity. */
export const liveNeeds = needs.filter((need) => need.liveInDatabase);
