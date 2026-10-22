import { partners, type Partner } from "../../data/partners.ts";

/**
 * Atribución de aliados: recuerda qué aliado recomendó EVOLUSA para pasarlo
 * como metadato al crear la cuenta. Solo atribución; no hay pagos ni
 * comisiones asociados. Todo valor externo se valida contra data/partners.ts.
 */
export const partnerRefCookieName = "evolusa_ref";
export const partnerRefMaxAgeSeconds = 60 * 60 * 24 * 30;

export function getPartner(slug: string | null | undefined): Partner | undefined {
  const normalized = normalizePartnerRef(slug);
  return normalized ? partners.find((partner) => partner.slug === normalized) : undefined;
}

/** Devuelve el slug del aliado si existe en la configuración; si no, null. */
export function normalizePartnerRef(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,40}$/.test(candidate)) return null;
  return partners.some((partner) => partner.slug === candidate) ? candidate : null;
}

/** Cookie propia de primera parte, 30 días, sin datos personales. */
export function serializePartnerRefCookie(slug: string, secure: boolean): string | null {
  const ref = normalizePartnerRef(slug);
  if (!ref) return null;
  return `${partnerRefCookieName}=${ref}; Max-Age=${partnerRefMaxAgeSeconds}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Lee la cookie de atribución de un encabezado `document.cookie`. */
export function readPartnerRefCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === partnerRefCookieName) return normalizePartnerRef(decodeURIComponentSafe(rest.join("=")));
  }
  return null;
}

/** El ?ref= de la URL gana sobre la cookie; ambos se validan. */
export function resolvePartnerRef(queryRef: string | null | undefined, cookieHeader: string | null | undefined): string | null {
  return normalizePartnerRef(queryRef) ?? readPartnerRefCookie(cookieHeader);
}

function decodeURIComponentSafe(value: string): string {
  try { return decodeURIComponent(value); } catch { return ""; }
}
