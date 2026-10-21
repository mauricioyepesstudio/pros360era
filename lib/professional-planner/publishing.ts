import { isPrivateCreativeImage } from "./private-creative-url.ts";
/**
 * Automatic publishing of planner posts to Instagram and Facebook: the pure rules.
 *
 * A post goes out when it is "Listo para publicar", its network is Instagram
 * or Facebook, and its date and time (Florida time) have arrived. What happened to each
 * post is kept in a separate publish log (one more onboarding_responses row
 * per professional), never in the planner itself: the professional can save
 * their planner at any moment, and a save must never undo a publication or
 * make a post go out twice.
 *
 * Relative imports only so tests can load it under plain `node --test`.
 */
import type { PlannerPost, ProfessionalPlanner } from "./validation.ts";

export const plannerPublishLogVersion = "professional-planner-publish-v1";
/** EVOLUSA professionals are in Florida today; planner times are read in this zone. */
export const plannerTimeZone = "America/New_York";
export const plannerTimeZoneLabel = "hora de Florida";
/** A post whose time passed more than this long ago is not sent late (it says so instead). */
export const publishLateWindowMs = 48 * 60 * 60 * 1000;
/** A run that died mid-publication is not retried blindly: Instagram may already show it. */
export const staleClaimMs = 30 * 60 * 1000;
const defaultTime = "12:00";

export type PublishState = "PUBLISHING" | "PUBLISHED" | "FAILED";
export type PublishLogEntry = {
  state: PublishState;
  /** ISO instant the post was scheduled for when this entry was written. */
  scheduledFor: string;
  at: string;
  mediaId: string | null;
  permalink: string | null;
  error: string | null;
};
export type PublishLog = Record<string, PublishLogEntry>;

/** UTC instant of a wall-clock date and time in `timeZone`. */
export function zonedInstant(date: string, time: string, timeZone: string = plannerTimeZone): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let guess = wall;
  // Two passes settle the offset, including on daylight-saving change days.
  for (let i = 0; i < 2; i += 1) guess = wall - zoneOffsetMs(guess, timeZone);
  return new Date(guess);
}

function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - Math.floor(instant / 1000) * 1000;
}

export function scheduledFor(post: PlannerPost): Date | null {
  return post.date ? zonedInstant(post.date, post.time ?? defaultTime) : null;
}

