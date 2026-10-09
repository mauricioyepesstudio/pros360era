import { readSocialTokenKey } from "./crypto.ts";

/**
 * Instagram API with Instagram Login (business/creator accounts). The old
 * Basic Display flow in app/api/growth-automation was shut down by Meta in
 * December 2024 and is not used here.
 *
 * The URLs below are the ones registered in the Meta app dashboard; changing
 * them means changing them there too (cerebro-evolusa/meta-pasos.md).
 */
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
] as const;

export const INSTAGRAM_GRAPH_VERSION = "v23.0";
export const PUBLIC_APP_URL = "https://evolusa.vercel.app";
export const INSTAGRAM_CALLBACK_PATH = "/api/social/instagram/callback";
export const INSTAGRAM_STATE_COOKIE = "evolusa_ig_state";
export const SOCIAL_PAGE = "/panel-profesional/redes";

export type InstagramConfig = { appId: string; appSecret: string; tokenKey: Buffer; redirectUri: string };

/** Null until every server secret is set in Vercel. Nothing is faked without them. */
export function getInstagramConfig(env: NodeJS.ProcessEnv = process.env): InstagramConfig | null {
  const appId = env.INSTAGRAM_APP_ID?.trim();
  const appSecret = env.INSTAGRAM_APP_SECRET?.trim();
  const tokenKey = readSocialTokenKey(env.SOCIAL_TOKEN_KEY);
  if (!appId || !/^\d+$/.test(appId) || !appSecret || !tokenKey) return null;
  return { appId, appSecret, tokenKey, redirectUri: `${PUBLIC_APP_URL}${INSTAGRAM_CALLBACK_PATH}` };
}

export function instagramAuthorizeUrl(config: InstagramConfig, state: string): string {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", INSTAGRAM_SCOPES.join(","));
  url.searchParams.set("enable_fb_login", "false");
  url.searchParams.set("state", state);
  return url.toString();
}

/** Meta appends "#_" to the code in some clients; it is not part of it. */
export function cleanAuthCode(code: string | null): string | null {
  if (!code) return null;
  const cleaned = code.replace(/#_$/, "").trim();
  return cleaned.length > 0 && cleaned.length <= 2048 ? cleaned : null;
}

export type InstagramToken = { accessToken: string; expiresAt: Date };
export type InstagramAccount = { id: string; username: string; accountType: string | null };

type Fetch = typeof fetch;

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.error || data.error_type) {
    throw new Error(`instagram_${response.status}`);
  }
  return data;
}

/** Code → short-lived token → long-lived token (about 60 days). */
export async function exchangeCodeForLongLivedToken(
  config: InstagramConfig,
  code: string,
  fetchImpl: Fetch = fetch,
  now = Date.now(),
): Promise<InstagramToken & { grantedScopes: string[] }> {
  const form = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code,
  });
  const short = await readJson(await fetchImpl("https://api.instagram.com/oauth/access_token", { method: "POST", body: form, cache: "no-store" }));
  const row = (Array.isArray(short.data) ? short.data[0] : short) as Record<string, unknown> | undefined;
  const shortToken = typeof row?.access_token === "string" ? row.access_token : null;
  if (!shortToken) throw new Error("instagram_no_token");
  const permissions = typeof row?.permissions === "string" ? row.permissions.split(",") : Array.isArray(row?.permissions) ? row.permissions.map(String) : [];

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("access_token", shortToken);
  const long = await readJson(await fetchImpl(longUrl, { cache: "no-store" }));
  return { ...toToken(long, now), grantedScopes: permissions.map((scope) => scope.trim()).filter(Boolean) };
}

/** Works once the token is at least 24 hours old and not yet expired. */
export async function refreshLongLivedToken(accessToken: string, fetchImpl: Fetch = fetch, now = Date.now()): Promise<InstagramToken> {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);
  return toToken(await readJson(await fetchImpl(url, { cache: "no-store" })), now);
}

export async function fetchInstagramAccount(accessToken: string, fetchImpl: Fetch = fetch): Promise<InstagramAccount> {
  const url = new URL(`https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}/me`);
  url.searchParams.set("fields", "user_id,username,account_type");
  url.searchParams.set("access_token", accessToken);
  const data = await readJson(await fetchImpl(url, { cache: "no-store" }));
  const id = typeof data.user_id === "string" || typeof data.user_id === "number" ? String(data.user_id) : typeof data.id === "string" ? data.id : null;
  const username = typeof data.username === "string" ? data.username : null;
  if (!id || !username) throw new Error("instagram_no_account");
  return { id, username, accountType: typeof data.account_type === "string" ? data.account_type : null };
}

function toToken(data: Record<string, unknown>, now: number): InstagramToken {
  const accessToken = typeof data.access_token === "string" ? data.access_token : null;
  const expiresIn = typeof data.expires_in === "number" && data.expires_in > 0 ? data.expires_in : null;
  if (!accessToken || !expiresIn) throw new Error("instagram_no_token");
  return { accessToken, expiresAt: new Date(now + expiresIn * 1000) };
}
