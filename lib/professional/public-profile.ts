import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfessionalProfilePublic } from "@/data/professional/types";

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
    .select(
      "slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, identity_verified",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  return {
    slug: data.slug,
    displayName: data.display_name,
    category: data.category,
    headline: data.headline,
    bio: data.bio,
    state: data.state,
    city: data.city,
    languages: data.languages ?? [],
    consultationMode: data.consultation_mode,
    isAcceptingClients: data.is_accepting_clients,
    identityVerified: data.identity_verified,
  };
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
    .select(
      "slug, display_name, category, headline, bio, state, city, languages, consultation_mode, is_accepting_clients, identity_verified",
    )
    .order("display_name", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    slug: row.slug,
    displayName: row.display_name,
    category: row.category,
    headline: row.headline,
    bio: row.bio,
    state: row.state,
    city: row.city,
    languages: row.languages ?? [],
    consultationMode: row.consultation_mode,
    isAcceptingClients: row.is_accepting_clients,
    identityVerified: row.identity_verified,
  }));
}
