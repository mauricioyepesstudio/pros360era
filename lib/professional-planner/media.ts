/**
 * Planner media kinds. No imports so tests can load it under plain `node --test`.
 * Videos live in the site's public/videos folder or at an https URL ending in .mp4.
 */
export const plannerVideoPath = /^\/videos\/[a-z0-9-]+\.mp4$/;

export function isPlannerVideo(url: string | null): boolean {
  if (!url) return false;
  return plannerVideoPath.test(url) || (url.startsWith("https://") && /\.mp4($|\?)/i.test(url));
}
