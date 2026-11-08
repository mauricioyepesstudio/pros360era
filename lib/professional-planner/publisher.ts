import { LINKEDIN_PUBLISH_SCOPE, LinkedInPublishError, publishLinkedInPost } from "@/lib/social/linkedin-publishing";
import { ThreadsPublishError, publishThreadsMedia } from "@/lib/social/threads";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/social/crypto";
import { tokenBinding } from "@/lib/social/connections";
import { FACEBOOK_PUBLISH_SCOPE, FacebookPublishError, publishFacebookPost } from "@/lib/social/facebook";
import { InstagramPublishError, PUBLIC_APP_URL, publishInstagramMedia } from "@/lib/social/instagram";
import { evolusaContentPublishError, isEvolusaBrandedPost, isEvolusaHouseAccount } from "@/lib/professional-planner/house-content";
import { parseProfessionalPlanner, professionalPlannerVersion, type PlannerPost } from "@/lib/professional-planner/validation";
import {
  duePosts,
  canStartPlannerPublication,
  plannerPublishRunBudgetMs,
  facebookRequest,
  linkedInRequest,
  threadsRequest,
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
const publishScopes: Record<AutoPublishPlatform, string> = { instagram: "instagram_business_content_publish", facebook: FACEBOOK_PUBLISH_SCOPE, linkedin: LINKEDIN_PUBLISH_SCOPE, threads: "threads_content_publish" };
const networkName: Record<AutoPublishPlatform, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", threads: "Threads" };

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
    .select("provider_account_id, token_ciphertext, scopes, status, token_expires_at")
    .eq("user_id", userId)
    .eq("provider", platform)
    .maybeSingle();
  if (data?.token_expires_at && Date.parse(data.token_expires_at) <= Date.now()) return null;
  if (!data || data.status !== "ACTIVE" || !data.token_ciphertext || !Array.isArray(data.scopes) || !data.scopes.includes(publishScopes[platform])) return null;
  const token = decryptToken(data.token_ciphertext, tokenKey, tokenBinding(platform, data.provider_account_id));
  return token ? { accountId: data.provider_account_id, token } : null;
}

type Outcome = { ok: true; mediaId: string; permalink: string | null } | { ok: false; error: string; sent: boolean };

async function publishOne(post: PlannerPost & { platform: AutoPublishPlatform }, account: Account, deadline: number): Promise<Outcome> {
  const network = networkName[post.platform];
  if (post.platform === "instagram") {
    const request = instagramMediaRequest(post, PUBLIC_APP_URL);
    if (!request.ok) return { ok: false, error: request.error, sent: false };
    try {
      return { ok: true, ...(await publishInstagramMedia(account.accountId, account.token, request.params, undefined, undefined, { deadline })) };
    } catch (error) {
      return { ok: false, error: error instanceof InstagramPublishError && error.publicationUncertain
        ? error.message
        : `No se publicó: ${error instanceof InstagramPublishError ? error.message : `${network} no respondió.`}`, sent: true };
    }
  }
  if (post.platform === "linkedin" || post.platform === "threads") {
    try {
      if (post.platform === "linkedin") {
        const request = linkedInRequest(post, PUBLIC_APP_URL);
        if (!request.ok) return { ok: false, error: request.error, sent: false };
        return { ok: true, ...(await publishLinkedInPost(account.accountId, account.token, request.request, undefined, undefined, { deadline })) };
      }
      const request = threadsRequest(post, PUBLIC_APP_URL);
      if (!request.ok) return { ok: false, error: request.error, sent: false };
      return { ok: true, ...(await publishThreadsMedia(account.accountId, account.token, request.params, undefined, undefined, { deadline })) };
    } catch (error) {
      const known = error instanceof LinkedInPublishError || error instanceof ThreadsPublishError;
      return { ok: false, error: known && error.publicationUncertain ? error.message : `No se publicó: ${known ? error.message : `${network} no respondió.`}`, sent: true };
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
  const deadline = Date.now() + plannerPublishRunBudgetMs;
  const result = { published: 0, failed: 0, notConnected: 0, deferred: 0 };
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
    let houseAccount: boolean | null = null;
    for (const post of duePosts(planner, log, now)) {
      if (!isAutoPublishable(post)) continue;
      // Leave unstarted posts unclaimed for the next cron run.
      if (!canStartPlannerPublication(deadline, Date.now())) {
        if (changed) await saveLog(service, userId, log);
        result.deferred += 1;
        return result;
      }
      if (isEvolusaBrandedPost(post)) {
        // Only EVOLUSA's own planner may send EVOLUSA material; fail closed if we can't tell.
        if (houseAccount === null) {
          const { data: owner, error: ownerError } = await service.auth.admin.getUserById(userId);
          houseAccount = !ownerError && isEvolusaHouseAccount(owner?.user?.email);
        }
        if (!houseAccount) {
          log[post.id] = { scheduledFor: scheduledFor(post)!.toISOString(), at: stamp, mediaId: null, permalink: null, error: evolusaContentPublishError, state: "FAILED" };
          changed = true;
          result.failed += 1;
          continue;
        }
      }
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
      const outcome = await publishOne(post, account, deadline);
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
