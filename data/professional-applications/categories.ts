/**
 * Options shown on the public "apply to join" form (app/aplicar-profesional).
 * Deliberately broader than data/professional/categories.ts's live catalog
 * — this is a lead-capture list, not the Opportunity Engine's routable
 * category set. `live: true` categories can already receive real matched
 * opportunities today (their migration is actually applied to the live
 * Supabase project); `live: false` ones are shown so real interest isn't
 * lost while the category is built, with copy that's honest about
 * "próximamente."
 *
 * Only non-regulated categories are offered (CLAUDE.md rule 2 and the
 * owner's decision of 2026-09-30): no notary, tax or legal/immigration
 * options until the owner explicitly enables a regulated category.
 */

/**
 * Whether the public form is shown. The professional_applications table
 * exists in the live project (verified 2026-10-06), and its column-level
 * INSERT grant for anon/authenticated is restored by
 * supabase/migrations/20261006_evolusa_professional_applications_insert_grant.sql.
 * If a submission still fails, the form itself offers WhatsApp so the lead
 * is not lost.
 */
export const professionalApplicationsAcceptingSubmissions = true;

export type ApplicationCategoryOption = {
  id: string;
  label: string;
  live: boolean;
  credentialHint: string;
};

export const applicationCategoryOptions: readonly ApplicationCategoryOption[] = [
  {
    id: "BUSINESS_MARKETING",
    label: "Marketing y Presencia Digital",
    live: true,
    credentialHint: "No requiere licencia — cuéntanos tu experiencia y portafolio.",
  },
  {
    id: "BUSINESS_OPERATIONS",
    label: "Operaciones de Negocio",
    live: true,
    credentialHint: "No requiere licencia — cuéntanos tu experiencia.",
  },
  {
    id: "OTHER",
    label: "Otro / No estoy seguro",
    live: false,
    credentialHint: "Cuéntanos qué servicio de negocio ofreces y lo ubicamos en la categoría correcta.",
  },
] as const;