export function publishLogId(userId: string, hash: (input: string) => string): string {
  const h = hash(`evolusa:${plannerPublishLogVersion}:${userId}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-8${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** Lenient: an entry that doesn't look right is dropped, never trusted. */
export function parsePublishLog(value: unknown): PublishLog {
  const entries = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>).entries : null;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
  const log: PublishLog = {};
  for (const [id, raw] of Object.entries(entries as Record<string, unknown>)) {
    if (!/^[a-z0-9-]{1,64}$/.test(id) || !raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    if (e.state !== "PUBLISHING" && e.state !== "PUBLISHED" && e.state !== "FAILED") continue;
    if (typeof e.scheduledFor !== "string" || typeof e.at !== "string") continue;
    const text = (v: unknown, max: number) => (typeof v === "string" && v.length <= max ? v : null);
    log[id] = { state: e.state, scheduledFor: e.scheduledFor, at: e.at, mediaId: text(e.mediaId, 64), permalink: text(e.permalink, 300), error: text(e.error, 300) };
  }
  return log;
}

export const autoPublishPlatforms = ["instagram", "facebook"] as const;
export type AutoPublishPlatform = (typeof autoPublishPlatforms)[number];

export function isAutoPublishable(post: PlannerPost): post is PlannerPost & { platform: AutoPublishPlatform } {
  return !isPrivateCreativeImage(post.imageUrl) && post.status === "READY" && (autoPublishPlatforms as readonly string[]).includes(post.platform) && post.date !== null;
}

function publicImageUrl(imageUrl: string, siteUrl: string): string {
  return imageUrl.startsWith("/") ? `${siteUrl}${imageUrl.replace(/\.png$/, ".jpg")}` : imageUrl;
}

/**
 * Posts to send now. A post already in the log is skipped, except a failed
 * one the professional has since moved to another date or time: moving it is
 * how they ask for a retry.
 */
export function duePosts(planner: ProfessionalPlanner, log: PublishLog, now: number): PlannerPost[] {
  return planner.posts.filter((post) => {
    if (!isAutoPublishable(post)) return false;
    const at = scheduledFor(post);
    if (!at || at.getTime() > now || now - at.getTime() > publishLateWindowMs) return false;
    const entry = log[post.id];
    return !entry || (entry.state === "FAILED" && entry.scheduledFor !== at.toISOString());
  });
}

export type InstagramMediaRequest =
  | { ok: true; kind: "FEED" | "STORY"; params: Record<string, string> }
  | { ok: false; error: string };

/**
 * What Instagram is asked to publish. Kit images are served as JPEG (the only
 * format Instagram takes) from the public site; 9:16 goes out as a Story.
 */
export function instagramMediaRequest(post: PlannerPost, siteUrl: string): InstagramMediaRequest {
  if(isPrivateCreativeImage(post.imageUrl)) return {ok:false,error:"Esta propuesta es privada. Descarga, revisa y adjunta la imagen aprobada antes de publicarla."};
  if (post.format === "text" || !post.imageUrl) return { ok: false, error: "Instagram necesita una imagen. Elige una y vuelve a programarla." };
  const imageUrl = publicImageUrl(post.imageUrl, siteUrl);
  if (post.format === "9x16") return { ok: true, kind: "STORY", params: { media_type: "STORIES", image_url: imageUrl } };
  const params: Record<string, string> = { image_url: imageUrl };
  if (post.caption.trim()) params.caption = post.caption;
  return { ok: true, kind: "FEED", params };
}

/** What the professional sees: the log wins over the saved status, so a save can't hide a publication. */
export type PostPublication = { state: PublishState | "MISSED"; permalink: string | null; error: string | null };

export function publicationView(planner: ProfessionalPlanner, log: PublishLog, now: number): Record<string, PostPublication> {
  const view: Record<string, PostPublication> = {};
  for (const post of planner.posts) {
    const entry = log[post.id];
    const at = scheduledFor(post);
    const rescheduled = entry?.state === "FAILED" && at !== null && entry.scheduledFor !== at.toISOString();
    if (entry && !rescheduled) {
      view[post.id] = { state: entry.state, permalink: entry.permalink, error: entry.error };
    } else if (isAutoPublishable(post) && at && now - at.getTime() > publishLateWindowMs) {
      view[post.id] = { state: "MISSED", permalink: null, error: "Su hora pasó sin publicarse. Cambia la fecha para programarla otra vez." };
    }
  }
  return view;
}

export type FacebookRequest =
  | { ok: true; request: { kind: "TEXT"; message: string } | { kind: "PHOTO"; imageUrl: string; caption: string } | { kind: "STORY"; imageUrl: string } }
  | { ok: false; error: string };

/** Facebook takes text-only posts too; 9:16 with an image goes out as a Page Story. */
export function facebookRequest(post: PlannerPost, siteUrl: string): FacebookRequest {
  if(isPrivateCreativeImage(post.imageUrl)) return {ok:false,error:"Esta propuesta es privada. Descarga, revisa y adjunta la imagen aprobada antes de publicarla."};
  if (post.format === "text" || !post.imageUrl) {
    return post.caption.trim() ? { ok: true, request: { kind: "TEXT", message: post.caption } } : { ok: false, error: "La publicación no tiene texto ni imagen." };
  }
  const imageUrl = publicImageUrl(post.imageUrl, siteUrl);
  if (post.format === "9x16") return { ok: true, request: { kind: "STORY", imageUrl } };
  return { ok: true, request: { kind: "PHOTO", imageUrl, caption: post.caption.trim() ? post.caption : "" } };
}
