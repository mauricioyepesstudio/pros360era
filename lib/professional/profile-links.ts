import type { ProfessionalSocialLinks } from "../../data/professional/types.ts";

/**
 * A professional's own URL-shaped profile fields (booking_url, portfolio_url,
 * website_url, social_links.*) are free text at the database layer (0012,
 * 0017 both store plain `text`, no server-side allowlist) — same trust tier
 * lib/opportunities/booking.ts#safeBookingHref already treats booking_url
 * with. Applied here at write time by lib/professional/self-profile.ts
 * (reject silently by dropping the value, never throw) so a malformed/unsafe
 * scheme (javascript:, data:, etc.) can never be persisted in the first
 * place, rather than relying on every future reader to re-sanitize before
 * rendering an <a href>.
 *
 * Kept in its own module, relative-imports only (no "@/"), so it can be
 * imported directly by tests/professional-self-profile.test.ts under plain
 * `node --test` — same reasoning lib/opportunities/lifecycle.ts documents
 * for its own relative value import: Node's native TypeScript stripping
 * erases `import type` before resolution, but a real value import needs a
 * path Node can actually resolve without a bundler.
 */
export function sanitizeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Public profile destinations must never carry URL-embedded credentials.
    if (parsed.username || parsed.password) return null;
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** Public social destination, not proof of company ownership or OAuth access. */
export function publicLinkedInUrl(url: string | null): string | null {
  const safe = sanitizeUrl(url);
  if (!safe) return null;
  const parsed = new URL(safe);
  if (parsed.hostname !== "linkedin.com" && parsed.hostname !== "www.linkedin.com") return safe;
  const companyAdmin = /^\/company\/([a-zA-Z0-9_-]+)\/admin(?:\/.*)?$/.exec(parsed.pathname);
  if (!companyAdmin) return safe;
  return `https://www.linkedin.com/company/${companyAdmin[1]}/`;
}

/** Explicit public contact destination; never an inbox connection. */
export function publicWhatsAppUrl(value: string | null | undefined): string | null {
  if (!value || value.trim() !== value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.hostname !== "wa.me" || u.port || u.username || u.password || u.search || u.hash) return null;
    return /^\/[1-9]\d{7,14}$/.test(u.pathname) ? "https://wa.me" + u.pathname : null;
  } catch { return null; }
}

export function sanitizeSocialLinks(links: ProfessionalSocialLinks): ProfessionalSocialLinks {
  return {
    ...(publicWhatsAppUrl(links.whatsapp) ? {whatsapp: publicWhatsAppUrl(links.whatsapp)!} : {}),
    instagram: sanitizeUrl(links.instagram ?? null) ?? undefined,
    linkedin: publicLinkedInUrl(links.linkedin ?? null) ?? undefined,
    facebook: sanitizeUrl(links.facebook ?? null) ?? undefined,
    tiktok: sanitizeUrl(links.tiktok ?? null) ?? undefined,
  };
}
