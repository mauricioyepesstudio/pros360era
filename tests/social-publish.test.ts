import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  escapeLinkedInText,
  instagramImageUrl,
  LINKEDIN_API_VERSION,
  linkedInImagePath,
  PublishError,
  publishToInstagram,
  publishToLinkedIn,
} from "../lib/social/publish.ts";

const noWait = async () => {};

test("kit creatives go to Instagram as their JPEG twin, which exists on disk", () => {
  assert.equal(
    instagramImageUrl("/professionals/kits/miguel-acosta/06-negativo-4x5.png"),
    "https://evolusa.vercel.app/professionals/kits/miguel-acosta/06-negativo-4x5.jpg",
  );
  assert.ok(existsSync(new URL("../public/professionals/kits/miguel-acosta/06-negativo-4x5.jpg", import.meta.url)));
  assert.equal(instagramImageUrl("https://cdn.example.com/a.jpg"), "https://cdn.example.com/a.jpg");
  assert.throws(() => instagramImageUrl(null), (error: PublishError) => error.code === "instagram_needs_image");
  assert.throws(() => instagramImageUrl("/professionals/kits/miguel-acosta/02-dos-destinos-9x16.png"), (error: PublishError) => error.code === "instagram_ratio");
  assert.throws(() => instagramImageUrl("http://insecure.example/a.jpg"), PublishError);
});

test("EVOLUSA only downloads its own kit images for LinkedIn, never a pasted URL", () => {
  assert.equal(linkedInImagePath(null), null);
  assert.equal(linkedInImagePath("/professionals/kits/miguel-acosta/01-banco-baja-1x1.png"), "/professionals/kits/miguel-acosta/01-banco-baja-1x1.jpg");
  assert.throws(() => linkedInImagePath("https://169.254.169.254/latest/meta-data"), (error: PublishError) => error.code === "linkedin_image");
});

test("Instagram: container, wait until processed, publish, then permalink", async () => {
  const calls: { method: string; path: string; body: URLSearchParams | null }[] = [];
  let statusChecks = 0;
  const fetchImpl = (async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const body = init?.body instanceof URLSearchParams ? init.body : null;
    calls.push({ method: init?.method ?? "GET", path: url.pathname, body });
    if (url.pathname.endsWith("/17841400000/media")) return Response.json({ id: "900" });
    if (url.pathname.endsWith("/900")) return Response.json({ status_code: ++statusChecks < 2 ? "IN_PROGRESS" : "FINISHED" });
    if (url.pathname.endsWith("/17841400000/media_publish")) return Response.json({ id: "1801" });
    if (url.pathname.endsWith("/1801")) return Response.json({ permalink: "https://www.instagram.com/p/abc/" });
    return Response.json({ error: { message: "no" } }, { status: 400 });
  }) as typeof fetch;

  const result = await publishToInstagram("tok", "17841400000", { imageUrl: "https://evolusa.vercel.app/x.jpg", caption: "Hola" }, { fetchImpl, wait: noWait });
  assert.deepEqual(result, { externalId: "1801", permalink: "https://www.instagram.com/p/abc/" });
  assert.equal(calls[0].body?.get("image_url"), "https://evolusa.vercel.app/x.jpg");
  assert.equal(calls[0].body?.get("caption"), "Hola");
  assert.equal(calls.filter((call) => call.path.endsWith("/900")).length, 2);
  assert.equal(calls.find((call) => call.path.endsWith("/media_publish"))?.body?.get("creation_id"), "900");
});

test("Instagram errors become a message the professional can act on", async () => {
  const expired = (async () => Response.json({ error: { code: 190 } }, { status: 400 })) as unknown as typeof fetch;
  await assert.rejects(
    publishToInstagram("tok", "17841400000", { imageUrl: "https://a/x.jpg", caption: "" }, { fetchImpl: expired, wait: noWait }),
    (error: PublishError) => /venció/.test(error.userMessage),
  );
  await assert.rejects(publishToInstagram("tok", "../me", { imageUrl: "https://a/x.jpg", caption: "" }, { wait: noWait }), PublishError);
});

test("once Instagram accepted the publish call, a missing id is still a success (no duplicate retry)", async () => {
  const fetchImpl = (async (input: string | URL) => {
    const path = new URL(String(input)).pathname;
    if (path.endsWith("/media")) return Response.json({ id: "900" });
    if (path.endsWith("/900")) return Response.json({ status_code: "FINISHED" });
    return Response.json({});
  }) as typeof fetch;
  assert.deepEqual(await publishToInstagram("tok", "1", { imageUrl: "https://a/x.jpg", caption: "" }, { fetchImpl, wait: noWait }), { externalId: null, permalink: null });
});

