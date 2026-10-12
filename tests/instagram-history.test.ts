import test from "node:test";
import assert from "node:assert/strict";
import { instagramHistory, mergeInstagramHistory } from "../lib/professional-planner/instagram-history.ts";
import { parseProfessionalPlanner, type PlannerPost } from "../lib/professional-planner/validation.ts";
import { duePosts } from "../lib/professional-planner/publishing.ts";

const media = { id: "123", timestamp: "2026-10-12T02:30:00Z", caption: "Mi publicación\nMás texto", media_type: "IMAGE", media_url: "https://cdn.example.com/photo.jpg", permalink: "https://www.instagram.com/p/real/" };
test("Real posts use Florida date, keep original text/link, and never become due", () => {
  const history = instagramHistory({ data: [media] });
  assert.equal(history.posts[0].date, "2026-10-11");
  assert.equal(history.posts[0].time, "22:30");
  assert.equal(history.posts[0].caption, media.caption);
  assert.equal(history.publications["ig-123"].permalink, media.permalink);
  assert.ok(parseProfessionalPlanner({ posts: history.posts }));
  assert.deepEqual(duePosts({ posts: history.posts }, {}, Date.parse("2026-10-12T18:00:00Z")), []);
});
test("Import deduplicates IDs, rejects bad timestamps and unsafe links", () => {
  const history = instagramHistory({ data: [media, media, { ...media, id: "456", timestamp: "bad" }, { ...media, id: "789", media_url: "javascript:alert(1)", permalink: "https://evil.example/" }] });
  assert.equal(history.posts.length, 2);
  assert.equal(history.posts[1].imageUrl, null);
  assert.equal(history.publications["ig-789"].permalink, null);
});
test("Repeated reads preserve planned posts and refresh imported thumbnails", () => {
  const planned: PlannerPost = { ...instagramHistory({ data: [media] }).posts[0], id: "own-plan", status: "DRAFT", caption: "Mi borrador" };
  const imported = instagramHistory({ data: [media] }).posts;
  const first = mergeInstagramHistory([planned], imported);
  const second = mergeInstagramHistory(first, [{ ...imported[0], imageUrl: "https://cdn.example.com/new.jpg" }]);
  assert.equal(second.length, 2);
  assert.deepEqual(second.find((post) => post.id === "own-plan"), planned);
  assert.equal(second.find((post) => post.id === "ig-123")?.imageUrl, "https://cdn.example.com/new.jpg");
});
test("Imported posts cannot be changed into a new publishing request", () => {
  const post = instagramHistory({ data: [media] }).posts[0];
  assert.equal(parseProfessionalPlanner({ posts: [{ ...post, status: "READY" }] }), null);
});
