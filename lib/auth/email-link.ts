import { safeReturnPath } from "./return-path.ts";

/**
 * Where Supabase sends people back after a confirmation, recovery or Google
 * link. Always an internal path on the site that started the request, so the
 * project's Site URL (which may still point at localhost) is never used.
 * Supabase only honors it when the origin is in the Auth redirect allowlist.
 */
export const resetPasswordPath = "/reset-password";

export function authCallbackUrl(origin: string, next: string | null | undefined): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(safeReturnPath(next))}`;
}

export function recoveryCallbackUrl(origin: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(resetPasswordPath)}`;
}

const emailOtpTypes = ["signup", "invite", "magiclink", "recovery", "email_change", "email"] as const;
export type EmailLinkType = (typeof emailOtpTypes)[number];

export function parseEmailLinkType(value: string | null | undefined): EmailLinkType | null {
  return emailOtpTypes.find((type) => type === value) ?? null;
}

/** A recovery link always ends on the new-password form; anything else keeps its safe destination. */
export function emailLinkDestination(type: EmailLinkType, next: string | null | undefined): string {
  return type === "recovery" ? resetPasswordPath : safeReturnPath(next);
}

/** Where to send someone whose link failed or expired: recovery restarts the request, others go to login. */
export function failedLinkDestination(next: string | null | undefined): string {
  return safeReturnPath(next) === resetPasswordPath ? "/forgot-password?error=expired" : "/login?error=link";
}
