"use server";
import { draftWithMyVoice } from "@/lib/cerebro/persistence";
import { plannerCaptionLimit } from "@/lib/professional-planner/validation";
type SuggestionResult = { ok: true; posts: { title: string; caption: string }[] } | { ok: false; error: string };
/** One private draft per request; no publishing or fallback generation. */
export async function generatePlannerIdeasAction(topic: string): Promise<SuggestionResult> {
  if (typeof topic !== "string" || topic.trim().length < 8 || topic.trim().length > 240) {
    return { ok: false, error: "Describe un tema de entre 8 y 240 caracteres." };
  }
  const result = await draftWithMyVoice({ platform: "instagram", topic: topic.trim() });
  if (!result.ok) return { ok: false, error: result.message };
  if (result.draft.compliance.status !== "ok") return { ok: false, error: "El borrador necesita revisión de cumplimiento. Ajusta el tema antes de volver a generar." };
  const caption = [result.draft.caption, result.draft.hashtags.map(tag => "#" + tag).join(" ")].filter(Boolean).join("\n\n");
  if (caption.length > plannerCaptionLimit) return { ok: false, error: "El texto completo supera el límite del planner. Pide un borrador más breve; el aviso obligatorio debe conservarse." };
  return { ok: true, posts: [{ title: result.draft.idea.slice(0, 140) || "Borrador para revisar", caption }] };
}
