export const stageIds = ["LLEGA", "ESTABLECETE", "EMPRENDE", "PROTEGETE", "CRECE", "EVOLUCIONA"] as const;
export type StageId = (typeof stageIds)[number];
export type JourneyCta = { label: string; href: string };
export type RoadmapQuestionId = "timeInUs" | "hasBusiness" | "businessRegistered" | "hasEin" | "hasBusinessBankAccount" | "hasBookkeeping" | "needsTaxPreparation" | "hasBusinessInsurance" | "hasWebsite" | "hasGoogleBusiness" | "getsCustomersConsistently" | "primaryPriority";
export type JourneyStage = {
  id: StageId; slug: string; order: number; shortLabel: string; title: string; description: string;
  icon: "Compass" | "FolderCheck" | "Rocket" | "ShieldCheck" | "TrendingUp" | "Sparkles";
  colorToken: string; primaryGoal: string; serviceIds: readonly string[]; resourceIds: readonly string[];
  recommendedNextStage: StageId | null; leadIntent: string; roadmapQuestions: readonly RoadmapQuestionId[]; cta: JourneyCta;
};
