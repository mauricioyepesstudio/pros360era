import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPreparedKit } from "@/data/professional/prepared-kits";
import { professionalPlannerId } from "./identity";
import { parseProfessionalPlanner, plannerFromKit, professionalPlannerAllowed, professionalPlannerVersion, type PlannerPost, type ProfessionalPlanner } from "./validation";

async function plannerOwner() {
  const db = await createSupabaseServerClient();
  if (!db) return null;
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (!user || authError) return null;
  const [{ data: profile, error: roleError }, { data: professional, error: professionalError }] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    db.from("professional_profiles").select("id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (roleError || professionalError || !professionalPlannerAllowed(profile?.role, Boolean(professional))) return null;
  return { db, user };
}

export type PlannerResult = { available: boolean; planner: ProfessionalPlanner; saved: boolean; proposedFromKit: boolean };

/**
 * The saved planner, or (first visit only) a proposal built from the
 * professional's prepared kit. The proposal is not stored until they save.
 */
export async function getMyProfessionalPlanner(today: string): Promise<PlannerResult> {
  const owner = await plannerOwner();
  if (!owner) return { available: false, planner: { posts: [] }, saved: false, proposedFromKit: false };
  const { data, error } = await owner.db
    .from("onboarding_responses")
    .select("answers")
    .eq("id", professionalPlannerId(owner.user.id))
    .eq("user_id", owner.user.id)
    .eq("roadmap_version", professionalPlannerVersion)
    .maybeSingle();
  if (error) return { available: false, planner: { posts: [] }, saved: false, proposedFromKit: false };
  const saved = parseProfessionalPlanner(data?.answers);
  if (saved) return { available: true, planner: saved, saved: true, proposedFromKit: false };
  const kit = getPreparedKit(owner.user.app_metadata?.prepared_kit);
  return kit
    ? { available: true, planner: plannerFromKit(kit, today), saved: false, proposedFromKit: true }
    : { available: true, planner: { posts: [] }, saved: false, proposedFromKit: false };
}

export async function saveMyProfessionalPlanner(input: unknown) {
  const planner = parseProfessionalPlanner(input);
  if (!planner) return { saved: false, message: "Revisa las publicaciones: cada una necesita título, red, formato y estado válidos." };
  const owner = await plannerOwner();
  if (!owner) return { saved: false, message: "Necesitas acceso profesional y un perfil propio para guardar tu planner." };
  const { data, error } = await owner.db
    .from("onboarding_responses")
    .upsert(
      { id: professionalPlannerId(owner.user.id), user_id: owner.user.id, answers: planner, selected_needs: [], roadmap_version: professionalPlannerVersion },
      { onConflict: "id" },
    )
    .select("answers")
    .single();
  return error || !parseProfessionalPlanner(data?.answers)
    ? { saved: false, message: "No pudimos guardar. Tus cambios siguen en pantalla." }
    : { saved: true, message: "Planner guardado. Nada se publica automáticamente." };
}

type PlannerDb = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

/** The saved planner under the owner's own session (RLS), for the publish route. */
export async function readSavedPlanner(db: PlannerDb, userId: string): Promise<ProfessionalPlanner | null> {
  const { data, error } = await db
    .from("onboarding_responses")
    .select("answers")
    .eq("id", professionalPlannerId(userId))
    .eq("user_id", userId)
    .eq("roadmap_version", professionalPlannerVersion)
    .maybeSingle();
  if (error) throw new Error("planner_unavailable");
  return parseProfessionalPlanner(data?.answers);
}

/**
 * After a real publication: the post becomes PUBLISHED with the date and time
 * it went out. Re-reads the planner first so edits saved meanwhile are kept.
 */
export async function markPlannerPostPublished(db: PlannerDb, userId: string, postId: string, when: { date: string; time: string }): Promise<PlannerPost | null> {
  const planner = await readSavedPlanner(db, userId);
  const post = planner?.posts.find((item) => item.id === postId);
  if (!planner || !post) return null;
  const updated: PlannerPost = { ...post, status: "PUBLISHED", date: when.date, time: when.time };
  const next = parseProfessionalPlanner({ posts: planner.posts.map((item) => (item.id === postId ? updated : item)) });
  if (!next) return null;
  const { error } = await db
    .from("onboarding_responses")
    .update({ answers: next })
    .eq("id", professionalPlannerId(userId))
    .eq("user_id", userId);
  return error ? null : updated;
}
