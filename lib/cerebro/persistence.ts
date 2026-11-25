import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyProfessionalBusiness } from "@/lib/professional-business/persistence";
import { businessOwnerAllowed } from "@/lib/professional-business/validation";
import { generateDraft, type DraftResult } from "./engine";
import { brandKitId, voiceProfileId } from "./identity";
import { brandFileSteps, brandImageAllowed, brandKitVersion, normalizeHexColor, parseBrandKit, type BrandKit } from "./brand-kit";
import { checkDraft } from "./compliance";
import { readWebsiteSignals, type WebsiteSignals } from "./website-absorb";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { loadOwnerBrandReference } from "@/lib/professional-planner/owner-brand-source";
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

function brandParser(userId: string) {
  const supabaseUrl = getSupabaseEnv()?.url;
  return (input: unknown) => parseBrandKit(input, (url) => brandImageAllowed(url, userId, supabaseUrl));
}

export async function getMyBrandKit(): Promise<{ available: boolean; brand: BrandKit | null }> {
  const context = await owner();
  if (!context) return { available: false, brand: null };
  const { data, error } = await context.db.from("onboarding_responses").select("answers").eq("id", brandKitId(context.user.id)).eq("user_id", context.user.id).eq("roadmap_version", brandKitVersion).maybeSingle();
  const brand = brandParser(context.user.id)(data?.answers);
  // Una fila ilegible no bloquea la página: se puede volver a guardar encima.
  return { available: !error, brand };
}

export async function saveMyBrandKit(input: unknown) {
  const context = await owner();
  if (!context) return { saved: false, message: "Necesitas tu sesión profesional y un perfil propio para guardar." };
  const brand = brandParser(context.user.id)(input);
  if (!brand) return { saved: false, message: "Revisa el brandbook: al menos un color, el nombre del encargado y, si subiste imágenes, la confirmación de que puedes usarlas." };
  const review = checkDraft([brand.about, brand.visualRules].join("\n"));
  if (review.status === "blocked") return { saved: false, message: `Tu descripción o tus reglas tienen un texto que EVOLUSA no permite publicar (${review.issues.filter((issue) => issue.level === "block").map((issue) => issue.message).join(" ")}). Quítalo antes de guardar.` };
  const { data, error } = await context.db.from("onboarding_responses").upsert({ id: brandKitId(context.user.id), user_id: context.user.id, answers: brand, selected_needs: [], roadmap_version: brandKitVersion }, { onConflict: "id" }).select("answers,user_id").single();
  const stored = brandParser(context.user.id)(data?.answers);
  if (error || data?.user_id !== context.user.id || JSON.stringify(stored) !== JSON.stringify(brand)) return { saved: false, message: "No pudimos confirmar el guardado. Tus cambios siguen en el formulario." };
  return { saved: true, message: "Tu brandbook quedó guardado. El cerebro lo usa en cada borrador y sus imágenes ya aparecen en el planner." };
}

/** Estado del expediente (negocio + voz + brandbook). Generar borradores exige los tres. */
export async function getMyBrandFile() {
  const [business, voice, brand] = await Promise.all([getMyProfessionalBusiness(), getMyVoiceProfile(), getMyBrandKit()]);
  return { business, voice, brand, ...brandFileSteps({ business: Boolean(business.business), voice: Boolean(voice.voice), brand: Boolean(brand.brand) }) };
}

export type BrandKitProposal = {
  colors: string[];
  fonts: string;
  about: string;
  website: WebsiteSignals | null;
  websiteError: string | null;
  instagram: string | null;
  sources: string[];
};

/**
 * Borrador de brandbook desde las cuentas enlazadas: la web del perfil (o la
 * que escriba) y el Instagram conectado. Solo PROPONE: no guarda nada.
 */
export async function proposeBrandKitFromAccounts(input: { websiteUrl?: unknown }): Promise<{ ok: true; proposal: BrandKitProposal } | { ok: false; message: string }> {
  const context = await owner();
  if (!context) return { ok: false, message: "Necesitas tu sesión profesional para leer tus cuentas." };
  const { data: profile } = await context.db.from("professional_profiles").select("photo_url,social_links,website_url").eq("user_id", context.user.id).maybeSingle();
  const websiteInput = typeof input.websiteUrl === "string" && input.websiteUrl.trim() ? input.websiteUrl : profile?.website_url;
  const [site, reference] = await Promise.all([
    websiteInput ? readWebsiteSignals(websiteInput) : Promise.resolve(null),
    profile ? loadOwnerBrandReference(context.user.id, { photo_url: profile.photo_url ?? null, social_links: profile.social_links }).catch(() => null) : Promise.resolve(null),
  ]);
  const sources: string[] = [];
  const colors: string[] = [];
  const accent = normalizeHexColor(reference?.accent);
  if (accent) { colors.push(accent); sources.push("Instagram conectado: color dominante de tus publicaciones"); }
  const website = site?.ok ? site.signals : null;
  if (website) {
    for (const color of website.colors) if (!colors.includes(color) && colors.length < 5) colors.push(color);
    sources.push("Tu web: " + new URL(website.url).hostname);
  }
  if (!sources.length) return { ok: false, message: site && !site.ok ? site.message : "Agrega tu web en «Mi perfil» o escríbela aquí, o conecta tu Instagram en Redes, para generar el borrador." };
  return {
    ok: true,
    proposal: {
      colors,
      fonts: website?.fonts.join(", ") ?? "",
      about: website?.description ?? "",
      website,
      websiteError: site && !site.ok ? site.message : null,
      instagram: reference ? reference.label.replace(/ · paleta sugerida$/, "") : null,
      sources,
    },
  };
}

/** Borrador con la voz, el negocio y el brandbook guardados. Nunca publica nada. */
export async function draftWithMyVoice(input: { platform: unknown; topic: unknown }): Promise<DraftResult | { ok: false; reason: "not_ready"; message: string }> {
  const platform = draftPlatforms.find((p) => p === input.platform) as DraftPlatform | undefined;
  const topic = typeof input.topic === "string" ? input.topic.trim() : "";
  if (!platform || !topic || topic.length > 300) return { ok: false, reason: "not_ready", message: "Elige una red y escribe un tema de hasta 300 caracteres." };
  const file = await getMyBrandFile();
  if (!file.ready || !file.voice.voice || !file.business.business || !file.brand.brand) return { ok: false, reason: "not_ready", message: `Completa tu expediente de marca: falta ${file.missing.join(", ")}.` };
  return generateDraft({ voice: file.voice.voice, business: file.business.business, brand: file.brand.brand, request: { platform, topic } });
}
