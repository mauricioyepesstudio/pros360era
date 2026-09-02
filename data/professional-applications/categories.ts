/**
 * Options shown on the public "apply to join" form (app/aplicar-profesional).
 * Deliberately broader than data/professional/categories.ts's live catalog
 * — this is a lead-capture list, not the Opportunity Engine's routable
 * category set. `live: true` categories can already receive real matched
 * opportunities today (once their migration is applied); `live: false`
 * ones are shown so real interest isn't lost while the category is built,
 * with copy that's honest about "próximamente."
 */
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
    id: "NOTARY",
    label: "Notaría Pública",
    live: true,
    credentialHint: "Tu número de comisión de notaria de Florida (lo verificamos contra el registro público del estado).",
  },
  {
    id: "TAX",
    label: "Impuestos y Contabilidad",
    live: false,
    credentialHint: "Tu credencial de CPA, EA, o número PTIN — próximamente en la plataforma, regístrate y te contactamos primero.",
  },
  {
    id: "LEGAL",
    label: "Legal e Inmigración",
    live: false,
    credentialHint: "Tu número de colegiación (Florida Bar) o acreditación DOJ-EOIR — próximamente en la plataforma, regístrate y te contactamos primero.",
  },
  {
    id: "OTHER",
    label: "Otro / No estoy seguro",
    live: false,
    credentialHint: "Cuéntanos qué servicio ofreces y lo ubicamos en la categoría correcta.",
  },
] as const;