test("LinkedIn text escapes the characters its post format treats as markup", () => {
  assert.equal(escapeLinkedInText("Hola (Florida) #negocios @ana_b"), "Hola \\(Florida\\) \\#negocios \\@ana\\_b");
  assert.equal(escapeLinkedInText("sin cambios, ¿ok?"), "sin cambios, ¿ok?");
});

test("LinkedIn: uploads the image, then posts as the member with the versioned API", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes("/rest/images?action=initializeUpload")) {
      return Response.json({ value: { uploadUrl: "https://www.linkedin.com/dms-uploads/abc", image: "urn:li:image:C4D10AQ" } });
    }
    if (url.startsWith("https://www.linkedin.com/dms-uploads/")) return new Response(null, { status: 201 });
    if (url.endsWith("/rest/posts")) return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:7123" } });
    return new Response(null, { status: 404 });
  }) as typeof fetch;

  const result = await publishToLinkedIn("tok", "abc123", { text: "Hola (FL)", image: { bytes: new ArrayBuffer(4), contentType: "image/jpeg" }, altText: "Título" }, fetchImpl);
  assert.deepEqual(result, { externalId: "urn:li:share:7123", permalink: "https://www.linkedin.com/feed/update/urn:li:share:7123/" });
  const post = calls.find((call) => call.url.endsWith("/rest/posts"))!;
  const headers = post.init?.headers as Record<string, string>;
  assert.equal(headers["LinkedIn-Version"], LINKEDIN_API_VERSION);
  const body = JSON.parse(String(post.init?.body));
  assert.equal(body.author, "urn:li:person:abc123");
  assert.equal(body.commentary, "Hola \\(FL\\)");
  assert.equal(body.content.media.id, "urn:li:image:C4D10AQ");
  assert.equal(body.lifecycleState, "PUBLISHED");
});

test("LinkedIn never PUTs the image to an upload URL outside linkedin.com", async () => {
  const urls: string[] = [];
  const fetchImpl = (async (input: string | URL) => {
    urls.push(String(input));
    return Response.json({ value: { uploadUrl: "https://evil.example/upload", image: "urn:li:image:x" } });
  }) as typeof fetch;
  await assert.rejects(publishToLinkedIn("tok", "abc", { text: "t", image: { bytes: new ArrayBuffer(1), contentType: "image/jpeg" }, altText: "" }, fetchImpl), PublishError);
  assert.ok(!urls.some((url) => url.startsWith("https://evil.example")));
});

test("LinkedIn 401 asks to reconnect", async () => {
  const fetchImpl = (async () => new Response(null, { status: 401 })) as unknown as typeof fetch;
  await assert.rejects(publishToLinkedIn("tok", "abc", { text: "t", image: null, altText: "" }, fetchImpl), (error: PublishError) => /venció/.test(error.userMessage));
});

test("the publications migration is read-only for clients and owner-scoped", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261009220000_social_publications_v1.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on public\.social_publications from public, anon, authenticated;/);
  assert.match(sql, /grant select on public\.social_publications to authenticated;/);
  assert.doesNotMatch(sql, /grant (insert|update|delete|all)[^;]*social_publications/i);
  assert.doesNotMatch(sql, /to anon/);
  assert.match(sql, /using \(user_id = \(select auth\.uid\(\)\)\)/);
  assert.match(sql, /constraint social_publications_once unique \(user_id, provider, planner_post_id\)/);
  assert.match(sql, /references public\.social_connections\(id\) on delete cascade/);
  assert.match(sql, /'UNKNOWN'/);
});

test("a timeout or server error on the final call is marked uncertain, never a clean failure", async () => {
  const igFetch = (async (input: string | URL) => {
    const path = new URL(String(input)).pathname;
    if (path.endsWith("/media")) return Response.json({ id: "900" });
    if (path.endsWith("/900")) return Response.json({ status_code: "FINISHED" });
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  await assert.rejects(publishToInstagram("tok", "1", { imageUrl: "https://a/x.jpg", caption: "" }, { fetchImpl: igFetch, wait: noWait }), (error: PublishError) => error.uncertain);

  const li500 = (async () => new Response(null, { status: 502 })) as unknown as typeof fetch;
  await assert.rejects(publishToLinkedIn("tok", "abc", { text: "t", image: null, altText: "" }, li500), (error: PublishError) => error.uncertain);

  const li422 = (async () => new Response(null, { status: 422 })) as unknown as typeof fetch;
  await assert.rejects(publishToLinkedIn("tok", "abc", { text: "t", image: null, altText: "" }, li422), (error: PublishError) => !error.uncertain);
});
