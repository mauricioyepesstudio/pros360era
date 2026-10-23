import test from "node:test";
import assert from "node:assert/strict";
import { BRAIN_MODULES, DAILY_TASK_POOL, ROTATING_TASKS_PER_DAY, brainDayKey, launchReadiness, tasksForDay, type BrainModule } from "../lib/admin/jarvis.ts";

test("same day gives the same missions, the next day rotates", () => {
  assert.deepEqual(tasksForDay("2026-10-20"), tasksForDay("2026-10-20"));
  assert.notDeepEqual(tasksForDay("2026-10-20").map((t) => t.id), tasksForDay("2026-10-21").map((t) => t.id));
});

test("a blocked module pins its task first, every day", () => {
  for (const day of ["2026-10-20", "2026-11-03", "2027-01-01"]) {
    const tasks = tasksForDay(day);
    assert.equal(tasks[0].id, "resend-domain");
    assert.equal(tasks.length, 1 + ROTATING_TASKS_PER_DAY);
    assert.equal(new Set(tasks.map((t) => t.id)).size, tasks.length);
  }
});

test("the pinned task disappears once its module is unblocked", () => {
  const unblocked: BrainModule[] = BRAIN_MODULES.map((m) => (m.id === "email" ? { ...m, status: "live" } : m));
  assert.ok(!tasksForDay("2026-10-20", unblocked).some((t) => t.id === "resend-domain"));
});

test("launch gate is not ready while any gate module is not live", () => {
  const readiness = launchReadiness();
  assert.equal(readiness.ready, false);
  assert.ok(readiness.missing.some((m) => m.id === "email"));
  const allLive = BRAIN_MODULES.map((m) => ({ ...m, status: "live" as const }));
  assert.equal(launchReadiness(allLive).ready, true);
});

test("module ids, grid cells and pins are consistent", () => {
  assert.equal(new Set(BRAIN_MODULES.map((m) => m.id)).size, BRAIN_MODULES.length);
  const cells = BRAIN_MODULES.map((m) => `${m.grid.x},${m.grid.y}`);
  assert.equal(new Set(cells).size, cells.length);
  for (const m of BRAIN_MODULES) {
    assert.ok(m.grid.x >= 0 && m.grid.x <= 6 && m.grid.y >= 0 && m.grid.y <= 6);
    assert.ok(!(m.grid.x >= 2 && m.grid.x <= 4 && m.grid.y >= 2 && m.grid.y <= 4), `${m.id} overlaps the core`);
  }
  const ids = new Set(BRAIN_MODULES.map((m) => m.id));
  for (const t of DAILY_TASK_POOL) if (t.pinnedWhileBlocked) assert.ok(ids.has(t.pinnedWhileBlocked));
});

test("copy keeps the compliance wording", () => {
  const text = JSON.stringify([BRAIN_MODULES, DAILY_TASK_POOL]).toLowerCase();
  assert.ok(!text.includes("verificado"));
});

test("day key uses Florida time", () => {
  assert.equal(brainDayKey(new Date("2026-10-20T02:30:00Z")), "2026-10-19");
});
