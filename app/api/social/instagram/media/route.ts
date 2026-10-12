import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { socialConnectionOwner, tokenBinding } from "@/lib/social/connections";
import { decryptToken } from "@/lib/social/crypto";
import { getInstagramConfig, INSTAGRAM_GRAPH_VERSION } from "@/lib/social/instagram";
import { instagramHistory } from "@/lib/professional-planner/instagram-history";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

/** Owner-scoped read only. No tokens, user IDs or provider errors reach the browser. */
export async function GET() {
  const owner = await socialConnectionOwner();
  if (!owner) return reply({ error: "Necesitas entrar con tu cuenta profesional." }, 401);
  const config = getInstagramConfig();
  const service = createSupabaseServiceRoleClient();
  if (!config || !service) return reply({ error: "No podemos consultar Instagram en este momento." }, 503);
  const { data, error } = await service.from("social_connections")
    .select("provider_account_id, token_ciphertext, token_expires_at, status, scopes")
    .eq("user_id", owner.user.id).eq("provider", "instagram").maybeSingle();
  if (error) return reply({ error: "No pudimos comprobar tu conexión." }, 503);
  if (!data || data.status !== "ACTIVE" || !data.token_ciphertext || Date.parse(data.token_expires_at) <= Date.now())
    return reply({ error: "Conecta o renueva tu Instagram en Redes." }, 409);
  if (!Array.isArray(data.scopes) || !data.scopes.includes("instagram_business_basic"))
    return reply({ error: "Vuelve a conectar Instagram para permitir la lectura de tus publicaciones." }, 409);
  const token = decryptToken(data.token_ciphertext, config.tokenKey, tokenBinding("instagram", data.provider_account_id));
  if (!token) return reply({ error: "Vuelve a conectar Instagram en Redes." }, 409);
  try {
    const url = new URL(`https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}/${data.provider_account_id}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", "100");
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = await response.json();
    if (!response.ok || body.error || !Array.isArray(body.data))
      return reply({ error: "Instagram no permitió leer tus publicaciones. Revisa la conexión en Redes y reintenta." }, 502);
    return reply(instagramHistory(body));
  } catch {
    return reply({ error: "Instagram no respondió. Puedes reintentar; tus publicaciones guardadas siguen intactas." }, 502);
  }
}
