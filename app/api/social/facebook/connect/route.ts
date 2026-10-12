import { NextResponse } from "next/server";
import { newNonce, signState } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";
import { FACEBOOK_COOKIE_PATH, FACEBOOK_STATE_COOKIE, facebookAuthorizeUrl, getFacebookConfig } from "@/lib/social/facebook";

const STATE_TTL_SECONDS = 10 * 60;

/** Starts "Conectar Facebook", with the same signed state + httpOnly nonce as Instagram. */
export async function GET(request: Request) {
  const config = getFacebookConfig();
  if (!config) return NextResponse.redirect(new URL(`${SOCIAL_PAGE}?error=facebook_no_configurado`, request.url));
  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(SOCIAL_PAGE)}`, request.url));

  const nonce = newNonce();
  const state = signState({ userId: owner.user.id, nonce, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS }, config.tokenKey);
  const response = NextResponse.redirect(facebookAuthorizeUrl(config, state));
  response.cookies.set(FACEBOOK_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: FACEBOOK_COOKIE_PATH,
    maxAge: STATE_TTL_SECONDS,
  });
  return response;
}
