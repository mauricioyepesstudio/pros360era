import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual } from "@/lib/social/crypto";
import { refreshDueInstagramTokens } from "@/lib/social/connections";
import { getInstagramConfig } from "@/lib/social/instagram";

/**
 * Daily Vercel cron (vercel.json). Instagram tokens last 60 days; this renews
 * the ones close to expiring so connections don't silently die. Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; without that secret set, it refuses.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(Buffer.from(header), Buffer.from(`Bearer ${secret}`))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const config = getInstagramConfig();
  const service = createSupabaseServiceRoleClient();
  if (!config || !service) return Response.json({ skipped: "not_configured" });
  try {
    return Response.json(await refreshDueInstagramTokens(service, config.tokenKey));
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
