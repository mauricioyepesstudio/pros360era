import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { readSocialTokenKey, safeEqual } from "@/lib/social/crypto";
import { syncAllInstagramInboxes } from "@/lib/social/inbox-sync";
import { getInstagramConfig } from "@/lib/social/instagram";
import { syncAllGhl } from "@/lib/crm/gohighlevel-sync";

export const maxDuration = 60;

/**
 * Daily Vercel cron (vercel.json): pulls recent Instagram comments and direct
 * messages of every connected professional into their CRM. Real-time webhooks
 * replace this once Meta approves the app. Then copies new CRM leads to the
 * GoHighLevel of each professional who connected it (independent of Instagram
 * being configured). Requires `Bearer $CRON_SECRET`.
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
  let instagram: unknown = { skipped: "not_configured" };
  if (config) {
    try {
      instagram = await syncAllInstagramInboxes(service, config.tokenKey);
    } catch {
      instagram = { error: "unavailable" };
    }
  }
  const tokenKey = readSocialTokenKey();
  let gohighlevel: unknown = { skipped: "not_configured" };
  if (tokenKey) {
    try {
      gohighlevel = await syncAllGhl(service, tokenKey);
    } catch {
      gohighlevel = { error: "unavailable" };
    }
  }
  return Response.json({ instagram, gohighlevel });
}
