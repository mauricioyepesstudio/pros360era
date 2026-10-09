import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual } from "@/lib/social/crypto";
import { expireDueLinkedInConnections, refreshDueInstagramTokens } from "@/lib/social/connections";
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
  if (!service) return Response.json({ skipped: "not_configured" });

  // LinkedIn can't be renewed; expired connections are marked so the panel asks to reconnect.
  // Runs on its own so neither network's failure or missing config blocks the other.
  let linkedinExpired: number | "error" = 0;
  try {
    linkedinExpired = await expireDueLinkedInConnections(service);
  } catch {
    linkedinExpired = "error";
  }
  if (!config) return Response.json({ instagram: "not_configured", linkedinExpired });
  try {
    return Response.json({ ...(await refreshDueInstagramTokens(service, config.tokenKey)), linkedinExpired });
  } catch {
    return Response.json({ error: "unavailable", linkedinExpired }, { status: 503 });
  }
}
