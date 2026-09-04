import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfessionalProfilePublic, ProfessionalWorkSamplePublic } from "@/data/professional/types";

const PROFILE_COLUMNS =
  "slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, identity_verified, photo_url, portfolio_url, website_url, social_links";

function mapProfileRow(row: Record<string, unknown>): ProfessionalProfilePublic {
  return {
    slug: row.slug as string,
    displayName: row.display_name as string,
    category: row.category as ProfessionalProfilePublic["category"],
    headline: (row.headline as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    languages: (row.languages as string[] | null) ?? [],
    consultationMode: row.consultation_mode as ProfessionalProfilePublic["consultationMode"],
    isAcceptingClients: row.is_accepting_clients as boolean,
    identityVerified: row.identity_verified as boolean,
    photoUrl: (row.photo_url as string | null) ?? null,
    portfolioUrl: (row.portfolio_url as string | null) ?? null,
    websiteUrl: (row.website_url as string | null) ?? null,
    socialLinks: (row.social_links as ProfessionalProfilePublic["socialLinks"] | null) ?? {},
  };
}

/**
 * Reads exactly one row from the `professional_profiles_public` database
 * view — never the `professional_profiles` base table, `profiles`, or
 * `auth.users`. Uses the caller's own session via createSupabaseServerClient
 * (anon key), the same pattern as every other read in lib/account/
 * persistence.ts — no service-role key, no RLS bypass. The view is already
 * the full security boundary (see 0005_evolusa_professional_foundation.sql's
 * SECURITY BOUNDARY comment): it's readable by both anonymous and
 * authenticated requests and only ever returns approved professionals, so
 * this function behaves identically for both.
 */
export async function getPublicProfessionalBySlug(slug: string): Promise<ProfessionalProfilePublic | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("professional_profiles_public")
    .select(PROFILE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;
  return mapProfileRow(data);
}

/**
 * Reads every row from `professional_profiles_public` for the public
 * directory at /profesionales. Same view, same security boundary, and same
 * anon-key server client as getPublicProfessionalBySlug — the view already
 * only ever returns approved professionals, so no extra filtering is needed
 * here either. Ordered by display_name for a stable, predictable listing.
 */
export async function getPublicProfessionals(): Promise<ProfessionalProfilePublic[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("professional_profiles_public")
    .select(PROFILE_COLUMNS)
    .order("display_name", { ascending: true });

  if (!data) return [];
  return data.map(mapProfileRow);
}

/**
 * Reads every work sample for one professional from
 * `professional_work_samples_public` (0017) — joined server-side to
 * is_approved = true professional_profiles, so a sample can never surface
 * before its owner's profile is approved. Ordered by sort_order for a
 * deterministic gallery order the professional controls.
 */
export async function getPublicWorkSamples(slug: string): Promise<ProfessionalWorkSamplePublic[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("professional_work_samples_public")
    .select("title, image_url, description, sort_order")
    .eq("professional_slug", slug)
    .order("sort_order", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    title: row.title,
    imageUrl: row.image_url,
    description: row.description,
  }));
}
