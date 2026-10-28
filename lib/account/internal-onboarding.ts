import {professionalBusinessVersion} from "../professional-business/validation.ts";
import { professionalScheduleVersion } from "../professional-schedule/validation.ts";
import { professionalPlannerVersion } from "../professional-planner/validation.ts";
import { plannerPublishLogVersion } from "../professional-planner/publishing.ts";
import { initialCallVersion } from "../initial-call/validation.ts";
import { professionalDraftVersion } from "../professional-drafts/validation.ts";
export const internalOnboardingVersions = [professionalBusinessVersion, professionalDraftVersion, initialCallVersion, professionalScheduleVersion, professionalPlannerVersion, plannerPublishLogVersion] as const;
export const internalOnboardingFilter = `(${internalOnboardingVersions.join(",")})`;
export function isMemberRoadmapResponse(version: string): boolean { return !internalOnboardingVersions.some(v => v === version); }
