import { isTokenInvalid } from "./meta-errors.ts";
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

/** Meta's own explanation, shortened, so the professional can see why a post didn't go out. */
async function readPublishJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const error = data.error as { message?: unknown; error_user_msg?: unknown; code?: unknown } | undefined;
  if (!response.ok || error) {
    const detail = typeof error?.error_user_msg === "string" ? error.error_user_msg : typeof error?.message === "string" ? error.message : `error ${response.status}`;
    throw new InstagramPublishError(detail.slice(0, 200), false, isTokenInvalid(error?.code));
  }
  return data;
}

export class InstagramPublishError extends Error {
  readonly publicationUncertain: boolean;
  readonly tokenInvalid: boolean;
  constructor(message: string, publicationUncertain = false, tokenInvalid = false) {
    super(message);
    this.publicationUncertain = publicationUncertain;
    this.tokenInvalid = tokenInvalid;
  }
}

export type InstagramPublication = { mediaId: string; permalink: string | null };

/**
 * Content publishing with Instagram Login: create a media container, wait
 * until Instagram has fetched the image, then publish it. `params` comes from
 * instagramMediaRequest (image_url, caption, media_type=STORIES).
 */
export async function publishInstagramMedia(
  igUserId: string,
  accessToken: string,
  params: Record<string, string>,
  fetchImpl: Fetch = fetch,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  options: { deadline?: number; now?: () => number } = {},
): Promise<InstagramPublication> {
  const now = options.now ?? Date.now;
  const deadline = options.deadline ?? now() + 240_000;
  const request = async (url: string | URL, init: RequestInit = {}) => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new InstagramPublishError("Se agotó el tiempo de procesamiento. Revisa la publicación antes de reprogramarla.");
    return readPublishJson(await fetchImpl(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(Math.min(10_000, remaining)) }));
  };
  const base = `https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}`;
  const container = await request(`${base}/${igUserId}/media`, { method: "POST", body: new URLSearchParams({ ...params, access_token: accessToken }) });
  const creationId = typeof container.id === "string" ? container.id : null;
  if (!creationId) throw new InstagramPublishError("Instagram no aceptó la imagen.");

  // A Reel takes longer: Instagram has to download and transcode the video.
  const isReel = params.media_type === "REELS";
  const attempts = isReel ? 4 : 6;
  const pollInterval = isReel ? 60_000 : 2_000;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const statusUrl = new URL(`${base}/${creationId}`);
    statusUrl.searchParams.set("fields", "status_code");
    statusUrl.searchParams.set("access_token", accessToken);
    const status = await request(statusUrl);
    if (status.status_code === "FINISHED") break;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") throw new InstagramPublishError("Instagram no pudo procesar la imagen. Revisa que sea JPEG o MP4 y público.");
    if (attempt === attempts - 1) throw new InstagramPublishError("Instagram tardó demasiado en procesar el archivo.");
    if (deadline - now() <= pollInterval) throw new InstagramPublishError("Se agotó el tiempo de procesamiento. Revisa la publicación antes de reprogramarla.");
    await wait(pollInterval);
  }

  // Refuse before sending when the run has no budget. A timeout after sending
  // is ambiguous: Meta may have published it, so never invite a blind retry.
  if (deadline <= now()) throw new InstagramPublishError("Se agotó el tiempo antes de publicar.");
  let published: Record<string, unknown>;
  try {
    published = await request(`${base}/${igUserId}/media_publish`, { method: "POST", body: new URLSearchParams({ creation_id: creationId, access_token: accessToken }) });
  } catch (error) {
    if (error instanceof InstagramPublishError) throw error;
    throw new InstagramPublishError("No sabemos si llegó a publicarse. Revísalo en Instagram antes de volver a programarlo.", true);
  }
  const mediaId = typeof published.id === "string" ? published.id : null;
  if (!mediaId) throw new InstagramPublishError("Instagram no confirmó la publicación. Revísala en Instagram antes de reprogramarla.", true);

  let permalink: string | null = null;
  try {
    const linkUrl = new URL(`${base}/${mediaId}`);
    linkUrl.searchParams.set("fields", "permalink");
    linkUrl.searchParams.set("access_token", accessToken);
    const link = await request(linkUrl);
    permalink = typeof link.permalink === "string" && link.permalink.startsWith("https://") ? link.permalink : null;
  } catch {
    // Already published; the link is only a convenience.
  }
  return { mediaId, permalink };
}
