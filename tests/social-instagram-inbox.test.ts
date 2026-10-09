import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cleanUsername, fetchRecentComments, fetchRecentMessages, instagramProfileUrl, text } from "../lib/social/instagram-inbox.ts";

function fakeGraph(routes: Record<string, unknown>) {
  const calls: string[] = [];
  const impl = (async (input: string | URL) => {
    const url = new URL(String(input));
    calls.push(url.pathname);
    for (const [path, body] of Object.entries(routes)) {
      if (url.pathname.endsWith(path)) return Response.json(body);
    }
    return Response.json({ error: { message: "not found" } }, { status: 400 });
  }) as typeof fetch;
  return { impl, calls };
}

test("usernames are normalized and anything odd is rejected", () => {
  assert.equal(cleanUsername("@Maria.Lopez_"), "maria.lopez_");
  assert.equal(cleanUsername("bad name"), null);
  assert.equal(cleanUsername("<script>"), null);
  assert.equal(cleanUsername("a".repeat(31)), null);
  assert.equal(instagramProfileUrl("maria"), "https://www.instagram.com/maria/");
});

test("comments come from recent posts, skipping the account's own replies and posts without comments", async () => {
  const { impl, calls } = fakeGraph({
    "/me/media": { data: [
      { id: "1801", permalink: "https://www.instagram.com/p/abc/", comments_count: 2 },
      { id: "1802", permalink: "https://www.instagram.com/p/def/", comments_count: 0 },
    ] },
    "/1801/comments": { data: [
      { id: "c1", text: "¿Cuánto cuesta la asesoría?", timestamp: "2026-10-09T15:00:00+0000", from: { id: "u1", username: "Maria.Lopez" } },
      { id: "c2", text: "¡Gracias por escribir!", timestamp: "2026-10-09T15:05:00+0000", from: { id: "own", username: "evolusa.us" } },
      { id: "c3", text: "   ", timestamp: "2026-10-09T15:06:00+0000", from: { id: "u2", username: "vacio" } },
    ] },
  });
  const items = await fetchRecentComments("token", "evolusa.us", impl);
  assert.deepEqual(items, [{
    kind: "comment",
    externalId: "c1",
    authorId: "u1",
    authorUsername: "maria.lopez",
    body: "¿Cuánto cuesta la asesoría?",
    permalink: "https://www.instagram.com/p/abc/",
    occurredAt: "2026-10-09T15:00:00.000Z",
  }]);
  assert.ok(!calls.some((path) => path.endsWith("/1802/comments")), "posts without comments aren't fetched");
});

test("direct messages keep only what other people sent", async () => {
  const { impl } = fakeGraph({
    "/me/conversations": { data: [{ id: "t1", messages: { data: [
      { id: "aWdfZAG1faXRlbToxOk==", created_time: "2026-10-09T16:00:00+0000", from: { id: "u9", username: "carlos_m" }, message: "Hola, necesito ayuda con mi negocio" },
      { id: "msg2", created_time: "2026-10-09T16:01:00+0000", from: { id: "178", username: "evolusa.us" }, message: "¡Hola Carlos!" },
    ] } }] },
  });
  const items = await fetchRecentMessages("token", "178", "evolusa.us", impl);
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "message");
  assert.equal(items[0].authorUsername, "carlos_m");
  assert.equal(items[0].externalId, "aWdfZAG1faXRlbToxOk==");
  assert.equal(items[0].permalink, null);
});

test("a Graph error surfaces instead of silently importing nothing", async () => {
  const { impl } = fakeGraph({});
  await assert.rejects(fetchRecentComments("token", "evolusa.us", impl), /instagram_inbox_400/);
  await assert.rejects(fetchRecentMessages("token", "178", "evolusa.us", impl), /instagram_inbox_400/);
});

test("text is cut by code point and never keeps NUL bytes or broken emoji", () => {
  assert.equal(text("ab\u0000c", 10), "abc");
  assert.equal(text("😀😀😀", 2), "😀😀");
  assert.equal(text("ok\uD83D", 10), "ok");
  assert.equal(text("   ", 10), null);
});

test("media ids that aren't numeric never reach the request path", async () => {
  const { impl, calls } = fakeGraph({ "/me/media": { data: [{ id: "../me", permalink: "https://www.instagram.com/p/x/", comments_count: 3 }] } });
  assert.deepEqual(await fetchRecentComments("token", "evolusa.us", impl), []);
  assert.equal(calls.length, 1);
});

test("permalinks outside instagram.com are dropped", async () => {
  const { impl } = fakeGraph({
    "/me/media": { data: [{ id: "1801", permalink: "https://evil.example/p", comments_count: 1 }] },
    "/1801/comments": { data: [{ id: "c1", text: "hola", timestamp: "2026-10-09T15:00:00+0000", username: "ana" }] },
  });
  const [item] = await fetchRecentComments("token", "evolusa.us", impl);
  assert.equal(item.permalink, null);
  assert.equal(item.authorUsername, "ana");
});

test("the inbox migration is read-only for clients and owner-scoped", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261009200000_social_inbox_v1.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on public\.social_inbox_items from public, anon, authenticated;/);
  assert.match(sql, /grant select on public\.social_inbox_items to authenticated;/);
  assert.doesNotMatch(sql, /grant (insert|update|delete|all)[^;]*social_inbox_items/i);
  assert.doesNotMatch(sql, /to anon/);
  assert.match(sql, /using \(user_id = \(select auth\.uid\(\)\)\)/);
  assert.match(sql, /references public\.social_connections\(id\) on delete cascade/);
  assert.match(sql, /grant select \(inbox_synced_at\) on public\.social_connections to authenticated;/);
  assert.doesNotMatch(sql, /token_ciphertext/);
  assert.match(sql, /create unique index crm_leads_instagram_profile_unique/);
});
