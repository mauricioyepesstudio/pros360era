import { NextResponse } from "next/server";
import { newNonce, signState } from "@/lib/social/crypto";
import { socialConnectionOwner } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";
import { getLinkedInConfig, LINKEDIN_COOKIE_PATH, LINKEDIN_STATE_COOKIE, linkedInAuthorizeUrl } from "@/lib/social/linkedin";

const STATE_TTL_SECONDS = 10 * 60;

/** Starts "Conectar LinkedIn", with the same signed state + httpOnly nonce as Instagram. */
export async function GET(request: Request) {
  const config = getLinkedInConfig();
  if (!config) return NextResponse.redirect(new URL(`${SOCIAL_PAGE}?error=linkedin_no_configurado`, request.url));
  const owner = await socialConnectionOwner();
  if (!owner) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(SOCIAL_PAGE)}`, request.url));

  const nonce = newNonce();
  const state = signState({ userId: owner.user.id, nonce, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS }, config.tokenKey);
  const response = NextResponse.redirect(linkedInAuthorizeUrl(config, state));
  response.cookies.set(LINKEDIN_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: LINKEDIN_COOKIE_PATH,
    maxAge: STATE_TTL_SECONDS,
  });
  return response;
}
