/** Tokens last 60 days and can be refreshed once they are a day old. Refresh anything expiring within 15 days. */
export const REFRESH_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;
const MIN_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

export function needsRefresh(row: { token_expires_at: string | null; token_refreshed_at: string | null }, now: number): "refresh" | "expired" | "skip" {
  if (!row.token_expires_at) return "skip";
  const expiresAt = Date.parse(row.token_expires_at);
  if (Number.isNaN(expiresAt)) return "skip";
  if (expiresAt <= now) return "expired";
  if (expiresAt - now > REFRESH_WINDOW_MS) return "skip";
  const refreshedAt = row.token_refreshed_at ? Date.parse(row.token_refreshed_at) : 0;
  return now - refreshedAt >= MIN_TOKEN_AGE_MS ? "refresh" : "skip";
}
