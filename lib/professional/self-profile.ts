import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeSocialLinks, sanitizeUrl } from "@/lib/professional/profile-links";
import type { ProfessionalProfileSelf, ProfessionalProfileSelfUpdate, ProfessionalSocialLinks } from "@/data/professional/types";

/**
 * Self-service persistence for /panel-profesional/perfil — the professional
 * editing their OWN professional_profiles row. Distinct from
 * lib/professional/public-profile.ts (which only ever reads the public,
 * is_approved = true view for anyone) and from lib/account/persistence.ts
 * (which owns the `profiles` table, not `professional_profiles`).
 *
 * Never uses a service-role key — every read/write goes through the
 * caller's own session via createSupabaseServerClient, so
 * select_own_professional_profile / update_own_professional_profile (0005)
 * are the actual authorization boundary, exactly like every other
 * persistence module in this project.
 */

const SELF_COLUMNS =
  "display_name, slug, category, is_approved, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, booking_url, photo_url, portfolio_url, website_url, social_links";

function mapSelfRow(row: Record<string, unknown>, identityVerified: boolean): ProfessionalProfileSelf {
  return {
    displayName: row.display_name as string,
    slug: row.slug as string,
    category: row.category as ProfessionalProfileSelf["category"],
    isApproved: row.is_approved as boolean,
    identityVerified,
    headline: (row.headline as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    languages: (row.languages as string[] | null) ?? [],
    consultationMode: row.consultation_mode as ProfessionalProfileSelf["consultationMode"],
    isAcceptingClients: row.is_accepting_clients as boolean,
    bookingUrl: (row.booking_url as string | null) ?? null,
    photoUrl: (row.photo_url as string | null) ?? null,
    portfolioUrl: (row.portfolio_url as string | null) ?? null,
    websiteUrl: (row.website_url as string | null) ?? null,
    socialLinks: (row.social_links as ProfessionalSocialLinks | null) ?? {},
  };
}

/**
 * Returns null when Supabase isn't configured, the caller is signed out, or
 * the signed-in user has no professional_profiles row at all (e.g. a
 * PROFESSIONAL-role account provisioned but not yet given a profile row —
 * see the operator runbook at the end of 0005) — never throws for any of
 * these, matching this project's safe-default convention.
 */
export async function getMyProfessionalProfile(): Promise<ProfessionalProfileSelf | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("professional_profiles").select(SELF_COLUMNS).eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  // identity_verified is deliberately NOT readable from professional_profiles
  // or professional_verifications directly (0006 grants the owner zero
  // access to the verifications table). Best-effort second read of the
  // public view by this professional's own slug — the same "find out the
  // same way the public does" path 0006 documents. Only ever returns a row
  // once is_approved = true; an unapproved profile is treated as
  // not-yet-verified here, which is also the only state a verified badge
  // would ever be shown in anywhere else in the product.
  const { data: publicRow } = await supabase
    .from("professional_profiles_public")
    .select("identity_verified")
    .eq("slug", data.slug as string)
    .maybeSingle();

  return mapSelfRow(data, (publicRow?.identity_verified as boolean | undefined) ?? false);
}

/**
 * Updates only the columns present in `fields` — an omitted key is left
 * untouched, not overwritten with null (same partial-update convention as
 * lib/account/persistence.ts#updateProfileFields). slug, category,
 * is_approved are never accepted here — ProfessionalProfileSelfUpdate's
 * type already excludes them, and update_own_professional_profile (0005)
 * plus prevent_professional_profile_protected_field_self_change would
 * reject category/is_approved regardless even if a caller tried.
 */
export async function updateMyProfessionalProfile(fields: ProfessionalProfileSelfUpdate) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase
    .from("professional_profiles")
    .update({
      ...(fields.displayName !== undefined && { display_name: fields.displayName }),
      ...(fields.headline !== undefined && { headline: fields.headline }),
      ...(fields.bio !== undefined && { bio: fields.bio }),
      ...(fields.state !== undefined && { state: fields.state }),
      ...(fields.city !== undefined && { city: fields.city }),
      ...(fields.languages !== undefined && { languages: fields.languages }),
      ...(fields.consultationMode !== undefined && { consultation_mode: fields.consultationMode }),
      ...(fields.isAcceptingClients !== undefined && { is_accepting_clients: fields.isAcceptingClients }),
      ...(fields.bookingUrl !== undefined && { booking_url: sanitizeUrl(fields.bookingUrl) }),
      ...(fields.photoUrl !== undefined && { photo_url: sanitizeUrl(fields.photoUrl) }),
      ...(fields.portfolioUrl !== undefined && { portfolio_url: sanitizeUrl(fields.portfolioUrl) }),
      ...(fields.websiteUrl !== undefined && { website_url: sanitizeUrl(fields.websiteUrl) }),
      ...(fields.socialLinks !== undefined && { social_links: sanitizeSocialLinks(fields.socialLinks) }),
    })
    .eq("user_id", user.id);

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}
