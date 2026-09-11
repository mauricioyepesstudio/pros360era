import type { ServiceCategory } from "../compliance/claims";

export const professionalCategoryIds = ["BUSINESS_MARKETING", "BUSINESS_OPERATIONS", "NOTARY"] as const;
export type ProfessionalCategoryId = (typeof professionalCategoryIds)[number];

export const consultationModes = ["VIRTUAL", "IN_PERSON", "BOTH"] as const;
export type ConsultationMode = (typeof consultationModes)[number];

/**
 * Known keys rendered by ProfessionalProfileView / ProfessionalProfileForm.
 * The `social_links` jsonb column (migration 0015) imposes no constraint on
 * keys beyond "valid JSON object" — this type is the application-layer
 * allowlist of what actually gets rendered/edited; an unknown key stored by
 * some other path is simply never shown, never an error.
 */
export const socialLinkPlatforms = ["instagram", "facebook", "linkedin", "x"] as const;
export type SocialLinkPlatform = (typeof socialLinkPlatforms)[number];
export type ProfessionalSocialLinks = Partial<Record<SocialLinkPlatform, string>>;

export const socialLinkPlatformLabels: Record<SocialLinkPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

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
 *
 * photoUrl/portfolioUrl/websiteUrl/socialLinks (migration 0015) widen this
 * to 15 columns. Same non-negotiable exclusions as before: id, user_id,
 * is_approved, timestamps, and every professional_verifications internal
 * column still have no place here. booking_url is deliberately still NOT
 * part of this type — see 0012/0015's migration notes for why it stays off
 * the fully-public view.
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
  photoUrl: string | null;
  portfolioUrl: string | null;
  websiteUrl: string | null;
  socialLinks: ProfessionalSocialLinks;
};

/**
 * The professional's own read/write shape for the self-service profile
 * editor (app/(account)/panel-profesional/perfil). Distinct from
 * ProfessionalProfilePublic on purpose: this includes isApproved (an
 * internal moderation flag the public view never exposes) and every
 * editable field regardless of whether the profile is public yet, since the
 * owner needs to see/edit their own row before an operator ever approves
 * it. category and isApproved are included for READ-ONLY display only —
 * prevent_professional_profile_protected_field_self_change() (0005) and the
 * column-level UPDATE grant (0005/0012/0015) both independently reject a
 * client-side write to either, so no update path in this codebase ever
 * sends them. identityVerified is sourced from professional_profiles_public
 * (the same way the public finds out — see 0006's RLS comment), not from
 * professional_verifications directly: `authenticated` holds zero grant on
 * that table, by design, even for the professional's own row.
 */
export type MyProfessionalProfile = {
  slug: string;
  category: ProfessionalCategoryId;
  isApproved: boolean;
  identityVerified: boolean;
  displayName: string;
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

/** The subset of MyProfessionalProfile a professional may actually submit — never category/isApproved/slug/identityVerified. */
export type ProfessionalProfileEditableFields = Omit<MyProfessionalProfile, "slug" | "category" | "isApproved" | "identityVerified">;
