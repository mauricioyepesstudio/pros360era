export type ProfessionalPlanId = "pilot" | "starter" | "professional" | "business";

export type ProfessionalPlan = {
  id: ProfessionalPlanId;
  name: string;
  monthlyUsd: number;
  description: string;
  features: readonly string[];
};

export const PROFESSIONAL_PLANS: readonly ProfessionalPlan[] = [
  {
    id: "pilot",
    name: "Piloto",
    monthlyUsd: 0,
    description: "Acceso de evaluación durante 60 días, sujeto a invitación y aprobación del perfil.",
    features: ["Perfil profesional", "Solicitudes", "Seguimiento básico"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyUsd: 29,
    description: "Presencia profesional y captación inicial.",
    features: ["Perfil público", "Formulario de contacto", "Solicitudes", "Panel básico"],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyUsd: 79,
    description: "Gestión de oportunidades y automatizaciones básicas.",
    features: ["Todo Starter", "ARM/CRM", "Planner", "Seguimiento de oportunidades", "Automatizaciones básicas"],
  },
  {
    id: "business",
    name: "Business",
    monthlyUsd: 149,
    description: "Operación con integraciones y agentes avanzados.",
    features: ["Todo Professional", "Agentes por perfil", "Flujos avanzados", "Reportes", "Integraciones disponibles"],
  },
] as const;

// Keep billing disabled until the pilot is validated and checkout, webhook
// verification, entitlements and cancellation handling have been tested.
export const PROFESSIONAL_BILLING_ENABLED = false;
export const PILOT_DURATION_DAYS = 60;
export const PROFESSIONAL_PRICING_STATUS = "propuesta" as const;
