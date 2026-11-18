import { readSocialTokenKey } from "./crypto.ts";
import { PUBLIC_APP_URL } from "./instagram.ts";

export const THREADS_SCOPES = ["threads_basic", "threads_content_publish"] as const;
export const THREADS_CALLBACK_PATH = "/api/social/threads/callback";
export const THREADS_STATE_COOKIE = "evolusa_threads_state";
export const THREADS_COOKIE_PATH = "/api/social/threads";
const GRAPH = "https://graph.threads.com";
export type ThreadsConfig = { appId: string; appSecret: string; tokenKey: Buffer; redirectUri: string };
export function getThreadsConfig(env: NodeJS.ProcessEnv = process.env): ThreadsConfig | null {
  const appId = env.THREADS_APP_ID?.trim();
  const appSecret = env.THREADS_APP_SECRET?.trim();
  const tokenKey = readSocialTokenKey(env.SOCIAL_TOKEN_KEY);
  return appId && /^\d{5,32}$/.test(appId) && appSecret && tokenKey
    ? { appId, appSecret, tokenKey, redirectUri: `${PUBLIC_APP_URL}${THREADS_CALLBACK_PATH}` } : null;
}
export function threadsAuthorizeUrl(config: ThreadsConfig, state: string): string {
  const url = new URL("https://www.threads.com/oauth/authorize");
  for (const [key, value] of Object.entries({ client_id: config.appId, redirect_uri: config.redirectUri, response_type: "code", scope: THREADS_SCOPES.join(","), state })) url.searchParams.set(key, value);
  return url.toString();
}
export function cleanThreadsCode(code: string | null): string | null {
  const value = code?.trim();
  return value && /^[A-Za-z0-9_.~-]{10,2048}$/.test(value) ? value : null;
}
type Fetch = typeof fetch;
async function json(response: Response): Promise<Record<string, unknown>> {
  const data = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || !data || data.error) throw new Error(`threads_${response.status}`);
  return data;
}
export type ThreadsToken = { accessToken: string; expiresAt: Date; grantedScopes: string[] };
export async function exchangeThreadsCode(config: ThreadsConfig, code: string, fetchImpl: Fetch = fetch, now = Date.now()): Promise<ThreadsToken> {
  const short = await json(await fetchImpl(`${GRAPH}/oauth/access_token`, { method: "POST", body: new URLSearchParams({ client_id: config.appId, client_secret: config.appSecret, grant_type: "authorization_code", redirect_uri: config.redirectUri, code }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) }));
  if (typeof short.access_token !== "string") throw new Error("threads_no_token");
  const url = new URL(`${GRAPH}/access_token`);
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", config.appSecret);
  url.searchParams.set("access_token", short.access_token);
  const long = await json(await fetchImpl(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) }));
  if (typeof long.access_token !== "string" || typeof long.expires_in !== "number" || long.expires_in <= 0) throw new Error("threads_no_token");
  // Requested scopes are not proof of grant; Meta enforces publishing permission at publication.
  const scope = typeof short.scope === "string" ? short.scope : "";
  return { accessToken: long.access_token, expiresAt: new Date(now + long.expires_in * 1000), grantedScopes: scope.split(/[\s,]+/).filter(Boolean) };
}
/** Inspect the token itself: requested OAuth scopes do not prove that the person granted them. */
export async function fetchThreadsGrantedScopes(accessToken: string, fetchImpl: Fetch = fetch): Promise<string[]> {
  const url = new URL(`${GRAPH}/debug_token`);
  url.searchParams.set("input_token", accessToken);
  const result = await json(await fetchImpl(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) }));
  const data = result.data as Record<string, unknown> | undefined;
  if (!data || data.is_valid !== true || !Array.isArray(data.scopes)) throw new Error("threads_invalid_grant");
  const scopes = data.scopes.filter((scope): scope is string => typeof scope === "string");
  if (!THREADS_SCOPES.every(scope => scopes.includes(scope))) throw new Error("threads_missing_permission");
  return scopes;
}
export async function fetchThreadsAccount(accessToken: string, fetchImpl: Fetch = fetch) {
  const url = new URL(`${GRAPH}/me`);
  url.searchParams.set("fields", "id,username");
  const data = await json(await fetchImpl(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) }));
  if (typeof data.id !== "string" || !/^\d+$/.test(data.id) || typeof data.username !== "string" || !data.username) throw new Error("threads_no_account");
  return { id: data.id, username: data.username, accountType: "THREADS" };
}
export class ThreadsPublishError extends Error {
  readonly publicationUncertain: boolean;
  constructor(message: string, publicationUncertain = false) { super(message); this.publicationUncertain = publicationUncertain; }
}
export async function publishThreadsMedia(userId: string, accessToken: string, params: Record<string, string>, fetchImpl: Fetch = fetch, wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), options: { deadline?: number; now?: () => number } = {}): Promise<{ mediaId: string; permalink: string | null }> {
  if (!/^\d+$/.test(userId) || !["TEXT", "IMAGE", "VIDEO"].includes(params.media_type)) throw new ThreadsPublishError("Formato de Threads no compatible.");
  if (Array.from(params.text ?? "").length > 500) throw new ThreadsPublishError("Threads admite hasta 500 caracteres en el texto.");
  if (params.media_type === "TEXT" && !params.text?.trim()) throw new ThreadsPublishError("Añade texto para publicar en Threads.");
  if (params.media_type !== "TEXT") {
    const mediaUrl = params.media_type === "IMAGE" ? params.image_url : params.video_url;
    try {
      const url = new URL(mediaUrl ?? "");
      if (url.protocol !== "https:" || url.username || url.password) throw new Error("invalid");
    } catch { throw new ThreadsPublishError("Threads necesita un archivo con URL pública HTTPS."); }
  }
  const now = options.now ?? Date.now;
  const deadline = options.deadline ?? now() + 240_000;
  const request = async (path: string, init: RequestInit = {}) => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new ThreadsPublishError("Se agotó el tiempo de procesamiento de Threads.");
    return json(await fetchImpl(`${GRAPH}/${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(Math.min(10_000, remaining)) }));
  };
  // Never pass auto_publish_text: creation must remain separate from publication.
  const body = new URLSearchParams({ media_type: params.media_type });
  for (const key of ["text", "image_url", "video_url"]) if (params[key]) body.set(key, params[key]);
  const container = await request(`${userId}/threads`, { method: "POST", body });
  if (typeof container.id !== "string" || !/^\d+$/.test(container.id)) throw new ThreadsPublishError("Threads no aceptó el contenido.");
  for (let attempt = 0; attempt < 4; attempt++) {
    const status = await request(`${container.id}?fields=status`);
    if (status.status === "FINISHED") break;
    if (["ERROR", "EXPIRED"].includes(String(status.status))) throw new ThreadsPublishError("Threads no pudo procesar el archivo. Revisa el formato y el acceso público.");
    if (attempt === 3 || deadline - now() <= 60_000) throw new ThreadsPublishError("Threads tardó demasiado en procesar el contenido.");
    await wait(60_000);
  }
  if (now() >= deadline) throw new ThreadsPublishError("Se agotó el tiempo antes de publicar en Threads.");
  let published: Record<string, unknown>;
  try { published = await request(`${userId}/threads_publish`, { method: "POST", body: new URLSearchParams({ creation_id: container.id }) }); }
  catch { throw new ThreadsPublishError("No sabemos si llegó a publicarse. Revisa Threads antes de volver a programar.", true); }
  if (typeof published.id !== "string" || !/^\d+$/.test(published.id)) throw new ThreadsPublishError("Threads no confirmó la publicación. Revísala antes de reprogramar.", true);
  let permalink: string | null = null;
  try {
    const link = await request(`${published.id}?fields=permalink`);
    if (typeof link.permalink === "string") {
      const url = new URL(link.permalink);
      if (url.protocol === "https:" && ["www.threads.com", "threads.com", "www.threads.net", "threads.net"].includes(url.hostname) && !url.username && !url.password) permalink = url.toString();
    }
  } catch { /* A confirmed publication stays successful when only the permalink fails. */ }
  return { mediaId: published.id, permalink };
}
