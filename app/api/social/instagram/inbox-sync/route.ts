import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual } from "@/lib/social/crypto";
import { syncAllInstagramInboxes } from "@/lib/social/inbox-sync";
import { getInstagramConfig } from "@/lib/social/instagram";

export const maxDuration = 60;

/**
 * Daily Vercel cron (vercel.json): pulls recent Instagram comments and direct
 * messages of every connected professional into their CRM. Real-time webhooks
 * replace this once Meta approves the app. Requires `Bearer $CRON_SECRET`.
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
    return Response.json(await syncAllInstagramInboxes(service, config.tokenKey));
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
