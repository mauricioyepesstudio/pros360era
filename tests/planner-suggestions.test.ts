import test from "node:test";
import assert from "node:assert/strict";
import { plannerSuggestions, addPlannerSuggestions } from "../lib/professional-planner/suggestions.ts";
import { parseProfessionalPlanner, plannerMaxPosts } from "../lib/professional-planner/validation.ts";
import { getPreparedKit } from "../data/professional/prepared-kits.ts";

test("real kit suggestions exclude unconfirmed prices, generic templates don't invent identity", () => {
  const ideas = plannerSuggestions(getPreparedKit("miguel-acosta"), "Miguel");
  assert.ok(ideas.some((idea) => idea.source === "Tu kit"));
  assert.equal(ideas.some((idea) => idea.id.includes("07-pack")), false);
  assert.ok(plannerSuggestions(null, null).every((idea) => idea.source === "Plantilla editable" && idea.imageUrl === null));
});
test("selected ideas become valid dated drafts, never ready, and repeated selection deduplicates", () => {
  const ideas = plannerSuggestions(null, "Miguel");
  const posts = addPlannerSuggestions([], ideas, [ideas[0].id, ideas[1].id], "2026-10-14")!;
  assert.equal(posts.length, 2); assert.ok(posts.every((post) => post.status === "IDEA"));
  assert.ok(parseProfessionalPlanner({ posts })); assert.deepEqual(addPlannerSuggestions(posts, ideas, [ideas[0].id], "2026-10-14"), posts);
});
test("invalid dates and capacity overflow reject without altering existing planner", () => {
  const ideas = plannerSuggestions(null, null); const base = addPlannerSuggestions([], ideas, [ideas[0].id], "2026-10-14")!;
  const posts = Array.from({ length: plannerMaxPosts }, (_, index) => ({ ...base[0], id: `existing-${index}` }));
  assert.equal(addPlannerSuggestions(posts, ideas, [ideas[1].id], "2026-10-14"), null);
  assert.equal(addPlannerSuggestions([], ideas, [ideas[1].id], "2026-02-30"), null); assert.equal(posts.length, plannerMaxPosts);
});
