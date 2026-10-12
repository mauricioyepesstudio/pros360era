import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPreparedKit } from "@/data/professional/prepared-kits";
import { createHash } from "node:crypto";
import { professionalPlannerId } from "./identity";
import { parsePublishLog, publicationView, publishLogId, type PostPublication } from "./publishing";
import { parseProfessionalPlanner, plannerFromKit, professionalPlannerAllowed, professionalPlannerVersion, type ProfessionalPlanner } from "./validation";

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

export type PlannerInstagram = { username: string; canPublish: boolean } | null;
export type PlannerResult = {
  available: boolean;
  planner: ProfessionalPlanner;
  saved: boolean;
  proposedFromKit: boolean;
  instagram: PlannerInstagram;
  publications: Record<string, PostPublication>;
};
const unavailable: PlannerResult = { available: false, planner: { posts: [] }, saved: false, proposedFromKit: false, instagram: null, publications: {} };

/** Instagram account that will publish, and what already happened to each post (read under the owner's own session). */
async function publishingState(owner: NonNullable<Awaited<ReturnType<typeof plannerOwner>>>, planner: ProfessionalPlanner) {
  const logId = publishLogId(owner.user.id, (input) => createHash("sha256").update(input).digest("hex"));
  const [{ data: connection }, { data: log }] = await Promise.all([
    owner.db.from("social_connections").select("username, status, scopes").eq("user_id", owner.user.id).eq("provider", "instagram").maybeSingle(),
    owner.db.from("onboarding_responses").select("answers").eq("id", logId).eq("user_id", owner.user.id).maybeSingle(),
  ]);
  const instagram: PlannerInstagram = connection
    ? { username: connection.username, canPublish: connection.status === "ACTIVE" && Array.isArray(connection.scopes) && connection.scopes.includes("instagram_business_content_publish") }
    : null;
  return { instagram, publications: publicationView(planner, parsePublishLog(log?.answers), Date.now()) };
}

/**
 * The saved planner, or (first visit only) a proposal built from the
 * professional's prepared kit. The proposal is not stored until they save.
 */
export async function getMyProfessionalPlanner(today: string): Promise<PlannerResult> {
  const owner = await plannerOwner();
  if (!owner) return unavailable;
  const { data, error } = await owner.db
    .from("onboarding_responses")
    .select("answers")
    .eq("id", professionalPlannerId(owner.user.id))
    .eq("user_id", owner.user.id)
    .eq("roadmap_version", professionalPlannerVersion)
    .maybeSingle();
  if (error) return unavailable;
  const saved = parseProfessionalPlanner(data?.answers);
  if (saved) return { available: true, planner: saved, saved: true, proposedFromKit: false, ...(await publishingState(owner, saved)) };
  const kit = getPreparedKit(owner.user.app_metadata?.prepared_kit);
  const planner = kit ? plannerFromKit(kit, today) : { posts: [] };
  return { available: true, planner, saved: false, proposedFromKit: Boolean(kit), ...(await publishingState(owner, planner)) };
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
    : { saved: true, message: "Planner guardado." };
}
