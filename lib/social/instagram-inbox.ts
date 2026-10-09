import { INSTAGRAM_GRAPH_VERSION } from "./instagram.ts";

/**
 * Reads recent comments and direct messages from a connected Instagram
 * professional account so they can land in the professional's CRM.
 *
 * Meta only sends real-time webhooks to published (reviewed) apps, so while
 * the EVOLUSA app is in development mode this polls instead: once a day from
 * the cron and on demand from "Traer ahora" in /crm/conversations.
 */

export type InboxKind = "comment" | "message";

export type InboxItem = {
  kind: InboxKind;
  externalId: string;
  authorId: string | null;
  authorUsername: string;
  body: string;
  permalink: string | null;
  occurredAt: string;
};

type Fetch = typeof fetch;
const GRAPH = `https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}`;

export const INBOX_MEDIA_LIMIT = 15;
export const INBOX_COMMENTS_PER_MEDIA = 50;
export const INBOX_CONVERSATION_LIMIT = 25;
export const INBOX_MESSAGES_PER_CONVERSATION = 10;
const BODY_MAX = 2000;

async function graphGet(path: string, params: Record<string, string>, accessToken: string, fetchImpl: Fetch) {
  const url = new URL(`${GRAPH}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", accessToken);
  const response = await fetchImpl(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.error) throw new Error(`instagram_inbox_${response.status}`);
  return data;
}

function list(value: unknown): Record<string, unknown>[] {
  const data = (value as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object") : [];
}

/**
 * Trimmed and cut by code point, never through an emoji. NUL bytes and lone
 * surrogates are dropped: Postgres rejects them, and one bad comment would
 * otherwise block every later import for that account.
 */
export function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const chars = Array.from(value.replace(/\u0000/g, "").trim()).filter((char) => !/^[\uD800-\uDFFF]$/.test(char));
  const cleaned = chars.slice(0, max).join("").trim();
  return cleaned || null;
}

function idOf(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && /^[A-Za-z0-9_:.=+\/-]{1,256}$/.test(value) ? value : null;
}

/** Instagram usernames: letters, digits, dots and underscores, up to 30. */
export function cleanUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/^@/, "").toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(name) ? name : null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function httpsUrl(value: unknown): string | null {
  return typeof value === "string" && /^https:\/\/(www\.)?instagram\.com\//.test(value) && value.length <= 2048 ? value : null;
}

/** Comments on the account's most recent posts. Comments the account itself wrote are skipped. */
export async function fetchRecentComments(accessToken: string, ownUsername: string, fetchImpl: Fetch = fetch): Promise<InboxItem[]> {
  const own = cleanUsername(ownUsername);
  const media = list(await graphGet("/me/media", { fields: "id,permalink,comments_count", limit: String(INBOX_MEDIA_LIMIT) }, accessToken, fetchImpl));
  const items: InboxItem[] = [];
  for (const post of media) {
    // Goes into the request path, so only Instagram's numeric media ids.
    const mediaId = typeof post.id === "string" && /^\d{1,64}$/.test(post.id) ? post.id : null;
    if (!mediaId || !(typeof post.comments_count === "number" && post.comments_count > 0)) continue;
    const permalink = httpsUrl(post.permalink);
    const comments = list(await graphGet(`/${mediaId}/comments`, { fields: "id,text,timestamp,username,from", limit: String(INBOX_COMMENTS_PER_MEDIA) }, accessToken, fetchImpl));
    for (const comment of comments) {
      const from = (comment.from ?? {}) as Record<string, unknown>;
      const username = cleanUsername(from.username ?? comment.username);
      const externalId = idOf(comment.id);
      const body = text(comment.text, BODY_MAX);
      const occurredAt = isoDate(comment.timestamp);
      if (!username || !externalId || !body || !occurredAt || username === own) continue;
      items.push({ kind: "comment", externalId, authorId: idOf(from.id), authorUsername: username, body, permalink, occurredAt });
    }
  }
  return items;
}

/** Incoming direct messages from recent conversations. Messages the account sent are skipped. */
export async function fetchRecentMessages(accessToken: string, ownAccountId: string, ownUsername: string, fetchImpl: Fetch = fetch): Promise<InboxItem[]> {
  const own = cleanUsername(ownUsername);
  const conversations = list(
    await graphGet(
      "/me/conversations",
      { platform: "instagram", fields: `id,messages.limit(${INBOX_MESSAGES_PER_CONVERSATION}){id,created_time,from,message}`, limit: String(INBOX_CONVERSATION_LIMIT) },
      accessToken,
      fetchImpl,
    ),
  );
  const items: InboxItem[] = [];
  for (const conversation of conversations) {
    for (const message of list(conversation.messages)) {
      const from = (message.from ?? {}) as Record<string, unknown>;
      const username = cleanUsername(from.username);
      const authorId = idOf(from.id);
      const externalId = idOf(message.id);
      const body = text(message.message, BODY_MAX);
      const occurredAt = isoDate(message.created_time);
      if (!username || !externalId || !body || !occurredAt) continue;
      if (username === own || authorId === ownAccountId) continue;
      items.push({ kind: "message", externalId, authorId, authorUsername: username, body, permalink: null, occurredAt });
    }
  }
  return items;
}

export function instagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`;
}
