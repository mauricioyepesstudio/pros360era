import type { StageId } from "@/data/journey/types";

export type TrustSource = "OFFICIAL" | "EVOLUSA_GUIDE" | "PROFESSIONAL";
export type RoadmapStatus = "COMPLETED" | "NOW" | "UPCOMING" | "LATER";
export type RoadmapCategory = "WORK" | "HOUSING" | "DOCUMENTS" | "FINANCES" | "TAX" | "BUSINESS" | "INSURANCE" | "EDUCATION" | "ENGLISH" | "TRANSPORT" | "CREDIT" | "FAMILY" | "MARKETING" | "GENERAL";

export type UserGoal = { id: string; label: string; category: RoadmapCategory };
export type LifeEvent = { id: string; label: string; category: RoadmapCategory; stageHint?: StageId };
export type Task = { id: string; title: string; completed: boolean; category: RoadmapCategory };
export type RoadmapItem = { id: string; title: string; description: string; stage: StageId; priority: 1 | 2 | 3 | 4; category: RoadmapCategory; status: RoadmapStatus; sourceType: TrustSource; requiresProfessional: boolean; actionType: "READ" | "PLAN" | "CONTACT_PROFESSIONAL" | "COMPLETE_TASK"; /** Set only when EVOLUSA can actually route this to a real professional today (i.e. the need's category has live matching supply). Absent means "seek independent professional help" — requiresProfessional must never imply a working connection when this is unset. */ connectHref?: string };
export type Recommendation = RoadmapItem & { reason: string };
export type UserProfile = { id?: string; name?: string; preferredLanguage: "es" | "en"; state?: string; currentStage: StageId; goals: UserGoal[]; selectedNeeds: RoadmapCategory[]; businessStatus: "NONE" | "WANTS_TO_START" | "OWNER"; employment: "EMPLOYED" | "SELF_EMPLOYED" | "NOT_WORKING" | "PREFER_NOT_TO_SAY"; progress: number; completedTaskIds: string[]; lifeEventIds: string[] };
export type RoadmapInput = Pick<UserProfile, "currentStage" | "goals" | "selectedNeeds" | "businessStatus" | "employment" | "completedTaskIds" | "lifeEventIds">;
export type RoadmapOutput = { completed: Recommendation[]; now: Recommendation[]; upcoming: Recommendation[]; later: Recommendation[] };
