/**
 * GoHighLevel (LeadConnector API v2) for the optional CRM connector. Each
 * professional brings their own sub-account: a Location ID and a Private
 * Integration token with the scopes "View Contacts" and "Edit Contacts".
 * EVOLUSA only creates or updates contacts; it never sends messages from
 * GoHighLevel. Pure helpers, `fetch` injectable so tests never hit the network.
 */

export const GHL_API = "https://services.leadconnectorhq.com";
export const GHL_VERSION = "2021-07-28";
const TIMEOUT_MS = 10_000;

export type GhlCredentials = { locationId: string; token: string };

export type GhlLead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  source: string;
  source_url: string | null;
  notes: string | null;
};

export type GhlResult<T> = { ok: true; value: T } | { ok: false; error: GhlError };
/** `auth`: the token or location is wrong/revoked (stop until reconnected). `rejected`: this one contact was refused. `unavailable`: try later. */
export type GhlError = "auth" | "rejected" | "unavailable";

type Fetch = typeof fetch;

export function cleanLocationId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9]{8,64}$/.test(trimmed) ? trimmed : null;
}

/** Private Integration tokens look like `pit-<uuid>`; accept any opaque token without spaces. */
export function cleanToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._-]{20,2048}$/.test(trimmed) ? trimmed : null;
}

function headers(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, Version: GHL_VERSION, Accept: "application/json", "Content-Type": "application/json" };
}

function classify(status: number): GhlError {
  if (status === 401 || status === 403) return "auth";
  if (status === 400 || status === 422) return "rejected";
  return "unavailable";
}

async function call(fetchImpl: Fetch, path: string, init: { method: "GET" | "POST"; token: string; body?: unknown }) {
  try {
    const response = await fetchImpl(`${GHL_API}${path}`, {
      method: init.method,
      headers: headers(init.token),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: response.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

/**
 * Proves the token can read this location before it is saved, without
 * creating anything in the sub-account. Returns the location's name when the
 * token also has "View Locations"; the name is optional.
 */
export async function verifyGhlCredentials(creds: GhlCredentials, fetchImpl: Fetch = fetch): Promise<GhlResult<{ locationName: string | null }>> {
  const search = await call(fetchImpl, "/contacts/search", { method: "POST", token: creds.token, body: { locationId: creds.locationId, pageLimit: 1 } });
  if (search.status < 200 || search.status >= 300) return { ok: false, error: classify(search.status) };
  const location = await call(fetchImpl, `/locations/${encodeURIComponent(creds.locationId)}`, { method: "GET", token: creds.token });
  const loc = (location.data?.location ?? null) as Record<string, unknown> | null;
  const name = location.status === 200 && typeof loc?.name === "string" ? loc.name.slice(0, 200) : null;
  return { ok: true, value: { locationName: name } };
}

const SOURCE_LABEL: Record<string, string> = {
  website: "sitio web",
  whatsapp: "whatsapp",
  instagram: "instagram",
  facebook: "facebook",
  email: "correo",
  referral: "referido",
  other: "otro",
};

/** E.164 when it is clearly a US/international number; otherwise as typed (GoHighLevel normalizes). */
export function normalizePhone(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/[^\d+]/g, "");
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  const only = digits.replace(/\+/g, "");
  if (/^\d{10}$/.test(only)) return `+1${only}`;
  if (/^1\d{10}$/.test(only)) return `+${only}`;
  return value.trim() || null;
}

/** The upsert body for one EVOLUSA lead. Only fields the lead actually has. */
export function ghlContactFromLead(lead: GhlLead, locationId: string) {
  const name = lead.name?.trim() || null;
  const [firstName, ...rest] = name && !name.startsWith("@") ? name.split(/\s+/) : [];
  const phone = normalizePhone(lead.phone ?? lead.whatsapp);
  const body: Record<string, unknown> = {
    locationId,
    source: "EVOLUSA",
    tags: ["evolusa", `evolusa-${SOURCE_LABEL[lead.source] ?? "otro"}`],
  };
  if (name) body.name = name;
  if (firstName) body.firstName = firstName;
  if (rest.length) body.lastName = rest.join(" ");
  if (lead.email) body.email = lead.email.trim().toLowerCase();
  if (phone) body.phone = phone;
  if (lead.source_url) body.website = lead.source_url;
  return body;
}

/** POST /contacts/upsert: GoHighLevel matches on email/phone per the sub-account's duplicate settings. */
export async function upsertGhlContact(creds: GhlCredentials, lead: GhlLead, fetchImpl: Fetch = fetch): Promise<GhlResult<{ contactId: string; created: boolean }>> {
  const result = await call(fetchImpl, "/contacts/upsert", { method: "POST", token: creds.token, body: ghlContactFromLead(lead, creds.locationId) });
  if (result.status < 200 || result.status >= 300) return { ok: false, error: classify(result.status) };
  const contact = (result.data?.contact ?? null) as Record<string, unknown> | null;
  const id = typeof contact?.id === "string" ? contact.id : null;
  if (!id || id.length > 64) return { ok: false, error: "unavailable" };
  return { ok: true, value: { contactId: id, created: result.data?.new === true } };
}

/** Adds the lead's notes to the contact once, right after it was created. Best-effort. */
export async function addGhlNote(creds: GhlCredentials, contactId: string, body: string, fetchImpl: Fetch = fetch): Promise<boolean> {
  const text = body.trim().slice(0, 2000);
  if (!text) return true;
  const result = await call(fetchImpl, `/contacts/${encodeURIComponent(contactId)}/notes`, { method: "POST", token: creds.token, body: { body: `Desde EVOLUSA: ${text}` } });
  return result.status >= 200 && result.status < 300;
}
