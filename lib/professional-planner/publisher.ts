import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/social/crypto";
import { tokenBinding } from "@/lib/social/connections";
import { InstagramPublishError, PUBLIC_APP_URL, publishInstagramMedia, type InstagramConfig } from "@/lib/social/instagram";
import { parseProfessionalPlanner, professionalPlannerVersion } from "@/lib/professional-planner/validation";
import {
  duePosts,
  instagramMediaRequest,
  parsePublishLog,
  plannerPublishLogVersion,
  publishLogId,
  scheduledFor,
  staleClaimMs,
  type PublishLog,
  type PublishLogEntry,
} from "@/lib/professional-planner/publishing";

const sha256 = (input: string) => createHash("sha256").update(input).digest("hex");
export const plannerPublishLogId = (userId: string) => publishLogId(userId, sha256);
const publishScope = "instagram_business_content_publish";

async function saveLog(service: SupabaseClient, userId: string, log: PublishLog) {
  const { error } = await service
    .from("onboarding_responses")
    .upsert({ id: plannerPublishLogId(userId), user_id: userId, answers: { entries: log }, selected_needs: [], roadmap_version: plannerPublishLogVersion }, { onConflict: "id" });
  if (error) throw new Error("publish_log_unavailable");
}

/**
 * Cron side (service role): publish every professional's due Instagram posts.
 * The log entry is written as PUBLISHING before calling Instagram, so a run
 * that dies halfway can't make the next run post the same thing again.
 */
export async function publishDuePlannerPosts(service: SupabaseClient, config: InstagramConfig, now = Date.now()) {
  const result = { published: 0, failed: 0, notConnected: 0 };
  const { data: planners, error } = await service
    .from("onboarding_responses")
    .select("user_id, answers")
    .eq("roadmap_version", professionalPlannerVersion)
    .limit(1000);
  if (error) throw new Error("planner_storage_unavailable");

  for (const row of planners ?? []) {
    const planner = parseProfessionalPlanner(row.answers);
    if (!planner || !planner.posts.some((post) => post.status === "READY" && post.platform === "instagram")) continue;
    const userId = row.user_id as string;

    const { data: logRow, error: logError } = await service.from("onboarding_responses").select("answers").eq("id", plannerPublishLogId(userId)).eq("user_id", userId).maybeSingle();
    if (logError) continue;
    const log = parsePublishLog(logRow?.answers);
    const stamp = new Date(now).toISOString();

    let changed = false;
    for (const [id, entry] of Object.entries(log)) {
      if (entry.state === "PUBLISHING" && now - Date.parse(entry.at) > staleClaimMs) {
        log[id] = { ...entry, state: "FAILED", at: stamp, error: "No sabemos si llegó a salir. Revisa tu Instagram antes de volver a programarla." };
        changed = true;
      }
    }

    const due = duePosts(planner, log, now);
    if (due.length === 0) {
      if (changed) await saveLog(service, userId, log);
      continue;
    }

    const { data: connection } = await service
      .from("social_connections")
      .select("provider_account_id, token_ciphertext, scopes, status")
      .eq("user_id", userId)
      .eq("provider", "instagram")
      .maybeSingle();
    const token =
      connection?.status === "ACTIVE" && connection.token_ciphertext && Array.isArray(connection.scopes) && connection.scopes.includes(publishScope)
        ? decryptToken(connection.token_ciphertext, config.tokenKey, tokenBinding("instagram", connection.provider_account_id))
        : null;
    if (!connection || !token) {
      // Nothing is logged: once they connect Instagram, posts still within their window go out.
      result.notConnected += 1;
      if (changed) await saveLog(service, userId, log);
      continue;
    }

    for (const post of due) {
      const at = scheduledFor(post)!.toISOString();
      const request = instagramMediaRequest(post, PUBLIC_APP_URL);
      const base: Omit<PublishLogEntry, "state"> = { scheduledFor: at, at: stamp, mediaId: null, permalink: null, error: null };
      if (!request.ok) {
        log[post.id] = { ...base, state: "FAILED", error: request.error };
        result.failed += 1;
        await saveLog(service, userId, log);
        continue;
      }
      log[post.id] = { ...base, state: "PUBLISHING" };
      await saveLog(service, userId, log);
      try {
        const published = await publishInstagramMedia(connection.provider_account_id, token, request.params);
        log[post.id] = { ...base, state: "PUBLISHED", at: new Date().toISOString(), mediaId: published.mediaId, permalink: published.permalink };
        result.published += 1;
      } catch (publishError) {
        const message = publishError instanceof InstagramPublishError ? publishError.message : "Instagram no respondió.";
        log[post.id] = { ...base, state: "FAILED", at: new Date().toISOString(), error: `No se publicó: ${message}`.slice(0, 300) };
        result.failed += 1;
      }
      await saveLog(service, userId, log);
    }
  }
  return result;
}
