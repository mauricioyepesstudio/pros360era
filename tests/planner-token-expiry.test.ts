import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { InstagramPublishError } from "../lib/social/instagram.ts";
import { FacebookPublishError } from "../lib/social/facebook.ts";

const code = ts.transpileModule(readFileSync(new URL("../lib/professional-planner/publisher.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
type Row = { user_id: string; answers: { posts: { id: string; platform: string }[] } };
type Connection = { provider_account_id: string; token_ciphertext: string; scopes: string[]; status: string };
function fixture(failure: "token" | "ordinary" | "uncertain", rotate = false, updateError = false) {
  const rows: Row[] = [
    { user_id: "owner-a", answers: { posts: [{ id: "ig-a1", platform: "instagram" }, { id: "ig-a2", platform: "instagram" }, { id: "fb-a1", platform: "facebook" }] } },
    { user_id: "owner-b", answers: { posts: [{ id: "ig-b1", platform: "instagram" }] } },
  ];
  const connections = new Map<string, Connection>();
  for (const owner of ["owner-a", "owner-b"]) for (const platform of ["instagram", "facebook"]) {
    connections.set(owner + ":" + platform, { provider_account_id: owner + platform, token_ciphertext: "old-" + owner + platform, scopes: [platform === "instagram" ? "instagram_business_content_publish" : "pages_manage_posts"], status: "ACTIVE" });
  }
  const updates: Record<string, unknown>[] = [];
  const logs = new Map<string, { state: string; error?: string }>();
  const service = { from(table: string) {
    const filters: Record<string, unknown> = {};
    let patch: { status: string } | undefined;
    const query = {
      select() { return query; },
      eq(key: string, value: unknown) { filters[key] = value; return query; },
      limit: async () => ({ data: rows, error: null }),
      maybeSingle: async () => ({ data: table === "social_connections" ? connections.get(filters.user_id + ":" + filters.provider) : null, error: null }),
      upsert: async (row: { answers: { entries: Record<string, { state: string; error?: string }> } }) => {
        for (const [id, entry] of Object.entries(row.answers.entries)) logs.set(id, { ...entry });
        return { error: null };
      },
      update(value: { status: string }) { patch = value; return query; },
      then(resolve: (value: unknown) => unknown) {
        updates.push({ ...filters });
        const connection = connections.get(filters.user_id + ":" + filters.provider);
        if (!updateError && connection && Object.entries(filters).every(([key, value]) =>
          key === "user_id" || key === "provider" || connection[key as keyof Connection] === value)) connection.status = patch!.status;
        return Promise.resolve({ error: updateError ? { message: "storage failure" } : null }).then(resolve);
      },
    };
    return query;
  } };
  const calls: string[] = [];
  async function publish(accountId: string) {
    calls.push(accountId);
    if (accountId.startsWith("owner-a") && (accountId.endsWith("instagram") || accountId.endsWith("facebook"))) {
      if (rotate) connections.get("owner-a:" + (accountId.endsWith("instagram") ? "instagram" : "facebook"))!.token_ciphertext = "new-credential";
      if (failure === "token") throw accountId.endsWith("instagram")
        ? new InstagramPublishError("rejected", false, true) : new FacebookPublishError("rejected", true);
      if (failure === "uncertain") throw new InstagramPublishError("Revisa la publicación antes de reprogramarla.", true);
      throw new Error("ordinary");
    }
    return { mediaId: "published-fixture", permalink: null };
  }
  const nativeRequire = createRequire(import.meta.url);
  const dependencies: Record<string, unknown> = {
    "@/lib/social/crypto": { decryptToken: () => "fixture-token" },
    "@/lib/social/connections": { tokenBinding: () => "binding" },
    "@/lib/social/instagram": { InstagramPublishError, PUBLIC_APP_URL: "https://evolusa.vercel.app", publishInstagramMedia: publish },
    "@/lib/social/facebook": { FacebookPublishError, FACEBOOK_PUBLISH_SCOPE: "pages_manage_posts", publishFacebookPost: publish },
    "@/lib/social/linkedin-publishing": { LinkedInPublishError: class extends Error {}, LINKEDIN_PUBLISH_SCOPE: "w_member_social" },
    "@/lib/social/threads": { ThreadsPublishError: class extends Error {} },
    "@/lib/professional-planner/house-content": { isEvolusaBrandedPost: () => false },
    "@/lib/professional-planner/validation": { parseProfessionalPlanner: (value: unknown) => value, professionalPlannerVersion: "fixture" },
    "@/lib/professional-planner/publishing": {
      duePosts: (planner: Row["answers"]) => planner.posts,
      isAutoPublishable: () => true, canStartPlannerPublication: () => true,
      plannerPublishRunBudgetMs: 10000, parsePublishLog: () => ({}),
      publishLogId: (id: string) => id, plannerPublishLogVersion: "fixture",
      scheduledFor: () => new Date(0), staleClaimMs: 10000,
      instagramMediaRequest: () => ({ ok: true, params: {} }),
      facebookRequest: () => ({ ok: true, request: {} }),
    },
  };
  const loadedModule = { exports: {} as { publishDuePlannerPosts: (service: unknown, key: Buffer) => Promise<unknown> } };
  vm.runInNewContext(code, { exports: loadedModule.exports, require: (id: string) => dependencies[id] ?? nativeRequire(id), Date, Buffer });
  return { run: () => loadedModule.exports.publishDuePlannerPosts(service, Buffer.alloc(32)), calls, updates, connections, logs };
}

test("invalid tokens expire only the rejected owner/network credential and stop that network for this run", async () => {
  const f = fixture("token");
  assert.deepEqual({ ...await f.run() as Record<string, number> }, { published: 1, failed: 2, notConnected: 1, deferred: 0 });
  assert.deepEqual(f.calls, ["owner-ainstagram", "owner-afacebook", "owner-binstagram"]);
  assert.equal(f.connections.get("owner-a:instagram")!.status, "EXPIRED");
  assert.equal(f.connections.get("owner-b:instagram")!.status, "ACTIVE");
  assert.equal(f.updates.length, 2);
  for (const update of f.updates) {
    assert.equal(update.user_id, "owner-a");
    assert.equal(update.status, "ACTIVE");
    assert.equal(update.token_ciphertext, "old-owner-a" + update.provider);
    assert.equal(update.provider_account_id, "owner-a" + update.provider);
  }
  assert.match(f.logs.get("ig-a1")!.error!, /Vuelve a conectarla en Redes/);
  assert.equal(f.logs.has("ig-a2"), false, "remaining post is never claimed or sent");
});

test("concurrent reconnection is not overwritten by a rejected old token", async () => {
  const f = fixture("token", true);
  await f.run();
  assert.equal(f.connections.get("owner-a:instagram")!.status, "ACTIVE");
  assert.equal(f.connections.get("owner-a:instagram")!.token_ciphertext, "new-credential");
  assert.equal(f.calls.filter(x => x === "owner-ainstagram").length, 1);
});

test("ordinary publishing failures do not expire connections or stop other posts", async () => {
  const f = fixture("ordinary");
  await f.run();
  assert.equal(f.updates.length, 0);
  assert.equal(f.calls.filter(x => x === "owner-ainstagram").length, 2);
});

test("publication uncertainty remains uncertainty rather than token expiration", async () => {
  const f = fixture("uncertain");
  await f.run();
  assert.equal(f.updates.length, 0);
  assert.equal(f.logs.get("ig-a1")!.error, "Revisa la publicación antes de reprogramarla.");
  assert.doesNotMatch(f.logs.get("ig-a1")!.error!, /No se publicó/);
});

test("storage failure stops the run after retaining the failed post log", async () => {
  const f = fixture("token", false, true);
  await assert.rejects(f.run(), /connection_expiry_unavailable/);
  assert.equal(f.logs.get("ig-a1")!.state, "FAILED");
  assert.equal(f.calls.length, 1);
});
