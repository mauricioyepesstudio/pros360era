/**
 * professional_profiles.booking_url (migration 0012) is owner-set free text
 * with no server-side allowlist — a professional could paste anything,
 * including a javascript:/data: URL, whether by mistake or by a compromised
 * account. This is the one guard between that raw string and a real <a
 * href> in the member-facing UI.
 */
export function safeBookingHref(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
