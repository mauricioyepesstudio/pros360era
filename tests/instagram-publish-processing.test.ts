import test from "node:test";
import assert from "node:assert/strict";
import { InstagramPublishError, publishInstagramMedia } from "../lib/social/instagram.ts";
import { canStartPlannerPublication, plannerPublishRunBudgetMs } from "../lib/professional-planner/publishing.ts";

const json = (body: unknown) => new Response(JSON.stringify(body));
const reel = { media_type: "REELS", video_url: "https://example.com/reel.mp4" };

function fixture(statuses: string[], publish?: () => Response | Promise<Response>) {
  const calls: string[] = [];
  let clock = 0;
  const fake = (async (input: string | URL, init?: RequestInit) => {
    const path = new URL(String(input)).pathname;
    calls.push(path);
    assert.ok(init?.signal, "every Graph request has a timeout");
    if (path.endsWith("/media")) return json({ id: "container" });
    if (path.endsWith("/container")) return json({ status_code: statuses.shift() ?? "IN_PROGRESS" });
    if (path.endsWith("/media_publish")) return publish ? publish() : json({ id: "media" });
    return json({ permalink: "https://www.instagram.com/p/test/" });
  }) as typeof fetch;
  const waits: number[] = [];
  return { fake, calls, waits, now: () => clock, wait: async (ms: number) => { waits.push(ms); clock += ms; } };
}

test("a Reel still processing after 42 seconds can finish and publish at two minutes", async () => {
  const f = fixture(["IN_PROGRESS", "IN_PROGRESS", "FINISHED"]);
  const result = await publishInstagramMedia("owner", "token", reel, f.fake, f.wait, { now: f.now });
  assert.equal(result.mediaId, "media");
  assert.deepEqual(f.waits, [60_000, 60_000]);
  assert.equal(f.calls.filter(path => path.endsWith("/media_publish")).length, 1);
});

for (const state of ["ERROR", "EXPIRED"]) {
  test(`a ${state} container is never sent to media_publish`, async () => {
    const f = fixture([state]);
    await assert.rejects(publishInstagramMedia("owner", "token", reel, f.fake, f.wait, { now: f.now }), /no pudo procesar/);
    assert.ok(!f.calls.some(path => path.endsWith("/media_publish")));
  });
}

test("processing remains bounded and never publishes an unfinished container", async () => {
  const f = fixture([]);
  await assert.rejects(publishInstagramMedia("owner", "token", reel, f.fake, f.wait, { now: f.now }), /tardó demasiado/);
  assert.equal(f.now(), 180_000);
  assert.equal(f.calls.filter(path => path.endsWith("/container")).length, 4);
  assert.ok(!f.calls.some(path => path.endsWith("/media_publish")));
});

test("the shared deadline stops polling before a wait would consume the remaining run", async () => {
  const f = fixture([]);
  await assert.rejects(publishInstagramMedia("owner", "token", reel, f.fake, f.wait, { now: f.now, deadline: 100_000 }), /agotó el tiempo/);
  assert.deepEqual(f.waits, [60_000]);
  assert.ok(!f.calls.some(path => path.endsWith("/media_publish")));
});

test("a lost publish response is explicitly ambiguous, with no automatic retry", async () => {
  const f = fixture(["FINISHED"], () => { throw new Error("connection lost"); });
  await assert.rejects(publishInstagramMedia("owner", "token", reel, f.fake, f.wait, { now: f.now }), error => {
    assert.ok(error instanceof InstagramPublishError);
    assert.equal(error.publicationUncertain, true);
    assert.match(error.message, /No sabemos si llegó a publicarse/);
    return true;
  });
  assert.equal(f.calls.filter(path => path.endsWith("/media_publish")).length, 1);
});

test("a new attempt is deferred when a previous slow Reel consumed the run budget", () => {
  assert.equal(canStartPlannerPublication(plannerPublishRunBudgetMs, 0), true);
  assert.equal(canStartPlannerPublication(plannerPublishRunBudgetMs, 180_000), false);
  assert.equal(canStartPlannerPublication(plannerPublishRunBudgetMs, 240_000), false);
});
