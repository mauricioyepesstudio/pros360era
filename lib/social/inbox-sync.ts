import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/social/crypto";
import { fetchRecentComments, fetchRecentMessages, instagramProfileUrl, type InboxItem } from "@/lib/social/instagram-inbox";

/**
 * Service-role side of the Instagram → CRM inbox. Callers must have already
 * established who owns the connection (cron secret, or the owner's session in
 * /api/social/instagram/inbox). Never import this into a page or server action.
 */

export const MANUAL_SYNC_COOLDOWN_MS = 2 * 60 * 1000;

type ConnectionRow = {
  id: string;
  user_id: string;
  provider_account_id: string;
  username: string;
  token_ciphertext: string | null;
};

export type InboxSyncResult = { imported: number; leadsCreated: number; partial: boolean };

const CONNECTION_COLUMNS = "id, user_id, provider_account_id, username, token_ciphertext";

const LEAD_NOTE: Record<InboxItem["kind"], string> = {
  comment: "Llegó por Instagram: comentó una de tus publicaciones.",
  message: "Llegó por Instagram: te escribió por mensaje directo.",
};

export async function syncInstagramInbox(
  service: SupabaseClient,
  tokenKey: Buffer,
  row: ConnectionRow,
  options: { fetchImpl?: typeof fetch; now?: Date } = {},
): Promise<InboxSyncResult | null> {
  const now = options.now ?? new Date();
  if (!(await claimSync(service, row.id, now))) return null;

  const token = row.token_ciphertext ? decryptToken(row.token_ciphertext, tokenKey, row.provider_account_id) : null;
  if (!token) throw new Error("instagram_token_unavailable");

  // Comments and messages fail independently (e.g. a permission not granted); keep what worked.
  const results = await Promise.allSettled([
    fetchRecentComments(token, row.username, options.fetchImpl),
    fetchRecentMessages(token, row.provider_account_id, row.username, options.fetchImpl),
  ]);
  const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const partial = results.some((result) => result.status === "rejected");
  if (results.every((result) => result.status === "rejected")) throw new Error("instagram_inbox_unavailable");

  const imported = items.length ? await insertNewItems(service, row, items) : 0;
  const leadsCreated = await linkLeads(service, row.user_id);
  return { imported, leadsCreated, partial };
}

/**
 * Takes the connection's turn atomically: only one sync per account every
 * couple of minutes, whether it comes from the cron, a click or a double click,
 * and failed attempts count too, so Instagram is never hammered.
 */
async function claimSync(service: SupabaseClient, connectionId: string, now: Date): Promise<boolean> {
  const cutoff = new Date(now.getTime() - MANUAL_SYNC_COOLDOWN_MS).toISOString();
  const { data, error } = await service
    .from("social_connections")
    .update({ inbox_synced_at: now.toISOString() })
    .eq("id", connectionId)
    .eq("status", "ACTIVE")
    .or(`inbox_synced_at.is.null,inbox_synced_at.lt."${cutoff}"`)
    .select("id");
  if (error) throw new Error("social_storage_unavailable");
  return (data?.length ?? 0) > 0;
}

