import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfessionalProfilePublic } from "@/data/professional/types";

/** Every column professional_profiles_public exposes (migration 0015 added the trailing four). Shared by every read below so the allowlist lives in exactly one place. */
const publicProfileColumns =
  "slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, identity_verified, photo_url, portfolio_url, website_url, social_links";

function mapPublicProfileRow(data: Record<string, unknown>): ProfessionalProfilePublic {
  return {
    slug: data.slug as string,
    displayName: data.display_name as string,
    category: data.category as ProfessionalProfilePublic["category"],
    headline: (data.headline as string | null) ?? null,
    bio: (data.bio as string | null) ?? null,
    state: (data.state as string | null) ?? null,
    city: (data.city as string | null) ?? null,
    languages: (data.languages as string[] | null) ?? [],
    consultationMode: data.consultation_mode as ProfessionalProfilePublic["consultationMode"],
    isAcceptingClients: data.is_accepting_clients as boolean,
    identityVerified: data.identity_verified as boolean,
    photoUrl: (data.photo_url as string | null) ?? null,
    portfolioUrl: (data.portfolio_url as string | null) ?? null,
    websiteUrl: (data.website_url as string | null) ?? null,
    socialLinks: (data.social_links as ProfessionalProfilePublic["socialLinks"] | null) ?? {},
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

  const { data } = await supabase.from("professional_profiles_public").select(publicProfileColumns).eq("slug", slug).maybeSingle();

  if (!data) return null;
  return mapPublicProfileRow(data);
}

/**
 * Batch read for the member's own /conexiones list (lib/opportunities/
 * persistence.ts#getMyOpportunities) — enriches each matched-professional
 * summary (from get_my_opportunity_professionals, authenticated-only) with
 * the same public-safe fields the /profesionales/[slug] page renders,
 * without widening that RPC's own column list. Same view, same is_approved
 * gate, same anon-key server client as every other read in this file — a
 * slug with no approved row simply produces no entry in the returned map,
 * never a partial/fabricated one.
 */
export async function getPublicProfessionalsBySlugs(slugs: readonly string[]): Promise<Map<string, ProfessionalProfilePublic>> {
  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Map();

  const { data } = await supabase.from("professional_profiles_public").select(publicProfileColumns).in("slug", uniqueSlugs);

  return new Map((data ?? []).map((row) => [row.slug as string, mapPublicProfileRow(row)]));
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

  const { data } = await supabase.from("professional_profiles_public").select(publicProfileColumns).order("display_name", { ascending: true });

  if (!data) return [];
  return data.map(mapPublicProfileRow);
}
