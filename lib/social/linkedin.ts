import { readSocialTokenKey } from "./crypto.ts";
import { PUBLIC_APP_URL } from "./instagram.ts";

/**
 * LinkedIn for a professional's personal profile, using the two self-serve
 * products of the EVOLUSA LinkedIn app: "Sign In with LinkedIn using OpenID
 * Connect" (who they are) and "Share on LinkedIn" (w_member_social, to post).
 * No LinkedIn review is needed, so any professional can connect on their own.
 *
 * LinkedIn gives these apps no refresh token: a connection lasts about 60
 * days and then the professional reconnects with one click.
 *
 * The callback URL must match the one registered in the LinkedIn app (Auth tab).
 */
export const LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"] as const;
export const LINKEDIN_CALLBACK_PATH = "/api/social/linkedin/callback";
export const LINKEDIN_STATE_COOKIE = "evolusa_li_state";
export const LINKEDIN_COOKIE_PATH = "/api/social/linkedin";

export type LinkedInConfig = { clientId: string; clientSecret: string; tokenKey: Buffer; redirectUri: string };

/** Null until every server secret is set in Vercel. Nothing is faked without them. */
export function getLinkedInConfig(env: NodeJS.ProcessEnv = process.env): LinkedInConfig | null {
  const clientId = env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = env.LINKEDIN_CLIENT_SECRET?.trim();
  const tokenKey = readSocialTokenKey(env.SOCIAL_TOKEN_KEY);
  if (!clientId || !/^[A-Za-z0-9]{6,64}$/.test(clientId) || !clientSecret || !tokenKey) return null;
  return { clientId, clientSecret, tokenKey, redirectUri: `${PUBLIC_APP_URL}${LINKEDIN_CALLBACK_PATH}` };
}

export function linkedInAuthorizeUrl(config: LinkedInConfig, state: string): string {
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", LINKEDIN_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

export function cleanLinkedInCode(code: string | null): string | null {
  if (!code) return null;
  const cleaned = code.trim();
  return /^[A-Za-z0-9_.~-]{10,2048}$/.test(cleaned) ? cleaned : null;
}

export type LinkedInToken = { accessToken: string; expiresAt: Date; grantedScopes: string[] };
export type LinkedInAccount = { id: string; name: string };

type Fetch = typeof fetch;

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.error) throw new Error(`linkedin_${response.status}`);
  return data;
}

export async function exchangeLinkedInCode(config: LinkedInConfig, code: string, fetchImpl: Fetch = fetch, now = Date.now()): Promise<LinkedInToken> {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });
  const data = await readJson(
    await fetchImpl("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
    }),
  );
  const accessToken = typeof data.access_token === "string" ? data.access_token : null;
  const expiresIn = typeof data.expires_in === "number" && data.expires_in > 0 ? data.expires_in : null;
  if (!accessToken || !expiresIn) throw new Error("linkedin_no_token");
  const scope = typeof data.scope === "string" ? data.scope : "";
  return { accessToken, expiresAt: new Date(now + expiresIn * 1000), grantedScopes: scope.split(/[\s,]+/).filter(Boolean) };
}

/** OpenID userinfo: `sub` is the member id used as urn:li:person:{sub} when posting. */
export async function fetchLinkedInAccount(accessToken: string, fetchImpl: Fetch = fetch): Promise<LinkedInAccount> {
  const data = await readJson(
    await fetchImpl("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }),
  );
  const id = typeof data.sub === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(data.sub) ? data.sub : null;
  const fullName = typeof data.name === "string" ? data.name.trim() : [data.given_name, data.family_name].filter((part) => typeof part === "string").join(" ").trim();
  if (!id) throw new Error("linkedin_no_account");
  return { id, name: Array.from(fullName || "LinkedIn").slice(0, 64).join("") };
}
