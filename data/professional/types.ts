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
export type ProfessionalSocialLinks = {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
};

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
  /** Real photo path/URL, or null — renders the EVOLUSA isotype placeholder, never a fabricated headshot. Added 0017. */
  photoUrl: string | null;
  /** Optional link to the professional's own portfolio/case-study site. Added 0017. */
  portfolioUrl: string | null;
  /** Optional link to the professional's own business website, distinct from portfolioUrl. Added 0017. */
  websiteUrl: string | null;
  /** Optional social links, all keys optional. Added 0017. */
  socialLinks: ProfessionalSocialLinks;
};

export type ProfessionalWorkSamplePublic = {
  title: string;
  imageUrl: string;
  description: string | null;
};

/**
 * Shape of a professional's OWN `professional_profiles` row, as read by the
 * self-service editor at /panel-profesional/perfil. Unlike
 * ProfessionalProfilePublic (which only ever exposes an is_approved = true
 * row through the public view), this reads the base table directly via the
 * `select_own_professional_profile` RLS policy (0005) — so it includes
 * fields the public view never does (isApproved) and fields that aren't
 * public-safe until an opportunity has already routed to this professional
 * (bookingUrl, per 0012's own reasoning for keeping it off
 * professional_profiles_public).
 *
 * category, isApproved, and identityVerified are read-only here by
 * construction of the database itself, not just a UI convention:
 * - category/isApproved: prevent_professional_profile_protected_field_self_change()
 *   (0005) rejects any self-UPDATE that changes either column, and the
 *   column-level GRANT never included them in the first place.
 * - identityVerified: professional_verifications (0006) grants the owning
 *   professional zero table access, by design (see that migration's RLS
 *   section) — this value is populated by a best-effort second read of
 *   professional_profiles_public by the professional's own slug (see
 *   lib/professional/self-profile.ts), the same "find out the same way the
 *   public does" mechanism 0006 documents, not a new grant.
 */
export type ProfessionalProfileSelf = {
  displayName: string;
  slug: string;
  category: ProfessionalCategoryId;
  isApproved: boolean;
  identityVerified: boolean;
  headline: string | null;
  bio: string | null;
  state: string | null;
  city: string | null;
  languages: readonly string[];
  consultationMode: ConsultationMode;
  isAcceptingClients: boolean;
  bookingUrl: string | null;
  photoUrl: string | null;
  portfolioUrl: string | null;
  websiteUrl: string | null;
  socialLinks: ProfessionalSocialLinks;
};

/**
 * The subset of ProfessionalProfileSelf a professional may actually change
 * via updateMyProfessionalProfile — deliberately excludes slug (no
 * self-service rename of the public URL in this milestone, avoids broken
 * bookmarks/links with no redirect story) plus the three read-only fields
 * above. Every key optional: the update function only writes columns
 * actually present in the object, same partial-update convention as
 * lib/account/persistence.ts#updateProfileFields.
 */
export type ProfessionalProfileSelfUpdate = Partial<
  Pick<
    ProfessionalProfileSelf,
    | "displayName"
    | "headline"
    | "bio"
    | "state"
    | "city"
    | "languages"
    | "consultationMode"
    | "isAcceptingClients"
    | "bookingUrl"
    | "photoUrl"
    | "portfolioUrl"
    | "websiteUrl"
    | "socialLinks"
  >
>;
