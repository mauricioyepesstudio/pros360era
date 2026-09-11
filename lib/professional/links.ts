import { socialLinkPlatforms, type ProfessionalSocialLinks } from "@/data/professional/types";

/**
 * photo_url/portfolio_url/website_url/social_links (migration 0015) are
 * owner-set free text with no server-side allowlist, same posture as
 * booking_url (lib/opportunities/booking.ts#safeBookingHref) — this is the
 * equivalent guard for those four fields. Deliberately a separate function
 * rather than importing safeBookingHref: that function's own doc-comment
 * scopes it specifically to booking_url, and duplicating eight lines here
 * keeps each guard's blast radius obvious rather than coupling two
 * unrelated fields to one shared implementation.
 */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** Only the known, renderable platforms, each value re-validated as a safe http(s) URL — never a pass-through of arbitrary stored JSON. */
export function safeSocialLinks(socialLinks: ProfessionalSocialLinks | null | undefined): ProfessionalSocialLinks {
  const result: ProfessionalSocialLinks = {};
  if (!socialLinks) return result;

  for (const platform of socialLinkPlatforms) {
    const href = safeHttpUrl(socialLinks[platform]);
    if (href) result[platform] = href;
  }
  return result;
}
