import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { parseSignedRequest } from "@/lib/social/crypto";
import { revokeInstagramAccount } from "@/lib/social/connections";
import { getInstagramConfig } from "@/lib/social/instagram";

/**
 * Meta calls this when someone removes EVOLUSA from their Instagram
 * (Configuración → Apps y sitios web). Signed with the Instagram app secret.
 */
export async function POST(request: Request) {
  const config = getInstagramConfig();
  if (!config) return new Response("Not configured", { status: 503 });
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), config.appSecret);
  const accountId = data && (typeof data.user_id === "string" || typeof data.user_id === "number") ? String(data.user_id) : null;
  if (!accountId) return new Response("Invalid signed_request", { status: 400 });

  const service = createSupabaseServiceRoleClient();
  if (!service) return new Response("Service unavailable", { status: 503 });
  try {
    await revokeInstagramAccount(service, accountId);
  } catch {
    return new Response("Service unavailable", { status: 503 });
  }
  return new Response(null, { status: 200 });
}
