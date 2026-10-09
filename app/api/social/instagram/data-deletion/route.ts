import { randomBytes } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { parseSignedRequest } from "@/lib/social/crypto";
import { deleteInstagramAccountData } from "@/lib/social/connections";
import { getInstagramConfig, PUBLIC_APP_URL } from "@/lib/social/instagram";

/**
 * Meta's data-deletion callback. Deletes everything EVOLUSA holds for that
 * Instagram account and answers with the status URL and code Meta shows the
 * person (https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback).
 */
export async function POST(request: Request) {
  const config = getInstagramConfig();
  if (!config) return Response.json({ error: "not_configured" }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""), config.appSecret);
  const accountId = data && (typeof data.user_id === "string" || typeof data.user_id === "number") ? String(data.user_id) : null;
  if (!accountId) return Response.json({ error: "invalid_signed_request" }, { status: 400 });

  const service = createSupabaseServiceRoleClient();
  if (!service) return Response.json({ error: "unavailable" }, { status: 503 });

  const confirmationCode = randomBytes(12).toString("hex");
  try {
    await deleteInstagramAccountData(service, accountId, confirmationCode);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  return Response.json({ url: `${PUBLIC_APP_URL}/privacidad/eliminacion?codigo=${confirmationCode}`, confirmation_code: confirmationCode });
}
