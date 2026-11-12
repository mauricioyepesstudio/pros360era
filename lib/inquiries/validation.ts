import { z } from "zod";

/**
 * Contact details are accepted only after explicit destination-specific consent.
 * No SSN, immigration case documents, bank information or other sensitive data.
 */
export const profileInquiryInput = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/),
  idempotencyKey: z.uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().max(50).optional().default(""),
  service: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
}).strict();

export type ProfileInquiryInput = z.input<typeof profileInquiryInput>;

export const PROFILE_INQUIRY_CONSENT_VERSION = "EVOLUSA_DIRECT_INQUIRY_V1" as const;

export function pilotEnabled(): boolean {
  // Server-only switch: default OFF. Never expose on public pages unintentionally.
  return process.env.EVOLUSA_INQUIRY_PILOT_ENABLED === "true";
}
