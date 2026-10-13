import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { handlePlannerImageUpload, normalizePlannerImage, plannerImageMaxBytes, readPlannerImageForm } from "../lib/professional-planner/image-upload.ts";

const origin = "https://evolusa.vercel.app";
async function request(file: File, consent = true) {
  const form = new FormData(); form.set("image", file); if (consent) form.set("publicImageConsent", "true");
  return new Request(`${origin}/api/professional/planner/image`, { method: "POST", headers: { Origin: origin }, body: form });
}
async function png() { return new File([new Uint8Array(await sharp({ create: { width: 30, height: 40, channels: 3, background: "red" } }).png().toBuffer())], "photo.png", { type: "image/png" }); }

test("upload authenticates and binds stored image to owner, converts PNG to JPEG", async () => {
  let calls = 0;
  const response = await handlePlannerImageUpload(await request(await png()), { owner: async () => "actual-owner", store: async (owner, image) => { calls++; assert.equal(owner, "actual-owner"); assert.equal((await sharp(image).metadata()).format, "jpeg"); return "https://cdn.example.com/actual-owner/random.jpg"; } });
  assert.equal(response.status, 200); assert.equal(calls, 1);
});
test("cross-origin and signed-out requests never store", async () => {
  let calls = 0; const deps = { owner: async () => null, store: async () => { calls++; return "bad"; } };
  const foreign = await request(await png()); foreign.headers.set("Origin", "https://attacker.example");
  assert.equal((await handlePlannerImageUpload(foreign, deps)).status, 403);
  const missing = await request(await png()); missing.headers.delete("Origin");
  assert.equal((await handlePlannerImageUpload(missing, deps)).status, 403);
  assert.equal((await handlePlannerImageUpload(await request(await png()), deps)).status, 401); assert.equal(calls, 0);
});
test("consent, SVG, fake MIME and oversized bodies reject without storing", async () => {
  let calls = 0; const deps = { owner: async () => "owner", store: async () => { calls++; return "bad"; } };
  assert.equal((await handlePlannerImageUpload(await request(await png(), false), deps)).status, 400);
  for (const type of ["image/svg+xml", "image/jpeg"]) assert.equal((await handlePlannerImageUpload(await request(new File(["<svg>bad</svg>"], "bad.svg", { type })), deps)).status, 400);
  const tooLarge = new Request(`${origin}/upload`, { method: "POST", body: new Uint8Array(plannerImageMaxBytes + 1) });
  await assert.rejects(readPlannerImageForm(tooLarge)); assert.equal(calls, 0);
});
test("storage unavailable or owner quota reached returns honest failure", async () => {
  assert.equal((await handlePlannerImageUpload(await request(await png()), { owner: async () => "owner", store: async () => null })).status, 503);
});
test("JPEG output removes metadata and respects dimensions", async () => {
  const input = await sharp({ create: { width: 3000, height: 100, channels: 3, background: "red" } }).withMetadata({ exif: { IFD0: { Artist: "Private name" } } }).jpeg().toBuffer();
  const output = await normalizePlannerImage(new File([new Uint8Array(input)], "private.jpg", { type: "image/jpeg" }));
  const metadata = await sharp(output).metadata(); assert.equal(metadata.exif, undefined); assert.equal(metadata.width, 2048);
});
test("image pixel bombs are rejected before normalization", async () => {
  const input = await sharp({ create: { width: 5100, height: 5000, channels: 3, background: "red" } }).png().toBuffer();
  await assert.rejects(normalizePlannerImage(new File([new Uint8Array(input)], "bomb.png", { type: "image/png" })));
});
