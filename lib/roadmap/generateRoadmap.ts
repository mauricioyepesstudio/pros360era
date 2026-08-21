import { roadmapRules } from "./rules.ts";
import type { RoadmapAnswers, RoadmapItem, RoadmapResult } from "./types.ts";

const disclaimer = "Este Roadmap ofrece orientación operacional y educativa general. No constituye asesoría legal, migratoria, fiscal, financiera ni de seguros.";

function dedupe(items: RoadmapItem[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function primaryStage(answers: RoadmapAnswers): RoadmapResult["primaryStage"] {
  if (answers.primaryPriority === "start_business") return "EMPRENDE";
  if (["organize_business", "protect_business"].includes(answers.primaryPriority ?? "")) return "PROTEGETE";
  if (answers.primaryPriority === "get_customers") return "CRECE";
  if (answers.primaryPriority === "scale") return "EVOLUCIONA";
  if (answers.hasBusiness === "yes") return "PROTEGETE";
  return answers.timeInUs === "under_6_months" ? "LLEGA" : "ESTABLECETE";
}

export function generateRoadmap(answers: RoadmapAnswers): RoadmapResult {
  const result: Pick<RoadmapResult, "completed" | "now" | "upcoming"> = { completed: [], now: [], upcoming: [] };
  for (const rule of roadmapRules) if (rule.when(answers)) result[rule.target].push(rule.item);

  if (result.now.length === 0) result.now.push(roadmapRules.find((rule) => rule.id === "needs-orientation")!.item);

  const completedIds = new Set(result.completed.map((item) => item.id));
  result.now = result.now.filter((item) => !completedIds.has(item.id)).slice(0, 3);
  const activeIds = new Set([...completedIds, ...result.now.map((item) => item.id)]);
  result.upcoming = result.upcoming.filter((item) => !activeIds.has(item.id)).slice(0, 5);

  return { completed: dedupe(result.completed), now: dedupe(result.now), upcoming: dedupe(result.upcoming), primaryStage: primaryStage(answers), disclaimer, version: "1.0.0" };
}
