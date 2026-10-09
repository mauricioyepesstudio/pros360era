import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { safeEqual, verifyState } from "@/lib/social/crypto";
import { saveSocialConnection, SocialAccountInUseError, socialConnectionOwner } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";
import {
  cleanLinkedInCode,
  exchangeLinkedInCode,
  fetchLinkedInAccount,
  getLinkedInConfig,
  LINKEDIN_COOKIE_PATH,
  LINKEDIN_STATE_COOKIE,
} from "@/lib/social/linkedin";

/**
 * LinkedIn sends the person back here. Stored only if the signed state, the
 * browser's nonce cookie and the live session all name the same professional.
 * The token is encrypted before it reaches the database and never logged.
 */
export async function GET(request: NextRequest) {
  const finish = (query: string) => {
    const response = NextResponse.redirect(new URL(`${SOCIAL_PAGE}?${query}`, request.url));
    response.cookies.set(LINKEDIN_STATE_COOKIE, "", { path: LINKEDIN_COOKIE_PATH, maxAge: 0 });
    return response;
  };

  const config = getLinkedInConfig();
  if (!config) return finish("error=linkedin_no_configurado");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return finish("error=linkedin_cancelado");

  const state = verifyState(params.get("state"), config.tokenKey);
  const cookieNonce = request.cookies.get(LINKEDIN_STATE_COOKIE)?.value ?? "";
  if (!state || !safeEqual(Buffer.from(state.nonce), Buffer.from(cookieNonce))) return finish("error=sesion");

  const owner = await socialConnectionOwner();
  if (!owner || owner.user.id !== state.userId) return finish("error=sesion");

  const code = cleanLinkedInCode(params.get("code"));
  if (!code) return finish("error=linkedin_cancelado");

  const service = createSupabaseServiceRoleClient();
  if (!service) return finish("error=linkedin_no_configurado");

  try {
    const token = await exchangeLinkedInCode(config, code);
    const account = await fetchLinkedInAccount(token.accessToken);
    await saveSocialConnection(service, "linkedin", {
      userId: owner.user.id,
      account: { id: account.id, username: account.name, accountType: "PERSON" },
      token,
      scopes: token.grantedScopes,
      tokenKey: config.tokenKey,
    });
    return finish("conectado=linkedin");
  } catch (error) {
    if (error instanceof SocialAccountInUseError) return finish("error=linkedin_en_uso");
    console.error("linkedin_connect_failed", error instanceof Error ? error.message : "unknown");
    return finish("error=linkedin");
  }
}
