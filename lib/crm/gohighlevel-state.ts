import { readSocialTokenKey } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";

export type GhlConnectionView = {
  locationId: string;
  locationName: string | null;
  status: "ACTIVE" | "INVALID";
  lastError: string | null;
  lastSyncedAt: string | null;
  connectedAt: string;
  sent: number;
  failed: number;
};

export type MyGhlState = {
  allowed: boolean;
  /** SOCIAL_TOKEN_KEY and the service role are set in Vercel. */
  configured: boolean;
  /** The crm_ghl_* tables are reachable (migration applied). */
  storageReady: boolean;
  connection: GhlConnectionView | null;
};

export function ghlConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return readSocialTokenKey(env.SOCIAL_TOKEN_KEY) !== null && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Read through RLS with the session: the owner sees status and counts, never the token. */
export async function getMyGhlState(): Promise<MyGhlState> {
  const configured = ghlConfigured();
  const owner = await socialConnectionOwner();
  if (!owner) return { allowed: false, configured, storageReady: false, connection: null };
  const { data, error } = await owner.db
    .from("crm_ghl_connections")
    .select("location_id, location_name, status, last_error, last_synced_at, created_at")
    .eq("user_id", owner.user.id)
    .maybeSingle();
  if (error) return { allowed: true, configured, storageReady: false, connection: null };
  if (!data) return { allowed: true, configured, storageReady: true, connection: null };
  const count = (status: "SYNCED" | "FAILED") =>
    owner.db.from("crm_ghl_lead_sync").select("lead_id", { count: "exact", head: true }).eq("user_id", owner.user.id).eq("status", status);
  const [sent, failed] = await Promise.all([count("SYNCED"), count("FAILED")]);
  return {
    allowed: true,
    configured,
    storageReady: true,
    connection: {
      locationId: data.location_id,
      locationName: data.location_name,
      status: data.status,
      lastError: data.last_error,
      lastSyncedAt: data.last_synced_at,
      connectedAt: data.created_at,
      sent: sent.count ?? 0,
      failed: failed.count ?? 0,
    },
  };
}
