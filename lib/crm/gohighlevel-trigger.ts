import { after } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { readSocialTokenKey } from "@/lib/social/crypto";
import { syncGhlForOwner } from "@/lib/crm/gohighlevel-sync";

/**
 * After the response is sent, copy this owner's new leads to GoHighLevel if
 * they connected it. Never slows down or fails the request that saved the
 * lead; whatever fails here is retried by the daily cron.
 */
export function syncGhlSoon(userId: string) {
  after(async () => {
    const tokenKey = readSocialTokenKey();
    const service = createSupabaseServiceRoleClient();
    if (!tokenKey || !service) return;
    try {
      await syncGhlForOwner(service, tokenKey, userId);
    } catch {
      console.error("ghl_after_lead_failed");
    }
  });
}
