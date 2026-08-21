export const fulfillmentTypes = ["DIRECT", "PARTNER", "REFERRAL", "EDUCATIONAL", "REQUIRES_VERIFICATION"] as const;
export type FulfillmentType = (typeof fulfillmentTypes)[number];
export type ClaimStatus = "ALLOWED" | "REQUIRES_VERIFICATION" | "PROHIBITED";

export const serviceCategories = ["BUSINESS_FORMATION", "TAX", "NOTARY", "INSURANCE", "LEGAL", "IMMIGRATION", "MARKETING", "BOOKKEEPING", "BUSINESS_OPERATIONS", "EDUCATION"] as const;
export type ServiceCategory = (typeof serviceCategories)[number];

export type ClaimDefinition = { id: string; category: ServiceCategory | "BRAND"; text: string; status: ClaimStatus; reason: string; safeAlternative?: string };
export type Disclaimer = { id: string; short: string; full: string; appliesTo: readonly ServiceCategory[] };
export type ServiceCompliance = { category: ServiceCategory; defaultFulfillmentType: FulfillmentType; requiresVerification: boolean; enabledByDefault: boolean; disclaimerIds: readonly string[] };

export const claims = [
  { id: "guided-next-step", category: "BRAND", text: "Te ayudamos a identificar tu próximo paso.", status: "ALLOWED", reason: "Describe orientación y coordinación sin prometer un resultado profesional." },
  { id: "spanish-first", category: "BRAND", text: "Orientación en español.", status: "ALLOWED", reason: "Permitido mientras la experiencia se preste efectivamente en español." },
  { id: "licensed-team", category: "BRAND", text: "Nuestro equipo de profesionales licenciados se ocupa de todo.", status: "REQUIRES_VERIFICATION", reason: "Requiere verificar cada profesional, licencia, jurisdicción y alcance.", safeAlternative: "Te conectamos con el recurso o profesional apropiado cuando corresponde." },
  { id: "guaranteed-outcome", category: "BRAND", text: "Resultados garantizados.", status: "PROHIBITED", reason: "Es una promesa absoluta, no verificable y potencialmente engañosa." },
  { id: "legal-advice", category: "LEGAL", text: "Ofrecemos asesoría legal para tu caso.", status: "REQUIRES_VERIFICATION", reason: "Solo puede usarse si el servicio y el profesional autorizado están verificados.", safeAlternative: "Podemos ayudarte a encontrar un profesional legal independiente cuando corresponda." },
  { id: "immigration-advice", category: "IMMIGRATION", text: "Determinamos tu elegibilidad migratoria.", status: "PROHIBITED", reason: "No debe publicarse como servicio de EVOLUSA sin autoridad profesional confirmada." },
  { id: "tax-planning", category: "TAX", text: "Diseñamos la mejor estrategia fiscal para ti.", status: "REQUIRES_VERIFICATION", reason: "Implica asesoría profesional individualizada y un resultado superlativo.", safeAlternative: "Coordinamos servicios fiscales con el proveedor apropiado, sujeto a verificación." },
] as const satisfies readonly ClaimDefinition[];

export const disclaimers = [
  { id: "general-education", short: "Información educativa general.", full: "La información presentada es educativa y no sustituye asesoría profesional individualizada.", appliesTo: ["EDUCATION"] },
  { id: "regulated-services", short: "La disponibilidad depende del proveedor y la jurisdicción.", full: "Los servicios legales, migratorios, fiscales y de seguros, cuando estén disponibles, son prestados por profesionales o proveedores apropiados según su licencia y jurisdicción.", appliesTo: ["LEGAL", "IMMIGRATION", "TAX", "INSURANCE"] },
  { id: "roadmap-guidance", short: "Tu Roadmap es una guía inicial.", full: "El Roadmap ofrece orientación operacional y educativa; no constituye asesoría legal, migratoria, fiscal, financiera ni de seguros.", appliesTo: ["EDUCATION", "BUSINESS_OPERATIONS"] },
] as const satisfies readonly Disclaimer[];

export const serviceCompliance = [
  { category: "BUSINESS_FORMATION", defaultFulfillmentType: "REQUIRES_VERIFICATION", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "TAX", defaultFulfillmentType: "REQUIRES_VERIFICATION", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "NOTARY", defaultFulfillmentType: "REQUIRES_VERIFICATION", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "INSURANCE", defaultFulfillmentType: "REFERRAL", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "LEGAL", defaultFulfillmentType: "REFERRAL", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "IMMIGRATION", defaultFulfillmentType: "REFERRAL", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "MARKETING", defaultFulfillmentType: "DIRECT", requiresVerification: false, enabledByDefault: true, disclaimerIds: [] },
  { category: "BOOKKEEPING", defaultFulfillmentType: "REQUIRES_VERIFICATION", requiresVerification: true, enabledByDefault: false, disclaimerIds: ["regulated-services"] },
  { category: "BUSINESS_OPERATIONS", defaultFulfillmentType: "DIRECT", requiresVerification: false, enabledByDefault: true, disclaimerIds: [] },
  { category: "EDUCATION", defaultFulfillmentType: "EDUCATIONAL", requiresVerification: false, enabledByDefault: true, disclaimerIds: ["general-education"] },
] as const satisfies readonly ServiceCompliance[];

export function isServicePublishable(category: ServiceCategory, verified = false) {
  const policy = serviceCompliance.find((item) => item.category === category);
  return Boolean(policy && (policy.enabledByDefault || (policy.requiresVerification && verified)));
}