/** Inserts only items not seen before, so each comment or message is imported once. Returns how many were new. */
async function insertNewItems(service: SupabaseClient, row: ConnectionRow, items: InboxItem[]): Promise<number> {
  const { data, error } = await service
    .from("social_inbox_items")
    .upsert(
      items.map((item) => ({
        user_id: row.user_id,
        connection_id: row.id,
        provider: "instagram",
        kind: item.kind,
        external_id: item.externalId,
        author_id: item.authorId,
        author_username: item.authorUsername,
        body: item.body,
        permalink: item.permalink,
        occurred_at: item.occurredAt,
      })),
      { onConflict: "user_id,provider,kind,external_id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw new Error("social_storage_unavailable");
  return data?.length ?? 0;
}

/**
 * One CRM lead per person who wrote. Works from every item still without a
 * lead (not only this run's), so an interrupted run heals on the next one.
 */
async function linkLeads(service: SupabaseClient, userId: string): Promise<number> {
  const { data: pending, error } = await service
    .from("social_inbox_items")
    .select("author_username, kind, occurred_at")
    .eq("user_id", userId)
    .is("lead_id", null)
    .order("occurred_at", { ascending: true })
    .limit(500);
  if (error) throw new Error("social_storage_unavailable");

  const firstByAuthor = new Map<string, InboxItem["kind"]>();
  for (const item of (pending ?? []) as { author_username: string; kind: InboxItem["kind"] }[]) {
    if (!firstByAuthor.has(item.author_username)) firstByAuthor.set(item.author_username, item.kind);
  }

  let created = 0;
  for (const [username, kind] of firstByAuthor) {
    const lead = await findOrCreateLead(service, userId, username, kind);
    if (lead.created) created += 1;
    const { error: linkError } = await service
      .from("social_inbox_items")
      .update({ lead_id: lead.id })
      .eq("user_id", userId)
      .eq("author_username", username)
      .is("lead_id", null);
    if (linkError) throw new Error("social_storage_unavailable");
  }
  return created;
}

/** crm_leads_instagram_profile_unique makes this safe if two runs race: the loser re-reads the winner's row. */
async function findOrCreateLead(service: SupabaseClient, userId: string, username: string, kind: InboxItem["kind"]) {
  const sourceUrl = instagramProfileUrl(username);
  const find = async () => {
    const { data, error } = await service
      .from("crm_leads")
      .select("id")
      .eq("user_id", userId)
      .eq("source", "instagram")
      .eq("source_url", sourceUrl)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error("social_storage_unavailable");
    return (data?.id as string | undefined) ?? null;
  };

  const existing = await find();
  if (existing) return { id: existing, created: false };
  const { data, error } = await service
    .from("crm_leads")
    .insert({ user_id: userId, source: "instagram", source_url: sourceUrl, name: `@${username}`, notes: LEAD_NOTE[kind] })
    .select("id")
    .single();
  if (data) return { id: data.id as string, created: true };
  if (error?.code === "23505") {
    const winner = await find();
    if (winner) return { id: winner, created: false };
  }
  throw new Error("social_storage_unavailable");
}

/** Daily cron: every active Instagram connection. One account failing doesn't stop the others. */
export async function syncAllInstagramInboxes(service: SupabaseClient, tokenKey: Buffer) {
  const { data, error } = await service
    .from("social_connections")
    .select(CONNECTION_COLUMNS)
    .eq("provider", "instagram")
    .eq("status", "ACTIVE")
    .order("inbox_synced_at", { ascending: true, nullsFirst: true })
    .limit(100);
  if (error) throw new Error("social_storage_unavailable");
  const summary = { accounts: 0, imported: 0, leadsCreated: 0, failed: 0 };
  for (const row of (data ?? []) as ConnectionRow[]) {
    try {
      const result = await syncInstagramInbox(service, tokenKey, row);
      if (!result) continue;
      summary.accounts += 1;
      summary.imported += result.imported;
      summary.leadsCreated += result.leadsCreated;
    } catch {
      summary.failed += 1;
    }
  }
  return summary;
}

export type ManualSyncOutcome = InboxSyncResult | { skipped: "no_connection" | "cooldown" };

/** "Traer ahora": the session owner's own connection; the shared claim enforces the cooldown. */
export async function syncInstagramInboxForOwner(service: SupabaseClient, tokenKey: Buffer, userId: string, now = new Date()): Promise<ManualSyncOutcome> {
  const { data, error } = await service
    .from("social_connections")
    .select(CONNECTION_COLUMNS)
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (error) throw new Error("social_storage_unavailable");
  if (!data) return { skipped: "no_connection" };
  return (await syncInstagramInbox(service, tokenKey, data as ConnectionRow, { now })) ?? { skipped: "cooldown" };
}
