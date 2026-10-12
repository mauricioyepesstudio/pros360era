import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { readSocialTokenKey, safeEqual } from "@/lib/social/crypto";
import { publishDuePlannerPosts } from "@/lib/professional-planner/publisher";

export const maxDuration = 60;

/**
 * Publishes planner posts whose time has come. Called every few minutes by
 * .github/workflows/publicar-planner.yml with `Authorization: Bearer $CRON_SECRET`
 * (Vercel Hobby crons only run once a day). Without the secret it refuses.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(Buffer.from(header), Buffer.from(`Bearer ${secret}`))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const tokenKey = readSocialTokenKey();
  const service = createSupabaseServiceRoleClient();
  if (!tokenKey || !service) return Response.json({ skipped: "not_configured" });
  try {
    return Response.json(await publishDuePlannerPosts(service, tokenKey));
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
