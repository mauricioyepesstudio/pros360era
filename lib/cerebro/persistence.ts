import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyProfessionalBusiness } from "@/lib/professional-business/persistence";
import { businessOwnerAllowed } from "@/lib/professional-business/validation";
import { generateDraft, type DraftResult } from "./engine";
import { voiceProfileId } from "./identity";
import { draftPlatforms, type DraftPlatform } from "./prompt";
import { parseVoiceProfile, voiceProfileVersion, type VoiceProfile } from "./voice-profile";

async function owner() {
  const db = await createSupabaseServerClient();
  if (!db) return null;
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return null;
  const [role, profile] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    db.from("professional_profiles").select("id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (role.error || profile.error || !businessOwnerAllowed(role.data?.role, Boolean(profile.data))) return null;
  return { db, user };
}

export async function getMyVoiceProfile(): Promise<{ available: boolean; voice: VoiceProfile | null }> {
  const context = await owner();
  if (!context) return { available: false, voice: null };
  const { data, error } = await context.db.from("onboarding_responses").select("answers").eq("id", voiceProfileId(context.user.id)).eq("user_id", context.user.id).eq("roadmap_version", voiceProfileVersion).maybeSingle();
  const voice = parseVoiceProfile(data?.answers);
  return { available: !error && (!data || Boolean(voice)), voice };
}

export async function saveMyVoiceProfile(input: unknown) {
  const voice = parseVoiceProfile(input);
  if (!voice) return { saved: false, message: "Completa cómo hablas y tu llamado a la acción, dentro de los límites de cada campo." };
  const context = await owner();
  if (!context) return { saved: false, message: "Necesitas tu sesión profesional y un perfil propio para guardar." };
  const { data, error } = await context.db.from("onboarding_responses").upsert({ id: voiceProfileId(context.user.id), user_id: context.user.id, answers: voice, selected_needs: [], roadmap_version: voiceProfileVersion }, { onConflict: "id" }).select("answers,user_id").single();
  const stored = parseVoiceProfile(data?.answers);
  if (error || data?.user_id !== context.user.id || JSON.stringify(stored) !== JSON.stringify(voice)) return { saved: false, message: "No pudimos confirmar el guardado. Tus respuestas siguen en el formulario." };
  return { saved: true, message: "Tu voz quedó guardada. El cerebro la usa en cada borrador que te propone." };
}

/** Borrador de prueba con la voz y el negocio guardados. Nunca publica nada. */
export async function draftWithMyVoice(input: { platform: unknown; topic: unknown }): Promise<DraftResult | { ok: false; reason: "not_ready"; message: string }> {
  const platform = draftPlatforms.find((p) => p === input.platform) as DraftPlatform | undefined;
  const topic = typeof input.topic === "string" ? input.topic.trim() : "";
  if (!platform || !topic || topic.length > 300) return { ok: false, reason: "not_ready", message: "Elige una red y escribe un tema de hasta 300 caracteres." };
  const [voice, business] = await Promise.all([getMyVoiceProfile(), getMyProfessionalBusiness()]);
  if (!voice.voice) return { ok: false, reason: "not_ready", message: "Guarda primero tu perfil de voz." };
  if (!business.business) return { ok: false, reason: "not_ready", message: "Guarda primero «Mi negocio y mi contenido»." };
  return generateDraft({ voice: voice.voice, business: business.business, request: { platform, topic } });
}
