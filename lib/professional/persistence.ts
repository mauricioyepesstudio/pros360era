import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProfessionalBySlug } from "@/lib/professional/public-profile";
import type { MyProfessionalProfile, ProfessionalProfileEditableFields } from "@/data/professional/types";

/**
 * Persistence seam for the professional's OWN self-service profile editor
 * (app/(account)/panel-profesional/perfil), mirroring lib/account/
 * persistence.ts's shape: no service-role key, every function relies on the
 * caller's own session via createSupabaseServerClient, and RLS
 * (select_own_professional_profile / update_own_professional_profile,
 * 0005) is the actual authorization boundary — the explicit
 * .eq("user_id", user.id) below is defense-in-depth, matching every other
 * function in this codebase's convention, not the only thing scoping the
 * query.
 */

const ownProfileColumns =
  "slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, is_approved, booking_url, photo_url, portfolio_url, website_url, social_links";

export async function getMyProfessionalProfile(): Promise<MyProfessionalProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("professional_profiles").select(ownProfileColumns).eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  // identity_verified is never readable from professional_profiles or
  // professional_verifications directly, even for the row's own owner —
  // `authenticated` holds zero grant on professional_verifications by
  // design (see 0006's RLS section). The professional finds out the exact
  // same way the public does: via professional_profiles_public, which only
  // ever has a row once is_approved = true. No row there means either "not
  // approved yet" or "approved but not verified" — both correctly render as
  // identityVerified: false here, never as an error or an unknown state.
  const publicView = await getPublicProfessionalBySlug(data.slug);

  return {
    slug: data.slug,
    category: data.category,
    isApproved: data.is_approved,
    identityVerified: publicView?.identityVerified ?? false,
    displayName: data.display_name,
    headline: data.headline,
    bio: data.bio,
    state: data.state,
    city: data.city,
    languages: data.languages ?? [],
    consultationMode: data.consultation_mode,
    isAcceptingClients: data.is_accepting_clients,
    bookingUrl: data.booking_url,
    photoUrl: data.photo_url,
    portfolioUrl: data.portfolio_url,
    websiteUrl: data.website_url,
    socialLinks: data.social_links ?? {},
  };
}

export type UpdateProfessionalProfileResult =
  | { saved: true }
  | { saved: false; reason: "SUPABASE_NOT_CONFIGURED" | "NOT_SIGNED_IN" | "MISSING_REQUIRED_FIELD" | "DB_ERROR"; error?: unknown };

/**
 * Writes only the columns the update_own_professional_profile RLS policy
 * and the column-level UPDATE grant (0005/0012/0015) actually allow a
 * professional to touch. category and is_approved are structurally
 * impossible to reach from here — ProfessionalProfileEditableFields omits
 * both at the type level, and even a hand-edited call site naming them
 * would be rejected server-side by
 * prevent_professional_profile_protected_field_self_change() and the grant,
 * independently of this function ever being correct.
 */
export async function updateMyProfessionalProfile(fields: ProfessionalProfileEditableFields): Promise<UpdateProfessionalProfileResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, reason: "SUPABASE_NOT_CONFIGURED" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false, reason: "NOT_SIGNED_IN" };

  const displayName = fields.displayName.trim();
  if (!displayName) return { saved: false, reason: "MISSING_REQUIRED_FIELD" };

  const { error } = await supabase
    .from("professional_profiles")
    .update({
      display_name: displayName,
      headline: fields.headline?.trim() || null,
      bio: fields.bio?.trim() || null,
      state: fields.state?.trim() || null,
      city: fields.city?.trim() || null,
      languages: fields.languages,
      consultation_mode: fields.consultationMode,
      is_accepting_clients: fields.isAcceptingClients,
      booking_url: fields.bookingUrl?.trim() || null,
      photo_url: fields.photoUrl?.trim() || null,
      portfolio_url: fields.portfolioUrl?.trim() || null,
      website_url: fields.websiteUrl?.trim() || null,
      social_links: fields.socialLinks,
    })
    .eq("user_id", user.id);

  return error ? { saved: false, reason: "DB_ERROR", error } : { saved: true };
}
