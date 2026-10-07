import { z } from "zod";

export const leadSources = ["website", "whatsapp", "instagram", "facebook", "email", "referral", "other"] as const;
export const leadStatuses = ["new", "contacted", "qualified", "unqualified", "converted", "lost"] as const;
const optionalText = (max: number) => z.string().trim().max(max).optional();
const email = z.union([z.string().trim().email().max(254), z.literal("")]).optional();
export const leadInput = z.object({
  source: z.enum(leadSources), sourceUrl: z.union([z.url().max(2048).refine((value) => /^https?:\/\//.test(value)), z.literal("")]).optional(),
  name: optionalText(200), email, phone: optionalText(50), whatsapp: optionalText(50), notes: optionalText(2000),
}).strict().refine((value) => Boolean(value.name || value.email || value.phone || value.whatsapp), "Agrega un nombre o medio de contacto.");
export const contactInput = z.object({ name: z.string().trim().min(1).max(200), email, phone: optionalText(50), whatsapp: optionalText(50), companyName: optionalText(200), jobTitle: optionalText(200) }).strict();
export const listInput = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(), status: z.enum(leadStatuses).optional(), source: z.enum(leadSources).optional(),
  lifecycleStage: z.enum(["lead", "mql", "sql", "opportunity", "customer", "closed_lost"]).optional(),
}).strict();
export function nullable(value: string | undefined): string | null { return value || null; }
export function crmRoleAllowed(role: unknown): boolean { return role === "PROFESSIONAL" || role === "ADMIN"; }
