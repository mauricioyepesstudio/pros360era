import { readSocialTokenKey } from "./crypto.ts";
import { PUBLIC_APP_URL } from "./instagram.ts";

/**
 * Facebook Pages with Facebook Login, so a professional's Page can receive the
 * posts they mark ready in the planner. It uses the Meta app's own App ID (not
 * the Instagram app ID used by lib/social/instagram.ts) and the Facebook Login
 * product, whose valid redirect URI must be the callback below.
 *
 * A Page token obtained from a long-lived user token does not expire, so there
 * is nothing to refresh; it stops working only if the person removes access.
 */
export const FACEBOOK_SCOPES = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"] as const;
export const FACEBOOK_PUBLISH_SCOPE = "pages_manage_posts";
export const FACEBOOK_GRAPH_VERSION = "v23.0";
export const FACEBOOK_CALLBACK_PATH = "/api/social/facebook/callback";
export const FACEBOOK_STATE_COOKIE = "evolusa_fb_state";
export const FACEBOOK_COOKIE_PATH = "/api/social/facebook";

export type FacebookConfig = { appId: string; appSecret: string; tokenKey: Buffer; redirectUri: string };

/** Null until every server secret is set in Vercel. Nothing is faked without them. */
export function getFacebookConfig(env: NodeJS.ProcessEnv = process.env): FacebookConfig | null {
  const appId = env.FACEBOOK_APP_ID?.trim();
  const appSecret = env.FACEBOOK_APP_SECRET?.trim();
  const tokenKey = readSocialTokenKey(env.SOCIAL_TOKEN_KEY);
  if (!appId || !/^\d+$/.test(appId) || !appSecret || !tokenKey) return null;
  return { appId, appSecret, tokenKey, redirectUri: `${PUBLIC_APP_URL}${FACEBOOK_CALLBACK_PATH}` };
}

export function facebookAuthorizeUrl(config: FacebookConfig, state: string): string {
  const url = new URL(`https://www.facebook.com/${FACEBOOK_GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FACEBOOK_SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

export function cleanFacebookCode(code: string | null): string | null {
  if (!code) return null;
  const cleaned = code.replace(/#_=_$/, "").trim();
  return cleaned.length > 0 && cleaned.length <= 2048 ? cleaned : null;
}

export type FacebookPage = { id: string; name: string; accessToken: string };

type Fetch = typeof fetch;
const graph = `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}`;

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.error) throw new Error(`facebook_${response.status}`);
  return data;
}

/**
 * Code → user token → long-lived user token → the first Page the person can
 * post to, with its (non-expiring) Page token and the permissions granted.
 */
export async function connectFacebookPage(config: FacebookConfig, code: string, fetchImpl: Fetch = fetch): Promise<{ page: FacebookPage; grantedScopes: string[] }> {
  const shortUrl = new URL(`${graph}/oauth/access_token`);
  shortUrl.searchParams.set("client_id", config.appId);
  shortUrl.searchParams.set("client_secret", config.appSecret);
  shortUrl.searchParams.set("redirect_uri", config.redirectUri);
  shortUrl.searchParams.set("code", code);
  const short = await readJson(await fetchImpl(shortUrl, { cache: "no-store" }));
  if (typeof short.access_token !== "string") throw new Error("facebook_no_token");

  const longUrl = new URL(`${graph}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", config.appId);
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("fb_exchange_token", short.access_token);
  const long = await readJson(await fetchImpl(longUrl, { cache: "no-store" }));
  const userToken = typeof long.access_token === "string" ? long.access_token : null;
  if (!userToken) throw new Error("facebook_no_token");

  const permissionsUrl = new URL(`${graph}/me/permissions`);
  permissionsUrl.searchParams.set("access_token", userToken);
  const permissions = await readJson(await fetchImpl(permissionsUrl, { cache: "no-store" }));
  const grantedScopes = (Array.isArray(permissions.data) ? permissions.data : [])
    .filter((row: { status?: unknown }) => row?.status === "granted")
    .map((row: { permission?: unknown }) => String(row.permission));

  const pagesUrl = new URL(`${graph}/me/accounts`);
  pagesUrl.searchParams.set("fields", "id,name,access_token,tasks");
  pagesUrl.searchParams.set("access_token", userToken);
  const pages = await readJson(await fetchImpl(pagesUrl, { cache: "no-store" }));
  const page = (Array.isArray(pages.data) ? pages.data : []).find(
    (row: { id?: unknown; name?: unknown; access_token?: unknown; tasks?: unknown }) =>
      typeof row?.id === "string" && typeof row.name === "string" && typeof row.access_token === "string" && (!Array.isArray(row.tasks) || row.tasks.includes("CREATE_CONTENT")),
  ) as { id: string; name: string; access_token: string } | undefined;
  if (!page) throw new FacebookNoPageError("facebook_no_page");
  return { page: { id: page.id, name: page.name, accessToken: page.access_token }, grantedScopes };
}

export class FacebookNoPageError extends Error {}
export class FacebookPublishError extends Error {}

async function readPublishJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const error = data.error as { message?: unknown; error_user_msg?: unknown } | undefined;
  if (!response.ok || error) {
    const detail = typeof error?.error_user_msg === "string" ? error.error_user_msg : typeof error?.message === "string" ? error.message : `error ${response.status}`;
    throw new FacebookPublishError(detail.slice(0, 200));
  }
  return data;
}

export type FacebookPostRequest =
  | { kind: "TEXT"; message: string }
  | { kind: "PHOTO"; imageUrl: string; caption: string }
  | { kind: "STORY"; imageUrl: string };

/** Publishes on the Page: a text post, a photo post, or a photo Story. */
export async function publishFacebookPost(pageId: string, pageToken: string, request: FacebookPostRequest, fetchImpl: Fetch = fetch): Promise<{ mediaId: string; permalink: string | null }> {
  const post = (path: string, params: Record<string, string>) =>
    fetchImpl(`${graph}/${pageId}/${path}`, { method: "POST", body: new URLSearchParams({ ...params, access_token: pageToken }), cache: "no-store" }).then(readPublishJson);

  let postId: string | null = null;
  if (request.kind === "TEXT") {
    const data = await post("feed", { message: request.message });
    postId = typeof data.id === "string" ? data.id : null;
  } else if (request.kind === "PHOTO") {
    const data = await post("photos", request.caption ? { url: request.imageUrl, caption: request.caption } : { url: request.imageUrl });
    postId = typeof data.post_id === "string" ? data.post_id : typeof data.id === "string" ? data.id : null;
  } else {
    const photo = await post("photos", { url: request.imageUrl, published: "false" });
    if (typeof photo.id !== "string") throw new FacebookPublishError("Facebook no aceptó la imagen.");
    const story = await post("photo_stories", { photo_id: photo.id });
    postId = typeof story.post_id === "string" ? story.post_id : photo.id;
  }
  if (!postId) throw new FacebookPublishError("Facebook no confirmó la publicación.");

  let permalink: string | null = null;
  if (request.kind !== "STORY") {
    try {
      const linkUrl = new URL(`${graph}/${postId}`);
      linkUrl.searchParams.set("fields", "permalink_url");
      linkUrl.searchParams.set("access_token", pageToken);
      const link = await readPublishJson(await fetchImpl(linkUrl, { cache: "no-store" }));
      permalink = typeof link.permalink_url === "string" && link.permalink_url.startsWith("https://") ? link.permalink_url : null;
    } catch {
      // Already published; the link is only a convenience.
    }
  }
  return { mediaId: postId, permalink };
}
