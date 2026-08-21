import type { RoadmapItem, RoadmapRule } from "./types.ts";

const guidance = "Orientación educativa; no constituye asesoría legal, migratoria, fiscal, financiera ni de seguros.";

export const roadmapItems = {
  clarifyGoals: { id: "clarify-goals", title: "Definir tu objetivo principal", description: "Identifica qué resultado quieres lograr antes de elegir servicios.", stage: "LLEGA", priority: "high", educationalDisclaimer: guidance, cta: { label: "Explorar recursos", href: "/recursos" } },
  organizeNextSteps: { id: "organize-next-steps", title: "Organizar tus próximos pasos", description: "Convierte prioridades dispersas en una secuencia corta y manejable.", stage: "ESTABLECETE", priority: "high", serviceId: "orientation-session", educationalDisclaimer: guidance, cta: { label: "Solicitar orientación", href: "/contacto?interes=orientacion" } },
  businessReadiness: { id: "business-readiness", title: "Revisar la preparación de tu negocio", description: "Aclara la oferta, el cliente y las decisiones que requieren apoyo profesional.", stage: "EMPRENDE", priority: "high", educationalDisclaimer: guidance, cta: { label: "Ver guía inicial", href: "/recursos/business-readiness-guide" } },
  registration: { id: "business-registration", title: "Revisar el registro apropiado del negocio", description: "Confirma opciones, alcance y requisitos con el proveedor apropiado antes de actuar.", stage: "EMPRENDE", priority: "high", serviceId: "business-formation-support", educationalDisclaimer: guidance, cta: { label: "Consultar disponibilidad", href: "/contacto?interes=formacion-negocio" } },
  ein: { id: "ein", title: "Revisar si corresponde obtener un EIN", description: "Consulta fuentes oficiales o un profesional apropiado para tu situación.", stage: "EMPRENDE", priority: "medium", educationalDisclaimer: guidance },
  bankAccount: { id: "business-bank-account", title: "Separar las finanzas del negocio", description: "Explora una cuenta comercial y un flujo claro para ingresos y gastos.", stage: "PROTEGETE", priority: "medium", educationalDisclaimer: guidance },
  bookkeeping: { id: "bookkeeping", title: "Organizar el bookkeeping", description: "Establece un sistema consistente para registrar ingresos, gastos y documentos.", stage: "PROTEGETE", priority: "high", serviceId: "bookkeeping-coordination", educationalDisclaimer: guidance, cta: { label: "Consultar apoyo", href: "/contacto?interes=bookkeeping" } },
  taxes: { id: "tax-preparation", title: "Coordinar la preparación de impuestos", description: "Conecta con un proveedor fiscal apropiado y confirma alcance y fechas aplicables.", stage: "PROTEGETE", priority: "high", serviceId: "tax-preparation-referral", educationalDisclaimer: guidance },
  insurance: { id: "insurance-review", title: "Revisar necesidades de seguro", description: "Consulta opciones y cobertura con un proveedor autorizado.", stage: "PROTEGETE", priority: "medium", serviceId: "insurance-referral", educationalDisclaimer: guidance },
  website: { id: "website", title: "Crear una presencia web clara", description: "Explica tu oferta, genera confianza y habilita una vía de contacto.", stage: "CRECE", priority: "high", serviceId: "website-presence", cta: { label: "Planificar mi web", href: "/contacto?interes=web" } },
  googleBusiness: { id: "google-business", title: "Organizar tu presencia local en Google", description: "Configura información consistente y útil, sujeta a las políticas de Google.", stage: "CRECE", priority: "medium", serviceId: "google-business-support" },
  customerSystem: { id: "customer-system", title: "Crear un sistema para conseguir y seguir clientes", description: "Define canales, captura de oportunidades y seguimiento comercial.", stage: "CRECE", priority: "high", serviceId: "crm-foundation" },
  operations: { id: "operations", title: "Documentar y mejorar tus operaciones", description: "Identifica procesos repetibles, responsables y oportunidades de automatización.", stage: "EVOLUCIONA", priority: "medium", serviceId: "operations-roadmap" },
} as const satisfies Record<string, RoadmapItem>;

export const roadmapRules: readonly RoadmapRule[] = [
  { id: "goal-complete", target: "completed", when: (a) => Boolean(a.primaryPriority), item: roadmapItems.clarifyGoals },
  { id: "needs-orientation", target: "now", when: (a) => !a.hasBusiness || a.hasBusiness !== "yes" || a.primaryPriority === "settle", item: roadmapItems.organizeNextSteps },
  { id: "start-business", target: "now", when: (a) => a.primaryPriority === "start_business" || a.hasBusiness === "no", item: roadmapItems.businessReadiness },
  { id: "registration-complete", target: "completed", when: (a) => a.businessRegistered === "yes", item: roadmapItems.registration },
  { id: "registration-needed", target: "now", when: (a) => a.hasBusiness === "yes" && a.businessRegistered === "no", item: roadmapItems.registration },
  { id: "registration-upcoming", target: "upcoming", when: (a) => a.hasBusiness !== "yes" && a.primaryPriority === "start_business", item: roadmapItems.registration },
  { id: "ein-complete", target: "completed", when: (a) => a.hasEin === "yes", item: roadmapItems.ein },
  { id: "ein-needed", target: "upcoming", when: (a) => a.hasBusiness === "yes" && a.hasEin === "no", item: roadmapItems.ein },
  { id: "bank-complete", target: "completed", when: (a) => a.hasBusinessBankAccount === "yes", item: roadmapItems.bankAccount },
  { id: "bank-needed", target: "upcoming", when: (a) => a.hasBusiness === "yes" && a.hasBusinessBankAccount === "no", item: roadmapItems.bankAccount },
  { id: "books-complete", target: "completed", when: (a) => a.hasBookkeeping === "yes", item: roadmapItems.bookkeeping },
  { id: "books-needed", target: "now", when: (a) => a.hasBusiness === "yes" && (a.hasBookkeeping === "no" || a.primaryPriority === "organize_business"), item: roadmapItems.bookkeeping },
  { id: "tax-needed", target: "now", when: (a) => a.needsTaxPreparation === "yes", item: roadmapItems.taxes },
  { id: "insurance-complete", target: "completed", when: (a) => a.hasBusinessInsurance === "yes", item: roadmapItems.insurance },
  { id: "insurance-needed", target: "upcoming", when: (a) => a.hasBusiness === "yes" && (a.hasBusinessInsurance === "no" || a.primaryPriority === "protect_business"), item: roadmapItems.insurance },
  { id: "web-complete", target: "completed", when: (a) => a.hasWebsite === "yes", item: roadmapItems.website },
  { id: "web-needed", target: "now", when: (a) => a.hasBusiness === "yes" && (a.hasWebsite === "no" || a.primaryPriority === "get_customers"), item: roadmapItems.website },
  { id: "google-complete", target: "completed", when: (a) => a.hasGoogleBusiness === "yes", item: roadmapItems.googleBusiness },
  { id: "google-needed", target: "upcoming", when: (a) => a.hasBusiness === "yes" && a.hasGoogleBusiness === "no", item: roadmapItems.googleBusiness },
  { id: "customers-needed", target: "now", when: (a) => a.hasBusiness === "yes" && (a.getsCustomersConsistently === "no" || a.primaryPriority === "get_customers"), item: roadmapItems.customerSystem },
  { id: "scale", target: "now", when: (a) => a.hasBusiness === "yes" && a.primaryPriority === "scale", item: roadmapItems.operations },
];
