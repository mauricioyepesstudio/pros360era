import type { ServiceCategory } from "../compliance/claims";

export const professionalCategoryIds = ["BUSINESS_MARKETING", "BUSINESS_OPERATIONS", "NOTARY"] as const;
export type ProfessionalCategoryId = (typeof professionalCategoryIds)[number];

export const consultationModes = ["VIRTUAL", "IN_PERSON", "BOTH"] as const;
export type ConsultationMode = (typeof consultationModes)[number];

/**
 * Milestone 01 scope only: id/label/group/service-category mapping. The
 * fuller shape sketched in EVOLUSA-TRUST-COMPLIANCE.md (verification
 * requirements, allowed/prohibited claims, jurisdiction rules, booking
 * constraints) is for when a REGULATED category is actually added —
 * deliberately not built now against a single non-regulated category.
 *
 * NOTARY (added 2026-09-01, migration 0013) is the first `group: "REGULATED"`
 * entry — see data/compliance/regulatory-policy.ts's NOTARY/FL row for the
 * verification requirement that group actually gates in SQL.
 */
export type ProfessionalCategory = {
  id: ProfessionalCategoryId;
  label: string;
  group: "REGULATED" | "SERVICE_BUSINESS";
  /** Links back to the existing marketing-copy compliance category this professional category corresponds to. */
  mapsToServiceCategory: ServiceCategory;
};

/**
 * Shape of a row read from the `professional_profiles_public` database view
 * (supabase/migrations/0006_evolusa_verified_v1.sql) — camelCase, matching
 * the project's existing convention of mapping snake_case DB rows into a
 * typed camelCase shape at the data-access boundary (see
 * lib/account/persistence.ts's UserProfile mapping). Exactly the 11 columns
 * the view exposes; nothing private (id, user_id, is_approved, timestamps,
 * and — critically — professional_verifications.status/verified_at/
 * reviewed_by/internal_notes) has a place in this type, by design. The view
 * only ever exposes identity_verified as a derived boolean; there is no
 * field here to accidentally populate with anything more.
 *
 * identityVerified is deliberately NOT joined by a second
 * notaryCommissionVerified (or similar) boolean as of migration 0013 —
 * the hard NOTARY eligibility gate lives entirely in SQL
 * (create_qualified_opportunity / consent_and_route_opportunity), which
 * reads professional_verifications directly and never goes through this
 * view or type. Exposing a public per-type verification boolean here is a
 * separate, not-yet-scoped product/UI decision (a NOTARY badge), flagged in
 * 0013's migration notes, not a security requirement — see that migration
 * for the reasoning.
 */
export type ProfessionalProfilePublic = {
  slug: string;
  displayName: string;
  category: ProfessionalCategoryId;
  headline: string | null;
  bio: string | null;
  state: string | null;
  city: string | null;
  languages: readonly string[];
  consultationMode: ConsultationMode;
  isAcceptingClients: boolean;
  identityVerified: boolean;
};
