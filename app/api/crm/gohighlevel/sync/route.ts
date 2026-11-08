import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { readSocialTokenKey } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";
import { PUBLIC_APP_URL, SOCIAL_PAGE } from "@/lib/social/instagram";
import { syncGhlForOwner } from "@/lib/crm/gohighlevel-sync";

export const maxDuration = 60;

/** "Enviar ahora": pushes the session owner's pending leads to their GoHighLevel. */
export async function POST(request: Request) {
  const back = (query: string) => NextResponse.redirect(new URL(`${SOCIAL_PAGE}?${query}#gohighlevel`, request.url), 303);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && origin !== PUBLIC_APP_URL) return new Response("Forbidden", { status: 403 });

  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(SOCIAL_PAGE)}`, request.url), 303);
  const tokenKey = readSocialTokenKey();
  const service = createSupabaseServiceRoleClient();
  if (!tokenKey || !service) return back("error=ghl_no_configurado");

  try {
    const result = await syncGhlForOwner(service, tokenKey, owner.user.id);
    if (!result) return back("error=ghl_sin_conexion");
    if (result.stopped === "auth") return back("error=ghl_rechazado");
    return back(`ghl_enviados=${result.sent}${result.failed ? `&ghl_fallidos=${result.failed}` : ""}`);
  } catch {
    console.error("ghl_sync_failed");
    return back("error=ghl_caido");
  }
}
