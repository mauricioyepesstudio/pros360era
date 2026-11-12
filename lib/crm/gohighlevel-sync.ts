import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken, encryptToken } from "@/lib/social/crypto";
import { addGhlNote, upsertGhlContact, type GhlCredentials, type GhlLead } from "@/lib/crm/gohighlevel";

/**
 * Server-only: copies the professional's new CRM leads into their GoHighLevel
 * sub-account. Always called with the service role, and only after the caller
 * has decided whose connection it is (session owner, or the cron). A lead is
 * "new" if it was created after the connection; older leads are not sent.
 */

export const GHL_BATCH = 25;
export const GHL_MAX_ATTEMPTS = 5;
const LEAD_COLUMNS = "id,name,email,phone,whatsapp,source,source_url,notes,created_at";

/** Authenticated data for the ciphertext: it only decrypts for this owner and location. */
export function ghlBinding(userId: string, locationId: string): string {
  return `gohighlevel:${userId}:${locationId}`;
}

/**
 * Saves (or replaces) the owner's connection. Moving to another location
 * starts over: the old row and its sync log go, and only leads created from
 * now on are sent to the new sub-account.
 */
export async function saveGhlConnection(service: SupabaseClient, tokenKey: Buffer, userId: string, input: { locationId: string; locationName: string | null; token: string }) {
  const { data: current, error: readError } = await service.from("crm_ghl_connections").select("location_id").eq("user_id", userId).maybeSingle();
  if (readError) throw new Error("ghl_storage_unavailable");
  if (current && current.location_id !== input.locationId) {
    const { error: deleteError } = await service.from("crm_ghl_connections").delete().eq("user_id", userId);
    if (deleteError) throw new Error("ghl_storage_unavailable");
  }
  const { error } = await service.from("crm_ghl_connections").upsert(
    {
      user_id: userId,
      location_id: input.locationId,
      location_name: input.locationName,
      token_ciphertext: encryptToken(input.token, tokenKey, ghlBinding(userId, input.locationId)),
      status: "ACTIVE",
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error("ghl_storage_unavailable");
}

type ConnectionRow = { user_id: string; location_id: string; token_ciphertext: string; status: string; created_at: string };
export type GhlSyncResult = { sent: number; failed: number; stopped: "auth" | null };

async function markInvalid(service: SupabaseClient, userId: string, message: string) {
  await service.from("crm_ghl_connections").update({ status: "INVALID", last_error: message, updated_at: new Date().toISOString() }).eq("user_id", userId);
}

/** Sends up to GHL_BATCH pending leads of one connection. One bad contact doesn't stop the rest; a revoked token does. */
export async function syncGhlConnection(service: SupabaseClient, tokenKey: Buffer, row: ConnectionRow, fetchImpl: typeof fetch = fetch): Promise<GhlSyncResult> {
  const result: GhlSyncResult = { sent: 0, failed: 0, stopped: null };
  if (row.status !== "ACTIVE") return result;
  const token = decryptToken(row.token_ciphertext, tokenKey, ghlBinding(row.user_id, row.location_id));
  if (!token) {
    await markInvalid(service, row.user_id, "No pudimos leer la llave guardada. Vuelve a conectar.");
    return { ...result, stopped: "auth" };
  }
  const creds: GhlCredentials = { locationId: row.location_id, token };

  const { data: logged, error: logError } = await service
    .from("crm_ghl_lead_sync")
    .select("lead_id, status, attempts")
    .eq("user_id", row.user_id)
    .limit(5000);
  if (logError) throw new Error("ghl_storage_unavailable");
  const log = (logged ?? []) as { lead_id: string; status: string; attempts: number }[];
  const skip = new Set(log.filter((item) => item.status === "SYNCED" || item.attempts >= GHL_MAX_ATTEMPTS).map((item) => item.lead_id));
  const attemptsOf = new Map(log.map((item) => [item.lead_id, item.attempts]));

  const { data: leads, error } = await service
    .from("crm_leads")
    .select(LEAD_COLUMNS)
    .eq("user_id", row.user_id)
    .gte("created_at", row.created_at)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("ghl_storage_unavailable");
  // Profile inquiries consent to delivery within the selected professional's
  // EVOLUSA ARM only. A GoHighLevel connection is a separate data recipient.
  // Never sync those leads to GHL without a separately recorded authorization.
  const isPrivateProfileInquiry = (lead: GhlLead) => {
    if (!lead.source_url) return false;
    try {
      const url = new URL(lead.source_url);
      return (
        (url.hostname === "evolusa.us" || url.hostname === "www.evolusa.us" ||
         url.hostname === "evolusa.vercel.app") &&
        url.pathname.startsWith("/profesionales/")
      );
    } catch {
      return false;
    }
  };

  // The 200 most recent leads, oldest of them first.
  const pending = ((leads ?? []) as GhlLead[]).filter((lead) => !skip.has(lead.id) && !isPrivateProfileInquiry(lead)).reverse().slice(0, GHL_BATCH);

  for (const lead of pending) {
    const upsert = await upsertGhlContact(creds, lead, fetchImpl);
    const now = new Date().toISOString();
    if (upsert.ok) {
      if (upsert.value.created && lead.notes) await addGhlNote(creds, upsert.value.contactId, lead.notes, fetchImpl);
      await service.from("crm_ghl_lead_sync").upsert({ lead_id: lead.id, user_id: row.user_id, status: "SYNCED", ghl_contact_id: upsert.value.contactId, attempts: (attemptsOf.get(lead.id) ?? 0) + 1, last_error: null, updated_at: now }, { onConflict: "lead_id" });
      result.sent += 1;
      continue;
    }
    if (upsert.error === "auth") {
      await markInvalid(service, row.user_id, "GoHighLevel rechazó la llave o el Location ID. Vuelve a conectar.");
      return { ...result, stopped: "auth" };
    }
    result.failed += 1;
    await service.from("crm_ghl_lead_sync").upsert({ lead_id: lead.id, user_id: row.user_id, status: "FAILED", ghl_contact_id: null, attempts: Math.min((attemptsOf.get(lead.id) ?? 0) + 1, 100), last_error: upsert.error === "rejected" ? "GoHighLevel no aceptó este contacto." : "GoHighLevel no respondió.", updated_at: now }, { onConflict: "lead_id" });
  }

  await service.from("crm_ghl_connections").update({ last_synced_at: new Date().toISOString(), last_error: result.failed ? "Algunos prospectos no se pudieron copiar; se reintentan solos." : null }).eq("user_id", row.user_id);
  return result;
}

const CONNECTION_COLUMNS = "user_id, location_id, token_ciphertext, status, created_at";

/** After a new lead (manual capture, Instagram import) or "Sincronizar ahora": only the given owner. */
export async function syncGhlForOwner(service: SupabaseClient, tokenKey: Buffer, userId: string, fetchImpl: typeof fetch = fetch): Promise<GhlSyncResult | null> {
  const { data, error } = await service.from("crm_ghl_connections").select(CONNECTION_COLUMNS).eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return syncGhlConnection(service, tokenKey, data as ConnectionRow, fetchImpl);
}

/** Daily cron safety net: retries what failed and anything a missed trigger left behind. */
export async function syncAllGhl(service: SupabaseClient, tokenKey: Buffer) {
  const { data, error } = await service.from("crm_ghl_connections").select(CONNECTION_COLUMNS).eq("status", "ACTIVE").order("last_synced_at", { ascending: true, nullsFirst: true }).limit(100);
  if (error) throw new Error("ghl_storage_unavailable");
  const summary = { accounts: 0, sent: 0, failed: 0 };
  for (const row of (data ?? []) as ConnectionRow[]) {
    try {
      const result = await syncGhlConnection(service, tokenKey, row);
      summary.accounts += 1;
      summary.sent += result.sent;
      summary.failed += result.failed;
    } catch {
      summary.failed += 1;
    }
  }
  return summary;
}
