import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConsentDataCategory,
  DeclineReason,
  IntentReadiness,
  MemberOpportunityView,
  Opportunity,
  OpportunityProfessionalSummary,
  ProfessionalOpportunityView,
} from "@/data/opportunities/types";
import type { ConsultationMode } from "@/data/professional/types";
import {
  mapOpportunityProfessionalSummary,
  type OpportunityProfessionalRpcRow,
} from "@/lib/opportunities/professional-summary";

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

  const opportunity = data as { id: string; matched_professional_profile_id: string | null };
  const professionalSummaries = opportunity.matched_professional_profile_id
    ? await getMyOpportunityProfessionalSummaries(supabase)
    : [];
  return {
    saved: true as const,
    opportunityId: opportunity.id,
    matchedProfessionalCount: opportunity.matched_professional_profile_id ? 1 : 0,
    matchedProfessional: professionalSummaries.find((summary) => summary.opportunityId === opportunity.id) ?? null,
  };
}

async function getMyOpportunityProfessionalSummaries(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
): Promise<OpportunityProfessionalSummary[]> {
  const { data, error } = await supabase.rpc("get_my_opportunity_professionals");
  if (error || !data) return [];
  return (data as OpportunityProfessionalRpcRow[]).map(mapOpportunityProfessionalSummary);
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

/**
 * Milestone 04C — the member's own read of /conexiones. A plain RLS-scoped
 * select, not a new RPC: 0007 already grants authenticated SELECT on
 * opportunities under the "select_own_opportunities" policy
 * (member_id = auth.uid()), so no new grant or migration is needed for this
 * read. Filtered to ROUTED-or-later for the same reason
 * get_my_routed_opportunities() filters the same way — a bare CREATED row
 * (need submitted, not yet consented/routed) isn't a "connection" yet and
 * has nothing meaningful to show here.
 */
export async function getMyOpportunities(): Promise<MemberOpportunityView[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .in("status", ["ROUTED", "CONTACTED", "COMPLETED", "DECLINED"])
    .order("created_at", { ascending: false });

  const opportunityIds = (data ?? []).map((row) => row.id as string);
  const [{ data: receiptRows }, professionalSummaries] = await Promise.all([
    opportunityIds.length > 0
      ? supabase.from("consent_receipts").select("opportunity_id, data_categories").in("opportunity_id", opportunityIds)
      : Promise.resolve({ data: [] as { opportunity_id: string; data_categories: ConsentDataCategory[] }[] }),
    opportunityIds.length > 0 ? getMyOpportunityProfessionalSummaries(supabase) : Promise.resolve([]),
  ]);

  const categoriesByOpportunityId = new Map<string, ConsentDataCategory[]>();
  for (const receipt of receiptRows ?? []) {
    categoriesByOpportunityId.set(receipt.opportunity_id, receipt.data_categories ?? []);
  }
  const professionalByOpportunityId = new Map(professionalSummaries.map((summary) => [summary.opportunityId, summary]));

  return (data ?? []).map((row) => ({
    id: row.id,
    memberId: row.member_id,
    needId: row.need_id,
    professionalCategory: row.professional_category,
    state: row.state,
    city: row.city,
    preferredConsultationMode: row.preferred_consultation_mode,
    readiness: row.readiness,
    status: row.status,
    matchedProfessionalProfileId: row.matched_professional_profile_id,
    organicMatchScore: row.organic_match_score,
    createdAt: row.created_at,
    routedAt: row.routed_at,
    expiresAt: row.expires_at,
    contactedAt: row.contacted_at,
    completedAt: row.completed_at,
    declinedAt: row.declined_at,
    declinedBy: row.declined_by,
    declineReason: row.decline_reason,
    consentedDataCategories: categoriesByOpportunityId.get(row.id) ?? [],
    matchedProfessional: professionalByOpportunityId.get(row.id) ?? null,
  }));
}

/**
 * Milestone 04C — the professional's own read of /panel-profesional/oportunidades.
 * Thin wrapper over get_my_routed_opportunities(), mapped snake_case ->
 * camelCase into ProfessionalOpportunityView. Never queries professional_profiles,
 * profiles, or auth.users directly from this file — the RPC is the only
 * source, and it alone is responsible for gating every field by consent.
 */
export async function getMyRoutedOpportunitiesForProfessional(): Promise<ProfessionalOpportunityView[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.rpc("get_my_routed_opportunities");

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    opportunityId: row.opportunity_id as string,
    needId: (row.need_id as string | null) ?? null,
    status: row.status as ProfessionalOpportunityView["status"],
    effectiveStatus: row.effective_status as ProfessionalOpportunityView["effectiveStatus"],
    readiness: row.readiness as ProfessionalOpportunityView["readiness"],
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    memberName: (row.member_name as string | null) ?? null,
    contactEmail: (row.contact_email as string | null) ?? null,
    consentedDataCategories: (row.consented_data_categories as ConsentDataCategory[] | null) ?? [],
    createdAt: row.created_at as string,
    routedAt: (row.routed_at as string | null) ?? null,
    expiresAt: (row.expires_at as string | null) ?? null,
    contactedAt: (row.contacted_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    declinedAt: (row.declined_at as string | null) ?? null,
    declinedBy: (row.declined_by as ProfessionalOpportunityView["declinedBy"]) ?? null,
    declineReason: (row.decline_reason as ProfessionalOpportunityView["declineReason"]) ?? null,
  }));
}
