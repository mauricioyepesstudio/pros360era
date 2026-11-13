import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { readSocialTokenKey } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";
import { isAppOrigin, SOCIAL_PAGE } from "@/lib/social/instagram";
import { cleanLocationId, cleanToken, verifyGhlCredentials } from "@/lib/crm/gohighlevel";
import { saveGhlConnection } from "@/lib/crm/gohighlevel-sync";

/**
 * "Conectar GoHighLevel" in /panel-profesional/redes (a plain form POST).
 * The session decides whose connection it is; the token is checked against
 * GoHighLevel (read-only) before it is encrypted and saved. It is never
 * logged or sent back to the browser.
 */
export async function POST(request: Request) {
  const back = (query: string) => NextResponse.redirect(new URL(`${SOCIAL_PAGE}?${query}#gohighlevel`, request.url), 303);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && !isAppOrigin(origin)) return new Response("Forbidden", { status: 403 });

  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(SOCIAL_PAGE)}`, request.url), 303);
  const tokenKey = readSocialTokenKey();
  const service = createSupabaseServiceRoleClient();
  if (!tokenKey || !service) return back("error=ghl_no_configurado");

  const form = await request.formData().catch(() => null);
  const locationId = cleanLocationId(form?.get("locationId"));
  const token = cleanToken(form?.get("token"));
  if (!locationId || !token) return back("error=ghl_datos");

  const verified = await verifyGhlCredentials({ locationId, token });
  if (!verified.ok) return back(verified.error === "auth" ? "error=ghl_rechazado" : verified.error === "rejected" ? "error=ghl_datos" : "error=ghl_caido");

  try {
    await saveGhlConnection(service, tokenKey, owner.user.id, { locationId, locationName: verified.value.locationName, token });
  } catch {
    console.error("ghl_connect_failed");
    return back("error=ghl_guardar");
  }
  return back("conectado=gohighlevel");
}
