import type { LifeEvent, RoadmapCategory, UserGoal, UserProfile } from "./types";

export const needOptions: readonly { id: RoadmapCategory; label: string }[] = [
  { id: "WORK", label: "Trabajo" }, { id: "HOUSING", label: "Vivienda" }, { id: "DOCUMENTS", label: "Documentos" }, { id: "FINANCES", label: "Finanzas" }, { id: "TAX", label: "Impuestos" }, { id: "BUSINESS", label: "Negocio" }, { id: "INSURANCE", label: "Seguros" }, { id: "EDUCATION", label: "Educación" }, { id: "ENGLISH", label: "Inglés" }, { id: "TRANSPORT", label: "Transporte" }, { id: "CREDIT", label: "Crédito" }, { id: "FAMILY", label: "Familia" }, { id: "MARKETING", label: "Marketing" }, { id: "GENERAL", label: "Otro" },
];

export const lifeEvents: readonly LifeEvent[] = [
  { id: "new-job", label: "Conseguí trabajo", category: "WORK", stageHint: "ESTABLECETE" }, { id: "moved", label: "Me mudé", category: "HOUSING", stageHint: "ESTABLECETE" }, { id: "start-business", label: "Quiero crear una empresa", category: "BUSINESS", stageHint: "EMPRENDE" }, { id: "organize-taxes", label: "Quiero organizar mis impuestos", category: "TAX", stageHint: "PROTEGETE" }, { id: "improve-credit", label: "Quiero mejorar mi crédito", category: "CREDIT", stageHint: "ESTABLECETE" }, { id: "buy-home", label: "Quiero comprar casa", category: "HOUSING", stageHint: "CRECE" }, { id: "study", label: "Quiero estudiar", category: "EDUCATION", stageHint: "ESTABLECETE" }, { id: "improve-english", label: "Quiero mejorar mi inglés", category: "ENGLISH", stageHint: "ESTABLECETE" }, { id: "grow-business", label: "Quiero hacer crecer mi negocio", category: "MARKETING", stageHint: "CRECE" }, { id: "other-change", label: "Otro cambio", category: "GENERAL" },
];

export const demoGoals: UserGoal[] = [{ id: "organize-foundation", label: "Organizar mis próximos pasos", category: "GENERAL" }];
export const previewProfile: UserProfile = { preferredLanguage: "es", currentStage: "ESTABLECETE", goals: demoGoals, selectedNeeds: ["WORK", "FINANCES", "DOCUMENTS"], businessStatus: "NONE", employment: "EMPLOYED", progress: 28, completedTaskIds: ["define-priority"], lifeEventIds: ["new-job"] };
