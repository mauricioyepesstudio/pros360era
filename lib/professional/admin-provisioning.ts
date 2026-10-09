import { consultationModes } from "../../data/professional/types.ts";
import type { ConsultationMode } from "../../data/professional/types.ts";
import { sanitizeUrl, sanitizeSocialLinks } from "./profile-links.ts";
import { getPreparedKit, preparedKitProfileColumns } from "../../data/professional/prepared-kits.ts";
import type { PreparedKit } from "../../data/professional/prepared-kits.ts";

/**
 * Pure builders for app/api/admin/create-professional. The route used to
 * insert columns that don't exist (business_name, niche, location,
 * instagram, website on professional_profiles; email, full_name, bio on
 * profiles) into a `user_services` table that no migration ever created —
 * every insert failed and the route still answered 201. These builders map
 * the admin form onto the real columns (migrations 0001, 0005, 0015) so the
 * route can treat any write error as a real failure.
 *
 * Relative imports only (no "@/") so tests/admin-provisioning.test.ts can
 * import this under plain `node --test` — same reasoning as
 * lib/professional/profile-links.ts.
 */

/**
 * Only SERVICE_BUSINESS categories can be provisioned from this route.
 * NOTARY is REGULATED (migration 0013): it needs a NOTARY_COMMISSION_VERIFIED
 * row before it can be matched, which this route doesn't create.
 */
export const adminProvisionableCategories = ["BUSINESS_MARKETING", "BUSINESS_OPERATIONS"] as const;
export type AdminProvisionableCategory = (typeof adminProvisionableCategories)[number];

export type CreateProfessionalInput = {
  email: string;
  password: string;
  fullName: string;
  profession: string | null;
  location: string | null;
  instagram: string | null;
  website: string | null;
  category: AdminProvisionableCategory;
  consultationMode: ConsultationMode;
  /** Optional prepared kit (data/professional/prepared-kits.ts) that pre-fills the profile and the welcome material. */
  preparedKit: PreparedKit | null;
};

function optionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseCreateProfessionalInput(
  body: unknown,
): { ok: true; input: CreateProfessionalInput } | { ok: false; error: string } {
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const kitId = optionalText(raw.preparedKit);
  const preparedKit = kitId ? getPreparedKit(kitId) : null;
  if (kitId && !preparedKit) {
    return { ok: false, error: `Kit preparado desconocido: ${kitId}` };
  }

  const email = optionalText(raw.email);
  const password = typeof raw.password === "string" ? raw.password : "";
  const fullName = optionalText(raw.fullName) ?? preparedKit?.profile.displayName ?? null;
  if (!email || !password || !fullName) {
    return { ok: false, error: "Faltan campos obligatorios: email, password y fullName" };
  }

  const category = raw.category ?? preparedKit?.category ?? "BUSINESS_MARKETING";
  if (!adminProvisionableCategories.includes(category as AdminProvisionableCategory)) {
    return { ok: false, error: `Categoría no permitida: ${String(category)}` };
  }

  const consultationMode = raw.consultationMode ?? preparedKit?.profile.consultationMode ?? "BOTH";
  if (!consultationModes.includes(consultationMode as ConsultationMode)) {
    return { ok: false, error: `Modalidad no válida: ${String(consultationMode)}` };
  }

  return {
    ok: true,
    input: {
      email,
      password,
      fullName,
      profession: optionalText(raw.profession),
      location: optionalText(raw.location),
      instagram: optionalText(raw.instagram),
      website: optionalText(raw.website),
      category: category as AdminProvisionableCategory,
      consultationMode: consultationMode as ConsultationMode,
      preparedKit,
    },
  };
}

/**
 * Satisfies professional_profiles' slug check (^[a-z0-9]+(-[a-z0-9]+)*$).
 * The short user-id suffix keeps it unique without a lookup; the
 * professional can't change the slug themselves, an operator can.
 */
export function buildProfessionalSlug(fullName: string, userId: string): string {
  const base = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const suffix = userId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 6);
  return base ? `${base}-${suffix}` : `profesional-${suffix}`;
}

/** Accepts a full URL or a bare handle ("@onemigration", "onemigration"). */
export function instagramUrl(value: string | null): string | null {
  if (!value) return null;
  const handle = value.replace(/^@/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(handle)) return `https://www.instagram.com/${handle}/`;
  return sanitizeUrl(value);
}

/** The trigger from 0003 already created the profiles row; this only fills it in. */
export function buildProfileUpsert(input: CreateProfessionalInput, userId: string) {
  return { id: userId, name: input.fullName, role: "PROFESSIONAL" as const };
}

/**
 * app_metadata (not user_metadata): only the service role can write it, so a
 * user can never attach someone else's kit to their own account.
 */
export function buildAppMetadata(input: CreateProfessionalInput) {
  return input.preparedKit ? { prepared_kit: input.preparedKit.id } : {};
}

/**
 * is_approved stays at its default (false): an operator approves the profile separately.
 * A prepared kit fills the profile; explicit form fields (headline, city,
 * website, instagram) still win over the kit when the admin sends them.
 */
export type ProfessionalProfileInsert = ReturnType<typeof buildBaseProfessionalProfileInsert> &
  Partial<Pick<ReturnType<typeof preparedKitProfileColumns>, "bio" | "state" | "languages">>;

export function buildProfessionalProfileInsert(input: CreateProfessionalInput, userId: string): ProfessionalProfileInsert {
  const base = buildBaseProfessionalProfileInsert(input, userId);
  if (!input.preparedKit) return base;
  const kit = preparedKitProfileColumns(input.preparedKit);
  return {
    ...base,
    ...kit,
    display_name: input.fullName,
    consultation_mode: input.consultationMode,
    headline: input.profession ?? kit.headline,
    city: input.location ?? kit.city,
    website_url: base.website_url ?? sanitizeUrl(kit.website_url),
    social_links: sanitizeSocialLinks({ ...kit.social_links, ...stripEmpty(base.social_links) }),
  };
}

function stripEmpty<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;
}

function buildBaseProfessionalProfileInsert(input: CreateProfessionalInput, userId: string) {
  return {
    user_id: userId,
    display_name: input.fullName,
    slug: buildProfessionalSlug(input.fullName, userId),
    category: input.category,
    consultation_mode: input.consultationMode,
    headline: input.profession,
    city: input.location,
    website_url: sanitizeUrl(input.website),
    social_links: sanitizeSocialLinks({ instagram: instagramUrl(input.instagram) ?? undefined }),
  };
}
