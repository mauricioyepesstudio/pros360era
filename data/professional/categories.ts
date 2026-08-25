import type { ProfessionalCategory } from "./types";

/**
 * MVP professional category catalog — one entry, deliberately. Chosen from
 * EVOLUSA's real, live, non-regulated service catalog (data/services/services.ts):
 * MARKETING already covers real enabled services (branding, website
 * presence, Google Business) with fulfillmentType "DIRECT" and
 * requiresVerification: false — the safest possible starting category,
 * needing no license/bar verification workflow to prove the loop.
 *
 * Adding a second category (especially a REGULATED one) means adding its
 * verification/compliance rules here AND widening professional_profiles'
 * `category` check constraint in a migration — not a config flip.
 */
export const professionalCategories = [
  {
    id: "BUSINESS_MARKETING",
    label: "Profesional de Negocios y Marketing",
    group: "SERVICE_BUSINESS",
    mapsToServiceCategory: "MARKETING",
  },
] as const satisfies readonly ProfessionalCategory[];

export function getProfessionalCategory(id: string) {
  return professionalCategories.find((category) => category.id === id);
}
