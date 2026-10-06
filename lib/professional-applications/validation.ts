import { applicationCategoryOptions } from "../../data/professional-applications/categories.ts";

/**
 * Pure validation for the public "apply as a professional" form. Kept free
 * of Supabase/Next imports so it runs under `node --test` and so the server
 * never trusts what the browser sends: the form's maxLength and <select>
 * are UX only, this is the real gate.
 */

export type ProfessionalApplicationInput = {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  categoryOfInterest: string;
  credentialInfo?: string;
  bio?: string;
  notes?: string;
  /** Honeypot: hidden from people, bots fill it. Never stored. */
  website?: string;
};

export type ProfessionalApplicationRow = {
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  category_of_interest: string;
  credential_info: string | null;
  bio: string | null;
  notes: string | null;
};

export type ValidationResult =
  | { ok: true; row: ProfessionalApplicationRow }
  | { ok: false; reason: "MISSING_REQUIRED_FIELD" | "INVALID_EMAIL" | "INVALID_CATEGORY" | "TOO_LONG" | "SPAM" };

const limits = { fullName: 200, email: 200, phone: 40, city: 100, credentialInfo: 200, bio: 600, notes: 600 } as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseProfessionalApplicationInput(input: ProfessionalApplicationInput): ValidationResult {
  if (clean(input.website)) return { ok: false, reason: "SPAM" };

  const fullName = clean(input.fullName);
  const email = clean(input.email).toLowerCase();
  const category = clean(input.categoryOfInterest);
  if (!fullName || !email || !category) return { ok: false, reason: "MISSING_REQUIRED_FIELD" };
  if (!emailPattern.test(email)) return { ok: false, reason: "INVALID_EMAIL" };
  if (!applicationCategoryOptions.some((option) => option.id === category)) return { ok: false, reason: "INVALID_CATEGORY" };

  const fields = {
    fullName,
    email,
    phone: clean(input.phone),
    city: clean(input.city),
    credentialInfo: clean(input.credentialInfo),
    bio: clean(input.bio),
    notes: clean(input.notes),
  };
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    if (fields[key].length > limits[key]) return { ok: false, reason: "TOO_LONG" };
  }

  return {
    ok: true,
    row: {
      full_name: fields.fullName,
      email: fields.email,
      phone: fields.phone || null,
      city: fields.city || null,
      category_of_interest: category,
      credential_info: fields.credentialInfo || null,
      bio: fields.bio || null,
      notes: fields.notes || null,
    },
  };
}

/** Postgres unique_violation: the same email already has a pending application in this category. */
export function isDuplicateApplicationError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}
