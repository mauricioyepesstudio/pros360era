import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { PlannerPost } from "../lib/professional-planner/validation.ts";
import { duePosts, instagramMediaRequest, parsePublishLog, plannerPublishLogVersion, publicationView, publishLogId, scheduledFor, zonedInstant, type PublishLog } from "../lib/professional-planner/publishing.ts";
import { professionalPlannerId } from "../lib/professional-planner/identity.ts";
import { isMemberRoadmapResponse } from "../lib/account/internal-onboarding.ts";
import { publishInstagramMedia } from "../lib/social/instagram.ts";

const post: PlannerPost = { id: "p-1", date: "2026-10-12", time: "18:00", platform: "instagram", format: "4x5", title: "Tu banco bajó", caption: "Texto", imageUrl: "/professionals/kits/miguel-acosta/01-banco-baja-4x5.png", status: "READY", note: null };
const sixPm = Date.parse("2026-10-12T22:00:00Z"); // 18:00 in Florida (EDT, UTC-4)

test("planner times are Florida wall-clock times, across daylight saving", () => {
  assert.equal(zonedInstant("2026-10-12", "18:00").toISOString(), "2026-10-12T22:00:00.000Z");
  assert.equal(zonedInstant("2026-12-01", "09:30").toISOString(), "2026-12-01T14:30:00.000Z");
  assert.equal(scheduledFor({ ...post, time: null })?.toISOString(), "2026-10-12T16:00:00.000Z", "no time means noon");
  assert.equal(scheduledFor({ ...post, date: null, time: null }), null);
});

test("only ready Instagram posts whose time arrived are due", () => {
  const planner = { posts: [post, { ...post, id: "idea", status: "IDEA" as const }, { ...post, id: "fb", platform: "facebook" as const }, { ...post, id: "later", time: "18:30" }, { ...post, id: "old", date: "2026-10-01" }] };
  assert.deepEqual(duePosts(planner, {}, sixPm - 60_000).map((p) => p.id), []);
  assert.deepEqual(duePosts(planner, {}, sixPm).map((p) => p.id), ["p-1"]);
  assert.deepEqual(duePosts(planner, {}, sixPm + 31 * 60_000).map((p) => p.id), ["p-1", "later"]);
});

test("a logged post never goes out twice; a failed one retries only when rescheduled", () => {
  const at = "2026-10-12T22:00:00.000Z";
  const entry = { scheduledFor: at, at, mediaId: null, permalink: null, error: null };
  for (const state of ["PUBLISHING", "PUBLISHED", "FAILED"] as const) {
    assert.deepEqual(duePosts({ posts: [post] }, { "p-1": { ...entry, state } }, sixPm + 60_000), [], state);
  }
  const moved = { ...post, time: "19:00" };
  assert.deepEqual(duePosts({ posts: [moved] }, { "p-1": { ...entry, state: "FAILED" } }, sixPm + 61 * 60_000).map((p) => p.id), ["p-1"]);
  assert.deepEqual(duePosts({ posts: [moved] }, { "p-1": { ...entry, state: "PUBLISHED" } }, sixPm + 61 * 60_000), []);
});

test("Instagram gets a public JPEG; 9:16 goes out as a Story; text-only can't", () => {
  const feed = instagramMediaRequest(post, "https://evolusa.vercel.app");
  assert.deepEqual(feed, { ok: true, kind: "FEED", params: { image_url: "https://evolusa.vercel.app/professionals/kits/miguel-acosta/01-banco-baja-4x5.jpg", caption: "Texto" } });
  const story = instagramMediaRequest({ ...post, format: "9x16", imageUrl: "/professionals/kits/miguel-acosta/01-banco-baja-9x16.png" }, "https://evolusa.vercel.app");
  assert.deepEqual(story, { ok: true, kind: "STORY", params: { media_type: "STORIES", image_url: "https://evolusa.vercel.app/professionals/kits/miguel-acosta/01-banco-baja-9x16.jpg" } });
  assert.equal(instagramMediaRequest({ ...post, format: "text" }, "https://x").ok, false);
  assert.equal(instagramMediaRequest({ ...post, imageUrl: null }, "https://x").ok, false);
  assert.deepEqual(instagramMediaRequest({ ...post, caption: " ", imageUrl: "https://cdn.example.com/a.jpg" }, "https://x"), { ok: true, kind: "FEED", params: { image_url: "https://cdn.example.com/a.jpg" } });
});

test("the log is parsed leniently and shown over the saved status", () => {
  const raw = { entries: { "p-1": { state: "PUBLISHED", scheduledFor: "2026-10-12T22:00:00.000Z", at: "x", mediaId: "1", permalink: "https://www.instagram.com/p/abc/", error: null }, "BAD ID": { state: "PUBLISHED" }, other: { state: "LIVE", scheduledFor: "", at: "" } } };
  const log: PublishLog = parsePublishLog(raw);
  assert.deepEqual(Object.keys(log), ["p-1"]);
  assert.deepEqual(parsePublishLog(null), {});
  assert.equal(publicationView({ posts: [post] }, log, sixPm)["p-1"]?.state, "PUBLISHED");
  const missed = publicationView({ posts: [{ ...post, date: "2026-10-01" }] }, {}, sixPm);
  assert.equal(missed["p-1"]?.state, "MISSED");
});

test("the publish log has its own row and is not a member roadmap", () => {
  const sha = (s: string) => createHash("sha256").update(s).digest("hex");
  const id = publishLogId("u-1", sha);
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(id, professionalPlannerId("u-1"));
  assert.equal(isMemberRoadmapResponse(plannerPublishLogVersion), false);
});

test("publishing creates a container, waits for it, publishes and reads the link", async () => {
  const calls: string[] = [];
  const statuses = ["IN_PROGRESS", "FINISHED"];
  const fake = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push(`${init?.method ?? "GET"} ${url.split("?")[0].replace("https://graph.instagram.com/v23.0", "")}`);
    const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
    if (url.endsWith("/123/media")) {
      assert.equal((init?.body as URLSearchParams).get("media_type"), "STORIES");
      return json({ id: "c-1" });
    }
    if (url.includes("/c-1?")) return json({ status_code: statuses.shift() });
    if (url.endsWith("/media_publish")) return json({ id: "m-1" });
    return json({ permalink: "https://www.instagram.com/stories/x/1/" });
  }) as typeof fetch;
  const result = await publishInstagramMedia("123", "tok", { media_type: "STORIES", image_url: "https://x/a.jpg" }, fake, async () => {});
  assert.deepEqual(result, { mediaId: "m-1", permalink: "https://www.instagram.com/stories/x/1/" });
  assert.deepEqual(calls, ["POST /123/media", "GET /c-1", "GET /c-1", "POST /123/media_publish", "GET /m-1"]);
});

test("Meta's error reaches the professional", async () => {
  const fake = (async () => new Response(JSON.stringify({ error: { message: "Only photo or video can be accepted as media type." } }), { status: 400 })) as typeof fetch;
  await assert.rejects(publishInstagramMedia("123", "tok", { image_url: "https://x/a.png" }, fake, async () => {}), /Only photo or video/);
});

test("every kit image has the JPEG twin Instagram is sent", async () => {
  const { readdirSync, existsSync } = await import("node:fs");
  const root = new URL("../public/professionals/kits/", import.meta.url);
  for (const kit of readdirSync(root)) {
    for (const file of readdirSync(new URL(`${kit}/`, root)).filter((name) => name.endsWith(".png"))) {
      assert.ok(existsSync(new URL(`${kit}/${file.replace(/\.png$/, ".jpg")}`, root)), `${kit}/${file}`);
    }
  }
});
