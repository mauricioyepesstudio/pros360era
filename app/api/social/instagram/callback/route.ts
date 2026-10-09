import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual, verifyState } from "@/lib/social/crypto";
import { InstagramAccountInUseError, saveInstagramConnection, socialConnectionOwner } from "@/lib/social/connections";
import {
  cleanAuthCode,
  exchangeCodeForLongLivedToken,
  fetchInstagramAccount,
  getInstagramConfig,
  INSTAGRAM_STATE_COOKIE,
  SOCIAL_PAGE,
} from "@/lib/social/instagram";

/**
 * Instagram sends the person back here. Nothing is stored unless the signed
 * state, the browser's nonce cookie and the live session all name the same
 * professional. The token is encrypted before it reaches the database and is
 * never logged or returned.
 */
export async function GET(request: NextRequest) {
  const finish = (query: string) => {
    const response = NextResponse.redirect(new URL(`${SOCIAL_PAGE}?${query}`, request.url));
    response.cookies.set(INSTAGRAM_STATE_COOKIE, "", { path: "/api/social/instagram", maxAge: 0 });
    return response;
  };

  const config = getInstagramConfig();
  if (!config) return finish("error=no_configurado");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return finish("error=cancelado");

  const state = verifyState(params.get("state"), config.tokenKey);
  const cookieNonce = request.cookies.get(INSTAGRAM_STATE_COOKIE)?.value ?? "";
  if (!state || !safeEqual(Buffer.from(state.nonce), Buffer.from(cookieNonce))) return finish("error=sesion");

  const owner = await socialConnectionOwner();
  if (!owner || owner.user.id !== state.userId) return finish("error=sesion");

  const code = cleanAuthCode(params.get("code"));
  if (!code) return finish("error=cancelado");

  const service = createSupabaseServiceRoleClient();
  if (!service) return finish("error=no_configurado");

  try {
    const token = await exchangeCodeForLongLivedToken(config, code);
    const account = await fetchInstagramAccount(token.accessToken);
    await saveInstagramConnection(service, { userId: owner.user.id, account, token, scopes: token.grantedScopes, tokenKey: config.tokenKey });
    return finish("conectado=instagram");
  } catch (error) {
    if (error instanceof InstagramAccountInUseError) return finish("error=cuenta_en_uso");
    console.error("instagram_connect_failed", error instanceof Error ? error.message : "unknown");
    return finish("error=instagram");
  }
}
