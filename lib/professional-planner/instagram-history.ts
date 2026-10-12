import { plannerMaxPosts, parseProfessionalPlanner, sortPosts, type PlannerPost } from "./validation.ts";
import type { PostPublication } from "./publishing.ts";

export type InstagramHistory = { posts: PlannerPost[]; publications: Record<string, PostPublication> };

function https(value: unknown, instagramOnly = false): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (instagramOnly && !["instagram.com", "www.instagram.com"].includes(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}

/** Converts real feed media to read-only published history in Florida time. */
export function instagramHistory(value: unknown): InstagramHistory {
  const rows = value && typeof value === "object" && "data" in value ? (value as { data: unknown }).data : [];
  const result: InstagramHistory = { posts: [], publications: {} };
  if (!Array.isArray(rows)) return result;
  for (const row of rows.slice(0, 100)) {
    if (!row || typeof row !== "object" || !/^\d{1,40}$/.test(String(row.id)) || typeof row.timestamp !== "string") continue;
    const stamp = new Date(row.timestamp);
    if (Number.isNaN(stamp.getTime())) continue;
    const id = `ig-${row.id}`;
    if (result.posts.some((post) => post.id === id)) continue;
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(stamp).map((part) => [part.type, part.value]));
    const caption = typeof row.caption === "string" ? row.caption.slice(0, 2200) : "";
    const permalink = https(row.permalink, true);
    const post: PlannerPost = {
      id, date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`,
      platform: "instagram", format: permalink?.includes("/reel/") ? "9x16" : "1x1",
      title: caption.trim().split("\n")[0].slice(0, 140) || "Publicación de Instagram",
      caption, imageUrl: https(row.media_type === "VIDEO" ? row.thumbnail_url : row.media_url),
      status: "PUBLISHED", note: "Publicación existente en tu Instagram. Importada al historial; no se vuelve a publicar.",
    };
    if (!parseProfessionalPlanner({ posts: [post] })) continue;
    result.posts.push(post);
    result.publications[id] = { state: "PUBLISHED", permalink, error: null };
  }
  return result;
}

/** Preserve every planned post; refresh imported images without duplicating media IDs. */
export function mergeInstagramHistory(current: PlannerPost[], imported: PlannerPost[]): PlannerPost[] {
  const next = [...current];
  for (const post of imported) {
    const index = next.findIndex((existing) => existing.id === post.id);
    if (index >= 0) next[index] = post;
    else if (next.length < plannerMaxPosts) next.push(post);
  }
  return sortPosts(next);
}
