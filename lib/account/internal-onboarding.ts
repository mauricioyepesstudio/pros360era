import { professionalScheduleVersion } from "../professional-schedule/validation.ts";
import { professionalPlannerVersion } from "../professional-planner/validation.ts";
import { initialCallVersion } from "../initial-call/validation.ts";
import { professionalDraftVersion } from "../professional-drafts/validation.ts";
export const internalOnboardingVersions = [professionalDraftVersion, initialCallVersion, professionalScheduleVersion, professionalPlannerVersion] as const;
export const internalOnboardingFilter = `(${internalOnboardingVersions.join(",")})`;
export function isMemberRoadmapResponse(version: string): boolean { return !internalOnboardingVersions.some(v => v === version); }
