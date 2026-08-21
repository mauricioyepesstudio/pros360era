import type { StageId } from "./types";

export type StageIntent = { id: string; label: string; description: string; stageId: StageId; leadIntent: string };

export const stageIntents = [
  { id: "just-arrived", label: "Acabo de llegar", description: "Quiero organizar mis primeros pasos.", stageId: "LLEGA", leadIntent: "newcomer_orientation" },
  { id: "getting-established", label: "Me estoy estableciendo", description: "Estoy construyendo mi vida cotidiana.", stageId: "ESTABLECETE", leadIntent: "personal_organization" },
  { id: "want-to-start", label: "Quiero emprender", description: "Quiero convertir una idea o habilidad en negocio.", stageId: "EMPRENDE", leadIntent: "start_business" },
  { id: "want-to-protect", label: "Quiero protegerme", description: "Quiero organizar y proteger lo que ya construí.", stageId: "PROTEGETE", leadIntent: "protect_business" },
  { id: "want-to-grow", label: "Quiero crecer", description: "Quiero mejorar mis oportunidades y patrimonio.", stageId: "CRECE", leadIntent: "grow_business" },
  { id: "want-to-evolve", label: "Quiero evolucionar", description: "Estoy listo para metas mayores.", stageId: "EVOLUCIONA", leadIntent: "scale_business" },
] as const satisfies readonly StageIntent[];
