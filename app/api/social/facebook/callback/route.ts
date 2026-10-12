import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual, verifyState } from "@/lib/social/crypto";
import { saveSocialConnection, SocialAccountInUseError, socialConnectionOwner } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";
import { cleanFacebookCode, connectFacebookPage, FACEBOOK_COOKIE_PATH, FACEBOOK_STATE_COOKIE, FacebookNoPageError, getFacebookConfig } from "@/lib/social/facebook";

/**
 * Facebook sends the person back here. Stored only if the signed state, the
 * browser's nonce cookie and the live session all name the same professional.
 * Only the Page token is kept, encrypted; the user token is never stored.
 */
export async function GET(request: NextRequest) {
  const finish = (query: string) => {
    const response = NextResponse.redirect(new URL(`${SOCIAL_PAGE}?${query}`, request.url));
    response.cookies.set(FACEBOOK_STATE_COOKIE, "", { path: FACEBOOK_COOKIE_PATH, maxAge: 0 });
    return response;
  };

  const config = getFacebookConfig();
  if (!config) return finish("error=facebook_no_configurado");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return finish("error=facebook_cancelado");

  const state = verifyState(params.get("state"), config.tokenKey);
  const cookieNonce = request.cookies.get(FACEBOOK_STATE_COOKIE)?.value ?? "";
  if (!state || !safeEqual(Buffer.from(state.nonce), Buffer.from(cookieNonce))) return finish("error=sesion");

  const owner = await socialConnectionOwner();
  if (!owner || owner.user.id !== state.userId) return finish("error=sesion");

  const code = cleanFacebookCode(params.get("code"));
  if (!code) return finish("error=facebook_cancelado");

  const service = createSupabaseServiceRoleClient();
  if (!service) return finish("error=facebook_no_configurado");

  try {
    const { page, grantedScopes } = await connectFacebookPage(config, code);
    await saveSocialConnection(service, "facebook", {
      userId: owner.user.id,
      account: { id: page.id, username: page.name, accountType: "PAGE" },
      token: { accessToken: page.accessToken, expiresAt: null },
      scopes: grantedScopes,
      tokenKey: config.tokenKey,
    });
    return finish("conectado=facebook");
  } catch (error) {
    if (error instanceof SocialAccountInUseError) return finish("error=facebook_en_uso");
    if (error instanceof FacebookNoPageError) return finish("error=facebook_sin_pagina");
    console.error("facebook_connect_failed", error instanceof Error ? error.message : "unknown");
    return finish("error=facebook");
  }
}
