import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ConsentDataCategory, DeclineReason, IntentReadiness, Opportunity } from "@/data/opportunities/types";
import type { ConsultationMode } from "@/data/professional/types";

/**
 * Milestone 04A persistence seam — mirrors lib/account/persistence.ts:
 * no service-role key anywhere in this file, every function relies on the
 * caller's own session via createSupabaseServerClient. Unlike every other
 * function in lib/account/persistence.ts, neither function below performs
 * a direct table INSERT/UPDATE — both are thin wrappers around SECURITY
 * DEFINER RPC calls (supabase/migrations/0007_evolusa_opportunity_engine_v1.sql,
 * hardening pass). This is a deliberate change from this milestone's first
 * draft, which let createQualifiedOpportunity perform a plain, RLS-scoped
 * INSERT: that was judged too weak once the actual concern was named
 * explicitly — a member with a valid session but a client that skips this
 * file entirely (raw REST call with their own JWT) could otherwise have
 * inserted a row with a fabricated matched_professional_profile_id or
 * organic_match_score, and even though such a row was provably inert
 * (never routable without a real consent_receipts row), it would still
 * pollute the opportunities table itself — fake match records skew any
 * future demand analytics built on this data, regardless of whether they
 * could ever reach a real professional. authenticated now has ZERO
 * INSERT/UPDATE grant on opportunities; only these two SECURITY DEFINER
 * functions can ever write to it.
 */

/**
 * Client supplies only genuine user input: which need, an optional
 * voluntary city, preferred consultation mode, and readiness. Everything
 * authoritative — professional_category, matched_professional_profile_id,
 * organic_match_score, member state/language — is derived server-side
 * inside create_qualified_opportunity from auth.uid() and profiles, never
 * accepted as a parameter here or in the SQL function's own signature.
 */
export async function createQualifiedOpportunity(
  needId: string,
  city: string | null,
  preferredConsultationMode: ConsultationMode,
  readiness: IntentReadiness,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { data, error } = await supabase.rpc("create_qualified_opportunity", {
    p_need_id: needId,
    p_city: city,
    p_preferred_consultation_mode: preferredConsultationMode,
    p_readiness: readiness,
  });

  if (error || !data) return { saved: false as const, reason: "DB_ERROR" as const, error };

  const opportunity = data as { id: string; matched_professional_profile_id: string | null; organic_match_score: number | null };
  return {
    saved: true as const,
    opportunityId: opportunity.id,
    matchedProfessionalCount: opportunity.matched_professional_profile_id ? 1 : 0,
    organicScore: opportunity.organic_match_score,
  };
}

/**
 * Step 2 of the flow — consent, scoped to the one specific professional the
 * member already saw the reasons for (see docs/EVOLUSA-LEAD-OPPORTUNITY-
 * ENGINE.md's "Consent receipt" section for why consent is per-professional
 * and post-match, never a blanket pre-match grant). Delegates the actual
 * privileged write to the SECURITY DEFINER function in 0007 — this wrapper
 * never touches opportunities.status or consent_receipts directly.
 *
 * Deliberately takes no professionalProfileId parameter: accepting one from
 * the caller would let a tampered request redirect consent to a different
 * professional than the one actually matched. The SQL function reads
 * matched_professional_profile_id from the opportunity row itself — the
 * only value that can ever be consented to is the one create_qualified_
 * opportunity already computed and stored at CREATED time.
 */
export async function consentAndRouteOpportunity(opportunityId: string, dataCategories: readonly ConsentDataCategory[]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { data, error } = await supabase.rpc("consent_and_route_opportunity", {
    p_opportunity_id: opportunityId,
    p_data_categories: dataCategories,
  });

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const, result: data as Opportunity | null };
}

/**
 * Milestone 04B — the three lifecycle transition RPCs. Same shape as the
 * two above: no service-role key, no direct table write, every mutation
 * delegated to a SECURITY DEFINER function in
 * 0008_evolusa_opportunity_lifecycle_v1.sql that re-verifies the caller's
 * exact authority before touching anything.
 */

/** Professional-only — see 0008's mark_opportunity_contacted for the exact ownership/state/expiry checks. */
export async function markOpportunityContacted(opportunityId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { data, error } = await supabase.rpc("mark_opportunity_contacted", { p_opportunity_id: opportunityId });
  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const, result: data as Opportunity | null };
}

/** Member-only — see 0008's complete_opportunity. The professional has no equivalent action; see docs/EVOLUSA-OPPORTUNITY-LIFECYCLE.md. */
export async function completeOpportunity(opportunityId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { data, error } = await supabase.rpc("complete_opportunity", { p_opportunity_id: opportunityId });
  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const, result: data as Opportunity | null };
}

/**
 * Either party — the SQL function derives declined_by from which identity
 * auth.uid() actually matches (the opportunity's member, or its matched
 * professional's owning user) rather than trusting a client-supplied actor
 * label, and rejects a reason that doesn't belong to whichever actor it
 * resolved. See lib/opportunities/lifecycle.ts#isValidDeclineReason for the
 * client-side mirror used to disable invalid options in a future UI.
 */
export async function declineOpportunity(opportunityId: string, reason: DeclineReason) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { data, error } = await supabase.rpc("decline_opportunity", { p_opportunity_id: opportunityId, p_reason: reason });
  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const, result: data as Opportunity | null };
}
