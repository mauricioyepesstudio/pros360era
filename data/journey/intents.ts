import type { StageId } from "./types";

export type StageIntent = { id: string; label: string; description: string; stageId: StageId; leadIntent: string };

export const stageIntents = [
  { id: "just-arrived", label: "Acabo de llegar", description: "Quiero entender por dónde comenzar.", stageId: "LLEGA", leadIntent: "newcomer_orientation" },
  { id: "get-organized", label: "Necesito organizarme", description: "Quiero ordenar pendientes y prioridades.", stageId: "ESTABLECETE", leadIntent: "personal_organization" },
  { id: "start-company", label: "Quiero crear una empresa", description: "Quiero preparar correctamente mi negocio.", stageId: "EMPRENDE", leadIntent: "start_business" },
  { id: "existing-business", label: "Ya tengo un negocio", description: "Quiero identificar qué fundamento atender ahora.", stageId: "PROTEGETE", leadIntent: "existing_business" },
  { id: "protect-business", label: "Necesito protegerlo", description: "Quiero revisar organización, obligaciones y riesgos.", stageId: "PROTEGETE", leadIntent: "protect_business" },
  { id: "get-customers", label: "Quiero conseguir más clientes", description: "Quiero fortalecer mi presencia y seguimiento.", stageId: "CRECE", leadIntent: "grow_business" },
] as const satisfies readonly StageIntent[];
