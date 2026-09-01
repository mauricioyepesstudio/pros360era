import type { ProfessionalCategory } from "./types";

/**
 * Professional category catalog. MARKETING was the original MVP entry
 * (branding, website presence, Google Business). BUSINESS_OPERATIONS was
 * added 2026-08-31 as the second category — same compliance tier as
 * MARKETING (no license/credential verification workflow needed), covering
 * the already-live BUSINESS_OPERATIONS services (data/services/services.ts:
 * crm-foundation, operations-roadmap).
 *
 * NOTARY was added 2026-09-01 (migration 0013) as the FIRST `group:
 * "REGULATED"` entry — Florida notaries public are commissioned under
 * Florida Statutes Chapter 117; an unverified/unlicensed person performing a
 * notarial act has real legal consequences (a defective notarization can be
 * void), and this exact failure mode ("notario fraud" — someone holding
 * themselves out as authorized to notarize/represent without a valid
 * commission) is one this community is specifically targeted by. Unlike
 * BUSINESS_OPERATIONS, adding NOTARY required a materially larger review:
 * data/compliance/regulatory-policy.ts's new NOTARY/FL row
 * (`verificationRequirement: "NOTARY_COMMISSION_VERIFIED"`, not null), a new
 * verification type (data/professional/verification-types.ts), and — the
 * actual enforcement point — a hard verification gate added inside the SQL
 * matching queries in create_qualified_opportunity and
 * consent_and_route_opportunity (supabase/migrations/0013), not just a
 * scoring bonus. See 0013's migration header for the full mechanism and
 * reasoning; TAX is expected to follow the identical pattern in its own
 * later migration, not this one.
 *
 * Adding any further REGULATED category is a much bigger step than widening
 * a SERVICE_BUSINESS one: verification/compliance rules here, widening
 * professional_profiles' `category` check constraint in a migration, AND —
 * critically — widening the regulatory allowlist gate AND the
 * category-to-required-verification-type mapping inside
 * create_qualified_opportunity/consent_and_route_opportunity. Not a config
 * flip either way, but a materially larger compliance review than
 * SERVICE_BUSINESS categories require.
 */
export const professionalCategories = [
  {
    id: "BUSINESS_MARKETING",
    label: "Profesional de Negocios y Marketing",
    group: "SERVICE_BUSINESS",
    mapsToServiceCategory: "MARKETING",
  },
  {
    id: "BUSINESS_OPERATIONS",
    label: "Profesional de Operaciones de Negocio",
    group: "SERVICE_BUSINESS",
    mapsToServiceCategory: "BUSINESS_OPERATIONS",
  },
  {
    id: "NOTARY",
    label: "Notario Público",
    group: "REGULATED",
    mapsToServiceCategory: "NOTARY",
  },
] as const satisfies readonly ProfessionalCategory[];

export function getProfessionalCategory(id: string) {
  return professionalCategories.find((category) => category.id === id);
}
