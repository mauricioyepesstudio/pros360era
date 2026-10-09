/**
 * Publication planner for professionals: a private calendar of posts they
 * plan to publish themselves. Nothing here connects to a social network,
 * schedules a real publication or posts on anyone's behalf.
 *
 * Stored as one versioned row in onboarding_responses (same pattern as the
 * professional schedule), so it needs no new table or migration.
 *
 * Relative imports only so tests can load it under plain `node --test`.
 */
import { creativeSrc, type PreparedKit } from "../../data/professional/prepared-kits.ts";

export const professionalPlannerVersion = "professional-planner-v1";
export const plannerMaxPosts = 200;
export const plannerCaptionLimit = 2200;

export const plannerPlatforms = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  other: "Otra",
} as const;

export const plannerFormats = {
  "1x1": "Cuadrado 1:1",
  "4x5": "Vertical 4:5",
  "9x16": "Story / Reel 9:16",
  text: "Solo texto",
} as const;

export const plannerStatuses = {
  IDEA: "Idea",
  DRAFT: "Borrador",
  READY: "Listo para publicar",
  PUBLISHED: "Publicado",
} as const;

export type PlannerPlatform = keyof typeof plannerPlatforms;
export type PlannerFormat = keyof typeof plannerFormats;
export type PlannerStatus = keyof typeof plannerStatuses;

export type PlannerPost = {
  id: string;
  /** YYYY-MM-DD, or null while the post has no date yet. */
  date: string | null;
  /** HH:MM, optional. */
  time: string | null;
  platform: PlannerPlatform;
  format: PlannerFormat;
  title: string;
  caption: string;
  /** Site-relative path to a kit creative ("/professionals/…") or an https URL. */
  imageUrl: string | null;
  status: PlannerStatus;
  note: string | null;
};

export type ProfessionalPlanner = { posts: PlannerPost[] };

const postKeys = ["id", "date", "time", "platform", "format", "title", "caption", "imageUrl", "status", "note"];

export function emptyPlanner(): ProfessionalPlanner {
  return { posts: [] };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function safePlannerImageUrl(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) return undefined;
  if (/^\/professionals\/kits\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpe?g|webp)$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > max) return undefined;
  return value;
}

function parsePost(value: unknown): PlannerPost | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((key) => !postKeys.includes(key))) return null;
  if (typeof v.id !== "string" || !/^[a-z0-9-]{1,64}$/.test(v.id)) return null;
  if (v.date !== null && (typeof v.date !== "string" || !isValidDate(v.date))) return null;
  if (v.time !== null && (typeof v.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))) return null;
  if (typeof v.platform !== "string" || !Object.hasOwn(plannerPlatforms, v.platform)) return null;
  if (typeof v.format !== "string" || !Object.hasOwn(plannerFormats, v.format)) return null;
  if (typeof v.status !== "string" || !Object.hasOwn(plannerStatuses, v.status)) return null;
  if (typeof v.title !== "string" || v.title.trim().length === 0 || v.title.length > 140) return null;
  if (typeof v.caption !== "string" || v.caption.length > plannerCaptionLimit) return null;
  const imageUrl = safePlannerImageUrl(v.imageUrl);
  const note = optionalText(v.note, 500);
  if (imageUrl === undefined || note === undefined) return null;
  if (v.status === "PUBLISHED" && v.date === null) return null;
  return {
    id: v.id,
    date: v.date as string | null,
    time: v.date === null ? null : (v.time as string | null),
    platform: v.platform as PlannerPlatform,
    format: v.format as PlannerFormat,
    title: v.title.trim(),
    caption: v.caption,
    imageUrl,
    status: v.status as PlannerStatus,
    note,
  };
}

/** Strict: any invalid post rejects the whole planner, so a bad payload can never be half-saved. */
export function parseProfessionalPlanner(value: unknown): ProfessionalPlanner | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((key) => key !== "posts") || !Array.isArray(v.posts) || v.posts.length > plannerMaxPosts) return null;
  const posts: PlannerPost[] = [];
  for (const item of v.posts) {
    const post = parsePost(item);
    if (!post || posts.some((existing) => existing.id === post.id)) return null;
    posts.push(post);
  }
  return { posts: sortPosts(posts) };
}

export function sortPosts(posts: PlannerPost[]): PlannerPost[] {
  return [...posts].sort((a, b) => {
    if (a.date === b.date) return (a.time ?? "").localeCompare(b.time ?? "") || a.title.localeCompare(b.title);
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date.localeCompare(b.date);
  });
}

export function professionalPlannerAllowed(role: unknown, hasProfile: boolean): boolean {
  return hasProfile && (role === "PROFESSIONAL" || role === "ADMIN");
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * First-visit proposal for a professional with a prepared kit: each concept
 * becomes a post on a Tuesday/Thursday cadence starting the next Tuesday
 * after `today`. Pieces that need the professional's confirmation stay
 * undated. Everything starts as an idea; nothing is published.
 */
export function plannerFromKit(kit: PreparedKit, today: string): ProfessionalPlanner {
  const start = new Date(`${today}T00:00:00Z`);
  const untilTuesday = (2 - start.getUTCDay() + 7) % 7 || 7;
  const firstTuesday = addDays(today, untilTuesday);
  let slot = 0;
  const posts = kit.creatives.concepts.map((concept): PlannerPost => {
    const needsConfirmation = concept.status === "NEEDS_CONFIRMATION";
    const date = needsConfirmation ? null : addDays(firstTuesday, Math.floor(slot / 2) * 7 + (slot % 2) * 2);
    if (!needsConfirmation) slot += 1;
    return {
      id: `kit-${concept.id}`,
      date,
      time: date ? "12:00" : null,
      platform: "instagram",
      format: "4x5",
      title: concept.title,
      caption: "",
      imageUrl: creativeSrc(kit, concept.id, "4x5"),
      status: "IDEA",
      note: needsConfirmation ? (concept.note ?? "Confirma los datos antes de programarla.") : "Fecha propuesta. Cámbiala si quieres.",
    };
  });
  return { posts: sortPosts(posts) };
}
