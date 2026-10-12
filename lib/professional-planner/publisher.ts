import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/social/crypto";
import { tokenBinding } from "@/lib/social/connections";
import { FACEBOOK_PUBLISH_SCOPE, FacebookPublishError, publishFacebookPost } from "@/lib/social/facebook";
import { InstagramPublishError, PUBLIC_APP_URL, publishInstagramMedia } from "@/lib/social/instagram";
import { parseProfessionalPlanner, professionalPlannerVersion, type PlannerPost } from "@/lib/professional-planner/validation";
import {
  duePosts,
  facebookRequest,
  instagramMediaRequest,
  isAutoPublishable,
  parsePublishLog,
  plannerPublishLogVersion,
  publishLogId,
  scheduledFor,
  staleClaimMs,
  type AutoPublishPlatform,
  type PublishLog,
  type PublishLogEntry,
} from "@/lib/professional-planner/publishing";

const sha256 = (input: string) => createHash("sha256").update(input).digest("hex");
export const plannerPublishLogId = (userId: string) => publishLogId(userId, sha256);
const publishScopes: Record<AutoPublishPlatform, string> = { instagram: "instagram_business_content_publish", facebook: FACEBOOK_PUBLISH_SCOPE };
const networkName: Record<AutoPublishPlatform, string> = { instagram: "Instagram", facebook: "Facebook" };

async function saveLog(service: SupabaseClient, userId: string, log: PublishLog) {
  const { error } = await service
    .from("onboarding_responses")
    .upsert({ id: plannerPublishLogId(userId), user_id: userId, answers: { entries: log }, selected_needs: [], roadmap_version: plannerPublishLogVersion }, { onConflict: "id" });
  if (error) throw new Error("publish_log_unavailable");
}

type Account = { accountId: string; token: string };

/** The professional's active connection for that network, with its token decrypted, or null. */
async function publishingAccount(service: SupabaseClient, tokenKey: Buffer, userId: string, platform: AutoPublishPlatform): Promise<Account | null> {
  const { data } = await service
    .from("social_connections")
    .select("provider_account_id, token_ciphertext, scopes, status")
    .eq("user_id", userId)
    .eq("provider", platform)
    .maybeSingle();
  if (!data || data.status !== "ACTIVE" || !data.token_ciphertext || !Array.isArray(data.scopes) || !data.scopes.includes(publishScopes[platform])) return null;
  const token = decryptToken(data.token_ciphertext, tokenKey, tokenBinding(platform, data.provider_account_id));
  return token ? { accountId: data.provider_account_id, token } : null;
}

type Outcome = { ok: true; mediaId: string; permalink: string | null } | { ok: false; error: string; sent: boolean };

async function publishOne(post: PlannerPost & { platform: AutoPublishPlatform }, account: Account): Promise<Outcome> {
  const network = networkName[post.platform];
  if (post.platform === "instagram") {
    const request = instagramMediaRequest(post, PUBLIC_APP_URL);
    if (!request.ok) return { ok: false, error: request.error, sent: false };
    try {
      return { ok: true, ...(await publishInstagramMedia(account.accountId, account.token, request.params)) };
    } catch (error) {
      return { ok: false, error: `No se publicó: ${error instanceof InstagramPublishError ? error.message : `${network} no respondió.`}`, sent: true };
    }
  }
  const request = facebookRequest(post, PUBLIC_APP_URL);
  if (!request.ok) return { ok: false, error: request.error, sent: false };
  try {
    return { ok: true, ...(await publishFacebookPost(account.accountId, account.token, request.request)) };
  } catch (error) {
    return { ok: false, error: `No se publicó: ${error instanceof FacebookPublishError ? error.message : `${network} no respondió.`}`, sent: true };
  }
}

/**
 * Cron side (service role): publish every professional's due Instagram and
 * Facebook posts. The log entry is written as PUBLISHING before calling the
 * network, so a run that dies halfway can't make the next run post it twice.
 */
export async function publishDuePlannerPosts(service: SupabaseClient, tokenKey: Buffer, now = Date.now()) {
  const result = { published: 0, failed: 0, notConnected: 0 };
  const { data: planners, error } = await service
    .from("onboarding_responses")
    .select("user_id, answers")
    .eq("roadmap_version", professionalPlannerVersion)
    .limit(1000);
  if (error) throw new Error("planner_storage_unavailable");

  for (const row of planners ?? []) {
    const planner = parseProfessionalPlanner(row.answers);
    if (!planner || !planner.posts.some(isAutoPublishable)) continue;
    const userId = row.user_id as string;

    const { data: logRow, error: logError } = await service.from("onboarding_responses").select("answers").eq("id", plannerPublishLogId(userId)).eq("user_id", userId).maybeSingle();
    if (logError) continue;
    const log = parsePublishLog(logRow?.answers);
    const stamp = new Date(now).toISOString();

    let changed = false;
    for (const [id, entry] of Object.entries(log)) {
      if (entry.state === "PUBLISHING" && now - Date.parse(entry.at) > staleClaimMs) {
        log[id] = { ...entry, state: "FAILED", at: stamp, error: "No sabemos si llegó a salir. Revísalo en la red antes de volver a programarla." };
        changed = true;
      }
    }

    const accounts = new Map<AutoPublishPlatform, Account | null>();
    for (const post of duePosts(planner, log, now)) {
      if (!isAutoPublishable(post)) continue;
      if (!accounts.has(post.platform)) accounts.set(post.platform, await publishingAccount(service, tokenKey, userId, post.platform));
      const account = accounts.get(post.platform);
      if (!account) {
        // Nothing is logged: once they connect the network, posts still within their window go out.
        result.notConnected += 1;
        continue;
      }
      const base: Omit<PublishLogEntry, "state"> = { scheduledFor: scheduledFor(post)!.toISOString(), at: stamp, mediaId: null, permalink: null, error: null };
      log[post.id] = { ...base, state: "PUBLISHING" };
      await saveLog(service, userId, log);
      changed = false;
      const outcome = await publishOne(post, account);
      log[post.id] = outcome.ok
        ? { ...base, state: "PUBLISHED", at: new Date().toISOString(), mediaId: outcome.mediaId, permalink: outcome.permalink }
        : { ...base, state: "FAILED", at: new Date().toISOString(), error: outcome.error.slice(0, 300) };
      if (outcome.ok) result.published += 1;
      else result.failed += 1;
      await saveLog(service, userId, log);
    }
    if (changed) await saveLog(service, userId, log);
  }
  return result;
}
