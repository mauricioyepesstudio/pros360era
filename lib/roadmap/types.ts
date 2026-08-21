import type { StageId } from "../../data/journey/types.ts";

export type YesNo = "yes" | "no" | "unsure";
export type TimeInUs = "under_6_months" | "6_to_24_months" | "over_24_months" | "prefer_not_to_say";
export type PrimaryPriority = "settle" | "start_business" | "organize_business" | "protect_business" | "get_customers" | "scale";

export type RoadmapAnswers = Partial<{
  timeInUs: TimeInUs;
  hasBusiness: YesNo;
  businessRegistered: YesNo;
  hasEin: YesNo;
  hasBusinessBankAccount: YesNo;
  hasBookkeeping: YesNo;
  needsTaxPreparation: YesNo;
  hasBusinessInsurance: YesNo;
  hasWebsite: YesNo;
  hasGoogleBusiness: YesNo;
  getsCustomersConsistently: YesNo;
  primaryPriority: PrimaryPriority;
}>;

export type RoadmapPriority = "high" | "medium" | "low";
export type RoadmapCta = { label: string; href: string };
export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  stage: StageId;
  priority: RoadmapPriority;
  serviceId?: string;
  educationalDisclaimer?: string;
  cta?: RoadmapCta;
};

export type RoadmapResult = {
  completed: RoadmapItem[];
  now: RoadmapItem[];
  upcoming: RoadmapItem[];
  primaryStage: StageId;
  disclaimer: string;
  version: "1.0.0";
};

export type RoadmapQuestion = {
  id: keyof RoadmapAnswers;
  label: string;
  helpText?: string;
  options: readonly { value: string; label: string }[];
  showWhen?: (answers: RoadmapAnswers) => boolean;
};

export type RoadmapRule = {
  id: string;
  target: "completed" | "now" | "upcoming";
  when: (answers: RoadmapAnswers) => boolean;
  item: RoadmapItem;
};
