import { createSupabaseServerClient } from "@/lib/supabase/server";
import { previewProfile } from "@/data/account/foundation";
import type { RoadmapCategory, UserGoal, UserProfile } from "@/data/account/types";

/**
 * Persistence seam between the deterministic roadmap engine and Supabase.
 * Every function degrades to the existing preview/demo behavior when
 * EVOLUSA's Supabase project isn't configured yet (see lib/auth/config.ts),
 * so pages that call these can be wired ahead of a live database existing.
 *
 * Table shapes match supabase/migrations/0001_evolusa_account_schema.sql.
 * This module never uses a service-role key — it relies on the caller's own
 * session via createSupabaseServerClient, so RLS enforces ownership.
 */

/**
 * Milestone 04C — the only place this repo reads profiles.role from a
 * client-facing code path, used solely to gate the professional-facing
 * /panel-profesional route in the account layout. Degrades to "MEMBER"
 * (never "PROFESSIONAL") whenever Supabase isn't configured or the caller
 * is signed out, matching every other function in this file's safe-default
 * convention — an unconfigured/signed-out request must never be treated as
 * a professional.
 */
export async function getCurrentRole(): Promise<"MEMBER" | "PROFESSIONAL" | "ADMIN"> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "MEMBER";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "MEMBER";

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return (data?.role as "MEMBER" | "PROFESSIONAL" | "ADMIN" | undefined) ?? "MEMBER";
}

export async function getCurrentProfile(): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return previewProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return previewProfile;

  const [{ data: profileRow }, { data: goalRows }, { data: needRows }, { data: completedRoadmapRows }, { data: eventRows }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_goals").select("id, label, category").eq("user_id", user.id),
      supabase.from("onboarding_responses").select("selected_needs").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("roadmap_items").select("catalog_item_id").eq("user_id", user.id).eq("status", "COMPLETED"),
      supabase.from("life_events").select("catalog_event_id").eq("user_id", user.id),
    ]);

  if (!profileRow) return previewProfile;

  return {
    id: user.id,
    name: profileRow.name ?? undefined,
    preferredLanguage: profileRow.preferred_language,
    state: profileRow.state ?? undefined,
    currentStage: profileRow.current_stage,
    goals: (goalRows ?? []) as UserGoal[],
    selectedNeeds: (needRows?.selected_needs ?? []) as RoadmapCategory[],
    businessStatus: profileRow.business_status,
    employment: profileRow.employment,
    progress: profileRow.progress,
    completedTaskIds: (completedRoadmapRows ?? []).map((row) => row.catalog_item_id as string),
    lifeEventIds: (eventRows ?? []).map((row) => row.catalog_event_id as string),
  };
}

/**
 * `answers` is stored as-is in the `answers` jsonb column. The public
 * OnboardingFlow component collects its own ad hoc shape (stage/time/goal/
 * employment/business/needs) rather than the lib/roadmap/types.ts
 * RoadmapAnswers shape (that typed shape belongs to the separate, currently
 * unused rules engine in lib/roadmap/rules.ts) — this function is
 * intentionally untyped on that field rather than force-fitting a mismatched
 * type onto it.
 */
export async function saveOnboardingResponse(answers: Record<string, unknown>, selectedNeeds: RoadmapCategory[]) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase.from("onboarding_responses").insert({
    user_id: user.id,
    answers,
    selected_needs: selectedNeeds,
    completed_at: new Date().toISOString(),
  });

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}

export async function completeRoadmapItem(catalogItemId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase.from("roadmap_items").upsert(
    {
      user_id: user.id,
      catalog_item_id: catalogItemId,
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,catalog_item_id" },
  );

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}

export async function updateProfileFields(fields: {
  currentStage?: UserProfile["currentStage"];
  businessStatus?: UserProfile["businessStatus"];
  employment?: UserProfile["employment"];
  name?: string;
  state?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(fields.currentStage && { current_stage: fields.currentStage }),
      ...(fields.businessStatus && { business_status: fields.businessStatus }),
      ...(fields.employment && { employment: fields.employment }),
      ...(fields.name && { name: fields.name }),
      ...(fields.state && { state: fields.state }),
    })
    .eq("id", user.id);

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}

export async function recordLifeEvent(catalogEventId: string, category: RoadmapCategory) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase.from("life_events").insert({
    user_id: user.id,
    catalog_event_id: catalogEventId,
    category,
  });

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}

export async function removeLifeEvent(catalogEventId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false as const, reason: "NOT_SIGNED_IN" as const };

  const { error } = await supabase
    .from("life_events")
    .delete()
    .eq("user_id", user.id)
    .eq("catalog_event_id", catalogEventId);

  return error ? { saved: false as const, reason: "DB_ERROR" as const, error } : { saved: true as const };
}
