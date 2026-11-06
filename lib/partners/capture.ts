import { readPartnerRefCookie, resolvePartnerRef, serializePartnerRefCookie } from "./ref";

/** Guarda la atribución en una cookie propia si el ref es un aliado válido. */
export function persistPartnerRef(ref: string | null | undefined): string | null {
  if (typeof document === "undefined" || !ref) return null;
  const cookie = serializePartnerRefCookie(ref, window.location.protocol === "https:");
  if (!cookie) return null;
  try {
    document.cookie = cookie;
    return readPartnerRefCookie(document.cookie);
  } catch { return null; }
}

/** Ref vigente: ?ref= de la URL (si es válido) o la cookie guardada. */
export function currentPartnerRef(queryRef: string | null | undefined): string | null {
  if (typeof document === "undefined") return null;
  let cookieHeader = "";
  try { cookieHeader = document.cookie; } catch { /* cookies bloqueadas */ }
  return resolvePartnerRef(queryRef, cookieHeader);
}
