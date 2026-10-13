"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProposedPost = { title: string; caption: string };
type SuggestionResult = { ok: true; posts: ProposedPost[] } | { ok: false; error: string };

/** Pilot-only text proposals. No publication, no token sharing, no silent fabricated AI. */
export async function generatePlannerIdeasAction(topic: string): Promise<SuggestionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "No hay conexión segura con tu cuenta." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para generar contenido." };
  const profile = await getMyProfessionalProfile();
  if (!profile) return { ok: false, error: "Configura primero tu perfil profesional." };
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: "La generación con IA todavía no está configurada para el piloto." };
  const subject = topic.trim().slice(0, 240);
  if (subject.length < 8) return { ok: false, error: "Describe el tema con al menos 8 caracteres." };

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 15000, maxRetries: 0 });
    const message = await anthropic.messages.create({
      model: process.env.EVOLUSA_PILOT_TEXT_MODEL || "claude-sonnet-4-5",
      max_tokens: 950,
      temperature: 0.7,
      system: "Eres estratega editorial para profesionales en Estados Unidos. Produce exactamente tres ideas diferentes en español, con título y caption útiles, originales y editables. No inventes testimonios, credenciales, licencias, precios, resultados, casos reales, plazos ni garantías. No des asesoría legal, migratoria, médica o financiera personalizada. No publiques nada. Devuelve SOLO JSON: {\"posts\":[{\"title\":\"...\",\"caption\":\"...\"}]}",
      messages: [{ role: "user", content: JSON.stringify({
        brand: profile.displayName.slice(0, 120),
        category: profile.category,
        headline: profile.headline?.slice(0, 240) || "",
        bio: profile.bio?.slice(0, 500) || "",
        topic: subject,
        instructions: "Tres propuestas diferentes para que el profesional elija y edite antes de aprobar. Sin datos inventados.",
      }) }],
    });
    const raw = message.content.filter((block) => block.type === "text").map((block) => block.text).join("").trim();
    const parsed: unknown = JSON.parse(raw.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, ""));
    if (!parsed || typeof parsed !== "object" || !("posts" in parsed) || !Array.isArray(parsed.posts)) throw new Error("invalid format");
    const posts = parsed.posts.filter((post: unknown): post is ProposedPost => Boolean(post && typeof post === "object" && "title" in post && "caption" in post && typeof post.title === "string" && typeof post.caption === "string")).slice(0, 3).map((post: ProposedPost) => ({ title: post.title.slice(0, 140), caption: post.caption.slice(0, 1800) }));
    if (posts.length !== 3) throw new Error("invalid ideas");
    return { ok: true, posts };
  } catch {
    return { ok: false, error: "No fue posible generar propuestas ahora. Inténtalo de nuevo más tarde." };
  }
}
