import type { GhlLead } from "./gohighlevel";

/**
 * A visitor who consents to contacting one EvolUSA professional has not
 * separately authorized an export into that professional's external CRM.
 * Keep profile-originated leads out of the optional GHL sync by default.
 */
export function isPrivateProfileInquiry(lead: Pick<GhlLead,"source_url">): boolean {
  if (!lead.source_url) return false;
  try {
    const url = new URL(lead.source_url);
    return (
      (url.hostname === "evolusa.us" ||
       url.hostname === "www.evolusa.us" ||
       url.hostname === "evolusa.vercel.app") &&
      url.pathname.startsWith("/profesionales/")
    );
  } catch {
    return false;
  }
}
