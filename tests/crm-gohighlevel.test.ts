import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { cleanLocationId, cleanToken, ghlContactFromLead, GHL_VERSION, normalizePhone, upsertGhlContact, verifyGhlCredentials, type GhlLead } from "../lib/crm/gohighlevel.ts";
import { decryptToken, encryptToken } from "../lib/social/crypto.ts";
import { isPrivateProfileInquiry } from "../lib/crm/gohighlevel-sync.ts";

const lead: GhlLead = { id: "l1", name: "Ana María López", email: " Ana@Example.com ", phone: "(305) 555-0123", whatsapp: null, source: "website", source_url: "https://evolusa.vercel.app/p/ana", notes: "Quiere una cita" };
const creds = { locationId: "AbC123xyz789", token: "pit-00000000-0000-0000-0000-000000000000" };

test("only well-formed location ids and tokens are accepted", () => {
  assert.equal(cleanLocationId(" AbC123xyz789 "), "AbC123xyz789");
  assert.equal(cleanLocationId("abc"), null);
  assert.equal(cleanLocationId("abc/../def12345"), null);
  assert.equal(cleanToken("pit with spaces and more text"), null);
  assert.equal(cleanToken(` ${creds.token} `), creds.token);
  assert.equal(cleanToken(null), null);
});

test("a lead becomes an upsert body with only the fields it has", () => {
  const body = ghlContactFromLead(lead, creds.locationId);
  assert.deepEqual(body, {
    locationId: "AbC123xyz789",
    source: "EVOLUSA",
    tags: ["evolusa", "evolusa-sitio web"],
    name: "Ana María López",
    firstName: "Ana",
    lastName: "María López",
    email: "ana@example.com",
    phone: "+13055550123",
    website: "https://evolusa.vercel.app/p/ana",
  });
  const instagram = ghlContactFromLead({ ...lead, name: "@ana.fl", email: null, phone: null, whatsapp: "+52 55 1234 5678", source: "instagram", source_url: null }, creds.locationId);
  assert.equal(instagram.firstName, undefined);
  assert.equal(instagram.name, "@ana.fl");
  assert.equal(instagram.phone, "+525512345678");
  assert.deepEqual(instagram.tags, ["evolusa", "evolusa-instagram"]);
  assert.equal("email" in instagram, false);
});

test("phones: US numbers to E.164, others kept", () => {
  assert.equal(normalizePhone("305-555-0123"), "+13055550123");
  assert.equal(normalizePhone("1 305 555 0123"), "+13055550123");
  assert.equal(normalizePhone("ext 12"), "ext 12");
  assert.equal(normalizePhone(null), null);
});

function fakeFetch(responses: Record<string, { status: number; body: unknown }>, seen: { url: string; init?: RequestInit }[]) {
  return (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    seen.push({ url, init });
    const match = Object.entries(responses).find(([path]) => url.endsWith(path));
    const { status, body } = match?.[1] ?? { status: 404, body: {} };
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
}

test("upsert sends the version header and bearer token and reads the contact id", async () => {
  const seen: { url: string; init?: RequestInit }[] = [];
  const result = await upsertGhlContact(creds, lead, fakeFetch({ "/contacts/upsert": { status: 201, body: { new: true, contact: { id: "c_123" } } } }, seen));
  assert.deepEqual(result, { ok: true, value: { contactId: "c_123", created: true } });
  assert.equal(seen[0].url, "https://services.leadconnectorhq.com/contacts/upsert");
  const headers = seen[0].init?.headers as Record<string, string>;
  assert.equal(headers.Version, GHL_VERSION);
  assert.equal(headers.Authorization, `Bearer ${creds.token}`);
  assert.equal(JSON.parse(String(seen[0].init?.body)).locationId, creds.locationId);
});

test("errors are classified: auth stops the sync, 422 is one bad contact, 5xx is retry later", async () => {
  const run = (status: number) => upsertGhlContact(creds, lead, fakeFetch({ "/contacts/upsert": { status, body: {} } }, []));
  assert.deepEqual(await run(401), { ok: false, error: "auth" });
  assert.deepEqual(await run(422), { ok: false, error: "rejected" });
  assert.deepEqual(await run(503), { ok: false, error: "unavailable" });
  const offline = await upsertGhlContact(creds, lead, (async () => { throw new Error("offline"); }) as typeof fetch);
  assert.deepEqual(offline, { ok: false, error: "unavailable" });
});

test("verifying credentials only reads; the location name is optional", async () => {
  const seen: { url: string; init?: RequestInit }[] = [];
  const ok = await verifyGhlCredentials(creds, fakeFetch({ "/contacts/search": { status: 200, body: { contacts: [] } }, [`/locations/${creds.locationId}`]: { status: 200, body: { location: { name: "Ana Seguros" } } } }, seen));
  assert.deepEqual(ok, { ok: true, value: { locationName: "Ana Seguros" } });
  assert.ok(seen.every(({ url }) => !url.includes("upsert")));
  const noName = await verifyGhlCredentials(creds, fakeFetch({ "/contacts/search": { status: 200, body: {} } }, []));
  assert.deepEqual(noName, { ok: true, value: { locationName: null } });
  assert.deepEqual(await verifyGhlCredentials(creds, fakeFetch({ "/contacts/search": { status: 403, body: {} } }, [])), { ok: false, error: "auth" });
});

test("the stored token only decrypts for the same owner and location", () => {
  const key = randomBytes(32);
  const sealed = encryptToken(creds.token, key, `gohighlevel:user-a:${creds.locationId}`);
  assert.equal(decryptToken(sealed, key, `gohighlevel:user-a:${creds.locationId}`), creds.token);
  assert.equal(decryptToken(sealed, key, `gohighlevel:user-b:${creds.locationId}`), null);
  assert.ok(!sealed.includes(creds.token));
});

test("migration keeps the token away from clients", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261106190000_crm_gohighlevel_v1.sql", import.meta.url), "utf8");
  assert.match(sql, /revoke all on public\.crm_ghl_connections from public, anon, authenticated/);
  const grant = sql.match(/grant select \(([^)]+)\)\s+on public\.crm_ghl_connections to authenticated/);
  assert.ok(grant);
  assert.ok(!grant[1].includes("token_ciphertext"));
  assert.doesNotMatch(sql, /grant (insert|update)[^;]*crm_ghl/);
  assert.doesNotMatch(sql, /^grant[^;]*\bto anon\b/m);
});

test("direct profile inquiries must never be copied to GoHighLevel without separate consent", () => {
  for (const url of [
    "https://evolusa.us/profesionales/mauricio-yepes-b96cae",
    "https://www.evolusa.us/profesionales/mauricio-yepes-b96cae",
    "https://evolusa.vercel.app/profesionales/jose-miguel-acosta-34c676",
  ]) assert.equal(isPrivateProfileInquiry({ ...lead, source_url: url }), true, url);
  for (const url of [
    "https://evolusa.us/p/ana",
    "https://external.example/profesionales/mauricio",
    "https://evolusa.us.example.com/profesionales/mauricio",
    null,
  ]) assert.equal(isPrivateProfileInquiry({ ...lead, source_url: url }), false, String(url));
});
