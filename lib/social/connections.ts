import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { professionalPlannerAllowed } from "@/lib/professional-planner/validation";
import { decryptToken, encryptToken } from "@/lib/social/crypto";
import { getInstagramConfig, refreshLongLivedToken, type InstagramAccount, type InstagramToken } from "@/lib/social/instagram";
import { getLinkedInConfig } from "@/lib/social/linkedin";
import { needsRefresh, REFRESH_WINDOW_MS } from "@/lib/social/refresh-policy";

export type SocialConnectionStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type InstagramConnectionView = {
  username: string;
  accountType: string | null;
  status: SocialConnectionStatus;
  tokenExpiresAt: string | null;
  connectedAt: string;
};

export type MyInstagramState = {
  /** The person may connect (professional with a profile). */
  allowed: boolean;
  /** Meta app secrets and the token key are set in Vercel. */
  configured: boolean;
  /** The social_connections table is reachable (migration applied). */
  storageReady: boolean;
  connection: InstagramConnectionView | null;
};

/** Owner of the session, only if they are a professional with a profile. */
export async function socialConnectionOwner() {
  const db = await createSupabaseServerClient();
  if (!db) return null;
  const { data: { user }, error } = await db.auth.getUser();
  if (!user || error) return null;
  const [{ data: profile, error: roleError }, { data: professional, error: professionalError }] = await Promise.all([
    db.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    db.from("professional_profiles").select("id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (roleError || professionalError || !professionalPlannerAllowed(profile?.role, Boolean(professional))) return null;
  return { db, user };
}

export type SocialProvider = "instagram" | "linkedin";

async function getMyConnection(provider: SocialProvider) {
  const owner = await socialConnectionOwner();
  if (!owner) return { allowed: false, storageReady: false, connection: null };
  const { data, error } = await owner.db
    .from("social_connections")
    .select("username, account_type, status, token_expires_at, created_at")
    .eq("user_id", owner.user.id)
    .eq("provider", provider)
    .maybeSingle();
  if (error) return { allowed: true, storageReady: false, connection: null };
  return {
    allowed: true,
    storageReady: true,
    connection: data
      ? {
          username: data.username,
          accountType: data.account_type,
          status: data.status as SocialConnectionStatus,
          tokenExpiresAt: data.token_expires_at,
          connectedAt: data.created_at,
        }
      : null,
  };
}

export async function getMyInstagramState(): Promise<MyInstagramState> {
  return { configured: getInstagramConfig() !== null, ...(await getMyConnection("instagram")) };
}

export async function getMyLinkedInState(now = Date.now()): Promise<MyInstagramState> {
  const state = await getMyConnection("linkedin");
  const connection = state.connection;
  // Between cron runs a connection can be past its date while still marked ACTIVE.
  const lapsed = connection?.status === "ACTIVE" && connection.tokenExpiresAt !== null && Date.parse(connection.tokenExpiresAt) <= now;
  return {
    configured: getLinkedInConfig() !== null,
    ...state,
    connection: connection && lapsed ? { ...connection, status: "EXPIRED" } : connection,
  };
}

/** RLS lets the owner delete only their own row; the encrypted token goes with it. */
export async function disconnectMySocial(provider: SocialProvider): Promise<boolean> {
  const owner = await socialConnectionOwner();
  if (!owner) return false;
  const { error } = await owner.db.from("social_connections").delete().eq("user_id", owner.user.id).eq("provider", provider);
  return !error;
}

export async function disconnectMyInstagram(): Promise<boolean> {
  return disconnectMySocial("instagram");
}

// ---- Service-role side (OAuth callback, refresh cron, Meta callbacks) ----

export class SocialAccountInUseError extends Error {}
/** Kept for the Instagram callback's import. */
export const InstagramAccountInUseError = SocialAccountInUseError;

type SocialAccount = { id: string; username: string; accountType: string | null };
type SocialToken = { accessToken: string; expiresAt: Date };

/** Additional data the token ciphertext is bound to. Publishers must decrypt with the same value. */
export function tokenBinding(provider: SocialProvider, providerAccountId: string): string {
  return provider === "instagram" ? providerAccountId : `${provider}:${providerAccountId}`;
}

export async function saveSocialConnection(
  service: SupabaseClient,
  provider: SocialProvider,
  input: { userId: string; account: SocialAccount; token: SocialToken; scopes: string[]; tokenKey: Buffer; now?: Date },
): Promise<void> {
  const now = (input.now ?? new Date()).toISOString();
  const { data: holder, error: holderError } = await service
    .from("social_connections")
    .select("user_id, status")
    .eq("provider", provider)
    .eq("provider_account_id", input.account.id)
    .maybeSingle();
  if (holderError) throw new Error("social_storage_unavailable");
  if (holder && holder.user_id !== input.userId) {
    // The new person just proved control of the account through the network; a
    // stale (expired or revoked) link elsewhere doesn't block them. An active one does.
    if (holder.status === "ACTIVE") throw new SocialAccountInUseError("account_in_use");
    const { error: releaseError } = await service
      .from("social_connections")
      .delete()
      .eq("provider", provider)
      .eq("provider_account_id", input.account.id)
      .neq("status", "ACTIVE");
    if (releaseError) throw new Error("social_storage_unavailable");
  }

  const { error } = await service.from("social_connections").upsert(
    {
      user_id: input.userId,
      provider,
      provider_account_id: input.account.id,
      username: Array.from(input.account.username).slice(0, 64).join(""),
      account_type: input.account.accountType?.slice(0, 32) ?? null,
      scopes: input.scopes,
      status: "ACTIVE",
      // Instagram ciphertexts (already stored) are bound to the bare id; new networks also bind the network.
      token_ciphertext: encryptToken(input.token.accessToken, input.tokenKey, tokenBinding(provider, input.account.id)),
      token_expires_at: input.token.expiresAt.toISOString(),
      token_refreshed_at: now,
      last_error: null,
      updated_at: now,
    },
    { onConflict: "user_id,provider" },
  );
  if (error) throw new Error("social_storage_unavailable");
}

export async function saveInstagramConnection(
  service: SupabaseClient,
  input: { userId: string; account: InstagramAccount; token: InstagramToken; scopes: string[]; tokenKey: Buffer; now?: Date },
): Promise<void> {
  return saveSocialConnection(service, "instagram", input);
}

/** LinkedIn gives no refresh token to self-serve apps: past expiry the connection is marked EXPIRED and the token wiped. */
export async function expireDueLinkedInConnections(service: SupabaseClient, now = Date.now()): Promise<number> {
  const { data, error } = await service
    .from("social_connections")
    .update({ status: "EXPIRED", token_ciphertext: null, last_error: "La conexión con LinkedIn venció. Vuelve a conectarla.", updated_at: new Date(now).toISOString() })
    .eq("provider", "linkedin")
    .eq("status", "ACTIVE")
    .lte("token_expires_at", new Date(now).toISOString())
    .select("id");
  if (error) throw new Error("social_storage_unavailable");
  return data?.length ?? 0;
}

/** Meta deauthorize: the person removed EVOLUSA from their Instagram. Wipe the token, keep the row as REVOKED. */
export async function revokeInstagramAccount(service: SupabaseClient, providerAccountId: string): Promise<number> {
  const { data, error } = await service
    .from("social_connections")
    .update({ status: "REVOKED", token_ciphertext: null, token_expires_at: null, last_error: "Desconectada desde Instagram.", updated_at: new Date().toISOString() })
    .eq("provider", "instagram")
    .eq("provider_account_id", providerAccountId)
    .select("id");
  if (error) throw new Error("social_storage_unavailable");
  const ids = (data ?? []).map((row) => row.id as string);
  if (ids.length) {
    // Removing EVOLUSA from Instagram also removes the comments and messages we imported.
    const { error: inboxError } = await service.from("social_inbox_items").delete().in("connection_id", ids);
    if (inboxError) throw new Error("social_storage_unavailable");
  }
  return ids.length;
}

/** Meta data deletion: remove everything we hold for that Instagram account. */
export async function deleteInstagramAccountData(service: SupabaseClient, providerAccountId: string, confirmationCode: string): Promise<void> {
  const { data, error } = await service
    .from("social_connections")
    .delete()
    .eq("provider", "instagram")
    .eq("provider_account_id", providerAccountId)
    .select("id");
  if (error) throw new Error("social_storage_unavailable");
  const { error: logError } = await service
    .from("social_data_deletion_requests")
    .insert({ confirmation_code: confirmationCode, provider: "instagram", provider_account_hash: hashAccountId(providerAccountId), connections_deleted: data?.length ?? 0 });
  if (logError) throw new Error("social_storage_unavailable");
}

/** Meta asked us to delete the account; we keep only a one-way hash to answer the status URL. */
function hashAccountId(providerAccountId: string): string {
  return createHash("sha256").update(`evolusa:instagram:${providerAccountId}`).digest("hex");
}

/** Public status lookup for Meta's deletion URL, through a narrow RPC (no service role in pages). */
export async function findDeletionRequestDate(confirmationCode: string): Promise<string | null> {
  const db = await createSupabaseServerClient();
  if (!db) return null;
  const { data, error } = await db.rpc("social_deletion_request_date", { p_confirmation_code: confirmationCode });
  return error || typeof data !== "string" ? null : data;
}

export async function refreshDueInstagramTokens(service: SupabaseClient, tokenKey: Buffer, now = Date.now()) {
  const { data, error } = await service
    .from("social_connections")
    .select("id, provider_account_id, token_ciphertext, token_expires_at, token_refreshed_at")
    .eq("provider", "instagram")
    .eq("status", "ACTIVE")
    .lte("token_expires_at", new Date(now + REFRESH_WINDOW_MS).toISOString())
    .order("token_expires_at", { ascending: true })
    .limit(200);
  if (error) throw new Error("social_storage_unavailable");

  const result = { refreshed: 0, expired: 0, failed: 0 };
  for (const row of data ?? []) {
    const action = needsRefresh(row, now);
    if (action === "skip") continue;
    const stamp = new Date(now).toISOString();
    if (action === "expired") {
      await service.from("social_connections").update({ status: "EXPIRED", token_ciphertext: null, last_error: "La conexión venció. Vuelve a conectar tu cuenta.", updated_at: stamp }).eq("id", row.id).eq("status", "ACTIVE");
      result.expired += 1;
      continue;
    }
    const plain = row.token_ciphertext ? decryptToken(row.token_ciphertext, tokenKey, row.provider_account_id) : null;
    try {
      if (!plain) throw new Error("undecryptable");
      const token = await refreshLongLivedToken(plain);
      await service
        .from("social_connections")
        .update({ token_ciphertext: encryptToken(token.accessToken, tokenKey, row.provider_account_id), token_expires_at: token.expiresAt.toISOString(), token_refreshed_at: stamp, last_error: null, updated_at: stamp })
        .eq("id", row.id)
        // A deauthorize that landed mid-refresh wins: never revive a revoked row.
        .eq("status", "ACTIVE");
      result.refreshed += 1;
    } catch {
      await service.from("social_connections").update({ last_error: "No pudimos renovar la conexión. Intentaremos de nuevo.", updated_at: stamp }).eq("id", row.id).eq("status", "ACTIVE");
      result.failed += 1;
    }
  }
  return result;
}

export type InboxItemView = {
  id: string;
  kind: "comment" | "message";
  authorUsername: string;
  body: string;
  permalink: string | null;
  occurredAt: string;
  leadId: string | null;
};

export type MyInstagramInbox = {
  allowed: boolean;
  storageReady: boolean;
  connection: { username: string; status: SocialConnectionStatus; inboxSyncedAt: string | null } | null;
  items: InboxItemView[];
};

/** The owner's imported comments and messages, read under their own session (RLS). */
export async function getMyInstagramInbox(limit = 60): Promise<MyInstagramInbox> {
  const owner = await socialConnectionOwner();
  if (!owner) return { allowed: false, storageReady: false, connection: null, items: [] };
  const [{ data: connection, error: connectionError }, { data: items, error: itemsError }] = await Promise.all([
    owner.db.from("social_connections").select("username, status, inbox_synced_at").eq("user_id", owner.user.id).eq("provider", "instagram").maybeSingle(),
    owner.db
      .from("social_inbox_items")
      .select("id, kind, author_username, body, permalink, occurred_at, lead_id")
      .eq("user_id", owner.user.id)
      .order("occurred_at", { ascending: false })
      .limit(limit),
  ]);
  if (connectionError || itemsError) return { allowed: true, storageReady: false, connection: null, items: [] };
  return {
    allowed: true,
    storageReady: true,
    connection: connection ? { username: connection.username, status: connection.status as SocialConnectionStatus, inboxSyncedAt: connection.inbox_synced_at } : null,
    items: (items ?? []).map((item) => ({
      id: item.id,
      kind: item.kind as InboxItemView["kind"],
      authorUsername: item.author_username,
      body: item.body,
      permalink: item.permalink,
      occurredAt: item.occurred_at,
      leadId: item.lead_id,
    })),
  };
}

export type PublicationView = { postId: string; provider: SocialProvider; status: "PUBLISHING" | "PUBLISHED" | "FAILED" | "UNKNOWN"; permalink: string | null };
export type MyPublishingState = { ready: Record<SocialProvider, boolean>; publications: PublicationView[] };

/** For the planner: which networks can publish right now, and what already went out. Owner's session (RLS). */
export async function getMyPublishingState(now = Date.now()): Promise<MyPublishingState> {
  const empty: MyPublishingState = { ready: { instagram: false, linkedin: false }, publications: [] };
  const owner = await socialConnectionOwner();
  if (!owner) return empty;
  const [{ data: connections, error: connectionsError }, { data: publications, error: publicationsError }] = await Promise.all([
    owner.db.from("social_connections").select("provider, status, token_expires_at").eq("user_id", owner.user.id),
    owner.db.from("social_publications").select("planner_post_id, provider, status, permalink").eq("user_id", owner.user.id).limit(500),
  ]);
  if (connectionsError) return empty;
  const ready = { ...empty.ready };
  for (const row of connections ?? []) {
    const live = row.status === "ACTIVE" && (!row.token_expires_at || Date.parse(row.token_expires_at) > now);
    if (live && (row.provider === "instagram" || (row.provider === "linkedin" && getLinkedInConfig() !== null))) ready[row.provider as SocialProvider] = true;
  }
  // Before the publications migration is applied the table is missing: nothing has gone out yet.
  const views = publicationsError
    ? []
    : (publications ?? []).map((row) => ({ postId: row.planner_post_id, provider: row.provider as SocialProvider, status: row.status as PublicationView["status"], permalink: row.permalink }));
  return { ready: publicationsError ? empty.ready : ready, publications: views };
}
