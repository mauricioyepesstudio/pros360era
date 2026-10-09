import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { socialConnectionOwner } from "@/lib/social/connections";
import { syncInstagramInboxForOwner } from "@/lib/social/inbox-sync";
import { getInstagramConfig, PUBLIC_APP_URL } from "@/lib/social/instagram";

const CONVERSATIONS_PAGE = "/crm/conversations";

/**
 * "Traer ahora" in /crm/conversations (a plain form POST). The session decides
 * whose connection is read; nothing in the request body is trusted. The
 * service role is used only after that check, to read the encrypted token.
 */
export async function POST(request: Request) {
  const back = (query: string) => NextResponse.redirect(new URL(`${CONVERSATIONS_PAGE}?${query}`, request.url), 303);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && origin !== PUBLIC_APP_URL) return new Response("Forbidden", { status: 403 });

  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(CONVERSATIONS_PAGE)}`, request.url), 303);
  const config = getInstagramConfig();
  const service = createSupabaseServiceRoleClient();
  if (!config || !service) return back("error=no_configurado");

  try {
    const result = await syncInstagramInboxForOwner(service, config.tokenKey, owner.user.id);
    if ("skipped" in result) return back(result.skipped === "cooldown" ? "aviso=espera" : "error=sin_conexion");
    return back(`traidos=${result.imported}&nuevos=${result.leadsCreated}${result.partial ? "&parcial=1" : ""}`);
  } catch (error) {
    console.error("instagram_inbox_failed", error instanceof Error ? error.message : "unknown");
    return back("error=instagram");
  }
}
