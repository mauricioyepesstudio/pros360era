import test from "node:test";
import assert from "node:assert/strict";
import { emptyPlanner, parseProfessionalPlanner, plannerFromKit, professionalPlannerAllowed, professionalPlannerVersion, safePlannerImageUrl, type PlannerPost } from "../lib/professional-planner/validation.ts";
import { professionalPlannerId } from "../lib/professional-planner/identity.ts";
import { professionalScheduleId } from "../lib/professional-schedule/identity.ts";
import { isMemberRoadmapResponse } from "../lib/account/internal-onboarding.ts";
import { getPreparedKit } from "../data/professional/prepared-kits.ts";

const post: PlannerPost = { id: "p-1", date: "2026-10-13", time: "12:00", platform: "instagram", format: "4x5", title: "Mi primera pieza", caption: "Texto", imageUrl: "/professionals/kits/miguel-acosta/01-banco-baja-4x5.png", status: "IDEA", note: null };

test("an empty planner and a valid post round-trip", () => {
  assert.deepEqual(parseProfessionalPlanner(emptyPlanner()), { posts: [] });
  assert.deepEqual(parseProfessionalPlanner({ posts: [post] }), { posts: [post] });
});

test("one invalid post rejects the whole planner", () => {
  for (const patch of [{ id: "BAD ID" }, { date: "2026-02-30" }, { time: "25:00" }, { platform: "myspace" }, { format: "8x8" }, { status: "LIVE" }, { title: "  " }, { caption: "x".repeat(2201) }, { imageUrl: "javascript:alert(1)" }, { imageUrl: "http://example.com/a.png" }, { imageUrl: "/etc/passwd" }, { user_id: "x" }]) {
    assert.equal(parseProfessionalPlanner({ posts: [{ ...post, ...patch }] }), null, JSON.stringify(patch));
  }
  assert.equal(parseProfessionalPlanner({ posts: [post, post] }), null, "duplicate ids");
  assert.equal(parseProfessionalPlanner({ posts: [], extra: true }), null);
  assert.equal(parseProfessionalPlanner({ posts: [{ ...post, status: "PUBLISHED", date: null, time: null }] }), null, "published needs a date");
});

test("undated posts drop their time and sort last", () => {
  const parsed = parseProfessionalPlanner({ posts: [{ ...post, id: "b", date: null }, { ...post, id: "a", date: "2026-10-20" }] });
  assert.ok(parsed);
  assert.deepEqual(parsed.posts.map((p) => [p.id, p.time]), [["a", "12:00"], ["b", null]]);
});

test("image urls: kit paths and https only", () => {
  assert.equal(safePlannerImageUrl("https://cdn.example.com/a.png"), "https://cdn.example.com/a.png");
  assert.equal(safePlannerImageUrl(""), null);
  assert.equal(safePlannerImageUrl("https://user:pw@example.com/a.png"), undefined);
  assert.equal(safePlannerImageUrl("/professionals/kits/../x.png"), undefined);
});

test("planner is internal, per user, and only for professionals with a profile", () => {
  assert.equal(isMemberRoadmapResponse(professionalPlannerVersion), false);
  assert.notEqual(professionalPlannerId("u"), professionalScheduleId("u"));
  assert.equal(professionalPlannerId("u"), professionalPlannerId("u"));
  assert.equal(professionalPlannerAllowed("MEMBER", true), false);
  assert.equal(professionalPlannerAllowed("PROFESSIONAL", false), false);
  assert.equal(professionalPlannerAllowed("PROFESSIONAL", true), true);
});

test("the kit proposal is a valid planner on a Tuesday/Thursday cadence", () => {
  const kit = getPreparedKit("miguel-acosta");
  assert.ok(kit);
  const planner = plannerFromKit(kit, "2026-10-09"); // Friday
  assert.deepEqual(parseProfessionalPlanner(planner), planner);
  const dated = planner.posts.filter((p) => p.date);
  assert.deepEqual(dated.map((p) => p.date), ["2026-10-13", "2026-10-15", "2026-10-20", "2026-10-22", "2026-10-27", "2026-10-29"]);
  const undated = planner.posts.filter((p) => !p.date);
  assert.deepEqual(undated.map((p) => p.id), ["kit-07-pack-sesiones"], "the piece with unconfirmed prices stays undated");
  assert.ok(planner.posts.every((p) => p.status === "IDEA"));
  assert.equal(plannerFromKit(kit, "2026-10-13").posts[0].date, "2026-10-20", "on a Tuesday the proposal starts next week");
});
