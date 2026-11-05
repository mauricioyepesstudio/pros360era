/**
 * Options shown on the public "apply to join" form (app/aplicar-profesional).
 * Deliberately broader than data/professional/categories.ts's live catalog
 * — this is a lead-capture list, not the Opportunity Engine's routable
 * category set. `live: true` categories can already receive real matched
 * opportunities today (their migration is actually applied to the live
 * Supabase project); `live: false` ones are shown so real interest isn't
 * lost while the category is built, as requests subject to review, without promising availability.
 *
 * Owner-authorized intake includes regulated specialties. Receiving an
 * application does not approve a profile, verify credentials or enable
 * matching. Those gates remain in the professional catalog and database.
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
    id: "REAL_ESTATE",
    label: "Bienes raíces / Real estate",
    live: false,
    credentialHint: "Indica tu licencia, jurisdicción y especialidad inmobiliaria para su revisión.",
  },
  {
    id: "TAX",
    label: "Preparación de impuestos / Taxes",
    live: false,
    credentialHint: "Indica tu especialidad y los registros o credenciales aplicables a los servicios que ofreces.",
  },
  {
    id: "FINANCE",
    label: "Finanzas y educación financiera",
    live: false,
    credentialHint: "Describe el alcance de tu servicio y las licencias o credenciales aplicables. La solicitud no autoriza asesoría financiera.",
  },
  {
    id: "PARALEGAL",
    label: "Paralegal y apoyo documental",
    live: false,
    credentialHint: "Indica tu formación, experiencia y alcance del apoyo documental. Esta solicitud no autoriza el ejercicio de la abogacía.",
  },
  {
    id: "NOTARY",
    label: "Servicios notariales",
    live: false,
    credentialHint: "Indica el estado y número de tu comisión notarial vigente para su revisión.",
  },
  {
    id: "HEALTH_INSURANCE",
    label: "Seguros de salud / médicos",
    live: false,
    credentialHint: "Indica tu licencia, jurisdicción y líneas de seguros autorizadas para su revisión.",
  },
  {
    id: "AUTO_INSURANCE",
    label: "Seguros de auto y accidentes de tránsito",
    live: false,
    credentialHint: "Indica tu licencia, jurisdicción y líneas de seguros autorizadas. La solicitud no confirma cobertura de accidentes.",
  },
  {
    id: "OTHER",
    label: "Otro / No estoy seguro",
    live: false,
    credentialHint: "Describe tu especialidad y el alcance de tus servicios para que podamos revisar tu solicitud.",
  },
] as const;
