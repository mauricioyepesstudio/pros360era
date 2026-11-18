/**
 * Perfil de voz de cada profesional: cómo suena su contenido. Lo leen todos los
 * generadores del cerebro (planner, CRM, resúmenes) para que ninguno improvise
 * un tono propio. Datos puros, sin Supabase, para probarlo con node --test.
 */
export const voiceProfileVersion = "voice-profile-v1";

export const voiceTones = [
  { id: "cercano", label: "Cercano y cálido" },
  { id: "profesional", label: "Profesional y claro" },
  { id: "experto", label: "Experto y didáctico" },
  { id: "inspirador", label: "Inspirador y motivador" },
] as const;
export type VoiceTone = (typeof voiceTones)[number]["id"];

export const voiceLanguages = [
  { id: "es", label: "Solo español" },
  { id: "en", label: "Solo inglés" },
  { id: "es-en", label: "Bilingüe (español primero)" },
] as const;
export type VoiceLanguage = (typeof voiceLanguages)[number]["id"];

export type VoiceProfile = {
  tone: VoiceTone;
  language: VoiceLanguage;
  /** Cómo habla la persona, en sus palabras. */
  personality: string;
  /** Palabras o frases que sí usa. */
  useWords: string;
  /** Palabras o frases que nunca usa. */
  avoidWords: string;
  /** Llamado a la acción preferido. */
  cta: string;
  /** Aviso que debe ir completo en cada pieza (p. ej. el de Notary Public en Florida). */
  disclaimer: string;
  emojis: boolean;
};

const textLimits = { personality: 300, useWords: 300, avoidWords: 300, cta: 160, disclaimer: 500 } as const;
const requiredText = new Set(["personality", "cta"]);
const keys = ["tone", "language", "emojis", ...Object.keys(textLimits)];
const controlChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

export function parseVoiceProfile(input: unknown): VoiceProfile | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) return null;
  if (!voiceTones.some((t) => t.id === value.tone) || !voiceLanguages.some((l) => l.id === value.language)) return null;
  if (typeof value.emojis !== "boolean") return null;
  const text: Record<string, string> = {};
  for (const [key, max] of Object.entries(textLimits)) {
    const raw = value[key];
    if (typeof raw !== "string" || raw.length > max || controlChars.test(raw)) return null;
    if (requiredText.has(key) && !raw.trim()) return null;
    text[key] = raw.trim();
  }
  return {
    tone: value.tone as VoiceTone,
    language: value.language as VoiceLanguage,
    personality: text.personality,
    useWords: text.useWords,
    avoidWords: text.avoidWords,
    cta: text.cta,
    disclaimer: text.disclaimer,
    emojis: value.emojis,
  };
}

export function emptyVoiceProfile(): VoiceProfile {
  return { tone: "cercano", language: "es", personality: "", useWords: "", avoidWords: "", cta: "", disclaimer: "", emojis: false };
}

/** Lista separada por comas o saltos de línea → palabras limpias, sin vacíos. */
export function wordList(value: string): string[] {
  return value.split(/[,\n]/).map((word) => word.trim()).filter(Boolean);
}
