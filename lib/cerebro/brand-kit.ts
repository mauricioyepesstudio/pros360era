/**
 * Expediente de marca (brandbook) de cada profesional: colores, tipografías,
 * reglas visuales, imágenes propias y el encargado humano que aprueba. Junto
 * con «Mi negocio» y «Mi voz» forma el expediente que el cerebro exige antes de
 * redactar. Datos puros, sin Supabase, para probarlo con node --test.
 */
export const brandKitVersion = "brand-kit-v1";
export const brandKitMaxColors = 5;
export const brandKitMaxImages = 12;

export type BrandKit = {
  /** Colores de marca en #rrggbb, el primero es el principal. */
  colors: string[];
  /** Tipografías, en texto libre (p. ej. «Poppins para títulos, Inter para texto»). */
  fonts: string;
  /** De qué trata la marca, en sus palabras (puede venir de su web). */
  about: string;
  /** Reglas visuales: qué sí y qué no en las piezas. */
  visualRules: string;
  /** Imágenes del brandbook, subidas por el profesional al almacenamiento del planner. */
  imageUrls: string[];
  /** Encargado humano de branding y community manager de este perfil (regla del 7-nov). */
  manager: string;
  /** El profesional confirma que tiene derecho a usar las imágenes en publicaciones. */
  imagesConsent: boolean;
};

const textLimits = { fonts: 200, about: 600, visualRules: 600, manager: 120 } as const;
const keys = ["colors", "imageUrls", "imagesConsent", ...Object.keys(textLimits)];
const controlChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const hexColor = /^#[0-9a-f]{6}$/;

/** Solo imágenes subidas por la misma persona al bucket público del planner. */
export function brandImageAllowed(url: unknown, ownerId: string, supabaseUrl: string | null | undefined): boolean {
  if (typeof url !== "string" || !supabaseUrl || url.length > 1000) return false;
  try {
    const base = new URL(supabaseUrl);
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.origin !== base.origin || parsed.search || parsed.hash) return false;
    const prefix = `/storage/v1/object/public/planner-images/${ownerId}/`;
    return parsed.pathname.startsWith(prefix) && /^[0-9a-f-]{36}\.jpg$/.test(parsed.pathname.slice(prefix.length));
  } catch {
    return false;
  }
}

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let raw = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(raw)) raw = "#" + raw.slice(1).split("").map((c) => c + c).join("");
  return hexColor.test(raw) ? raw : null;
}

export function parseBrandKit(input: unknown, imageAllowed: (url: string) => boolean): BrandKit | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) return null;
  if (!Array.isArray(value.colors) || !value.colors.length || value.colors.length > brandKitMaxColors) return null;
  const colors = value.colors.map(normalizeHexColor);
  if (colors.some((color) => !color) || new Set(colors).size !== colors.length) return null;
  if (!Array.isArray(value.imageUrls) || value.imageUrls.length > brandKitMaxImages) return null;
  if (value.imageUrls.some((url) => typeof url !== "string" || !imageAllowed(url)) || new Set(value.imageUrls).size !== value.imageUrls.length) return null;
  if (typeof value.imagesConsent !== "boolean" || (value.imageUrls.length > 0 && !value.imagesConsent)) return null;
  const text: Record<string, string> = {};
  for (const [key, max] of Object.entries(textLimits)) {
    const raw = value[key];
    if (typeof raw !== "string" || raw.length > max || controlChars.test(raw)) return null;
    text[key] = raw.trim();
  }
  if (!text.manager) return null;
  return {
    colors: colors as string[],
    fonts: text.fonts,
    about: text.about,
    visualRules: text.visualRules,
    imageUrls: value.imageUrls as string[],
    manager: text.manager,
    imagesConsent: value.imagesConsent,
  };
}

export function emptyBrandKit(): BrandKit {
  return { colors: [], fonts: "", about: "", visualRules: "", imageUrls: [], manager: "", imagesConsent: false };
}

export type BrandFileStep = { id: "business" | "voice" | "brand"; label: string; href: string; done: boolean };

/** Los tres pasos del expediente. Generar un borrador exige los tres. */
export function brandFileSteps(state: { business: boolean; voice: boolean; brand: boolean }): { steps: BrandFileStep[]; ready: boolean; missing: string[] } {
  const steps: BrandFileStep[] = [
    { id: "business", label: "Mi negocio", href: "/panel-profesional/marca#mi-negocio", done: state.business },
    { id: "voice", label: "Mi voz", href: "/panel-profesional/marca#mi-voz", done: state.voice },
    { id: "brand", label: "Mi brandbook y encargado", href: "/panel-profesional/marca#mi-brandbook", done: state.brand },
  ];
  const missing = steps.filter((step) => !step.done).map((step) => step.label);
  return { steps, ready: missing.length === 0, missing };
}
