import { NextResponse } from "next/server";
import { newNonce, signState } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";
import { getInstagramConfig, instagramAuthorizeUrl, INSTAGRAM_STATE_COOKIE, SOCIAL_PAGE } from "@/lib/social/instagram";

const STATE_TTL_SECONDS = 10 * 60;

/**
 * Starts "Conectar Instagram". The signed state carries the EVOLUSA user id
 * and a nonce that must also come back in an httpOnly cookie, so a callback
 * only completes in the browser and session that started it.
 */
export async function GET(request: Request) {
  const back = (reason: string) => NextResponse.redirect(new URL(`${SOCIAL_PAGE}?error=${reason}`, request.url));
  const config = getInstagramConfig();
  if (!config) return back("no_configurado");
  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(SOCIAL_PAGE)}`, request.url));

  const nonce = newNonce();
  const state = signState({ userId: owner.user.id, nonce, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS }, config.tokenKey);
  const response = NextResponse.redirect(instagramAuthorizeUrl(config, state));
  response.cookies.set(INSTAGRAM_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/social/instagram",
    maxAge: STATE_TTL_SECONDS,
  });
  return response;
}
