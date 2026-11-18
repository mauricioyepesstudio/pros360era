import test from "node:test";
import assert from "node:assert/strict";
import { brandFileSteps, brandImageAllowed, emptyBrandKit, normalizeHexColor, parseBrandKit, type BrandKit } from "../lib/cerebro/brand-kit.ts";
import { brandKitId, voiceProfileId } from "../lib/cerebro/identity.ts";
import { extractBrandSignals, isPrivateAddress, publicWebsiteUrl, readWebsiteSignals } from "../lib/cerebro/website-absorb.ts";
import { buildSystemPrompt } from "../lib/cerebro/prompt.ts";

const supabase = "https://abc.supabase.co";
const owner = "11111111-2222-3333-4444-555555555555";
const image = `${supabase}/storage/v1/object/public/planner-images/${owner}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg`;
const allowed = (url: string) => brandImageAllowed(url, owner, supabase);
const kit: BrandKit = { colors: ["#1f3a8a", "#ff5a36"], fonts: "Poppins", about: "Notary Public móvil en Miami", visualRules: "Fotos reales, fondo claro", imageUrls: [image], manager: "Mauricio", imagesConsent: true };

test("brand kit parses valid input and rejects bad shapes", () => {
  assert.deepEqual(parseBrandKit({ ...kit, colors: ["#1F3A8A", "#f53"], manager: " Mauricio " }, allowed), { ...kit, colors: ["#1f3a8a", "#ff5533"] });
  assert.equal(parseBrandKit({ ...kit, colors: [] }, allowed), null, "needs one color");
  assert.equal(parseBrandKit({ ...kit, colors: ["red"] }, allowed), null);
  assert.equal(parseBrandKit({ ...kit, colors: ["#111111", "#111"] }, allowed), null, "no duplicates");
  assert.equal(parseBrandKit({ ...kit, manager: " " }, allowed), null, "needs a human manager");
  assert.equal(parseBrandKit({ ...kit, imagesConsent: false }, allowed), null, "images need consent");
  assert.ok(parseBrandKit({ ...kit, imageUrls: [], imagesConsent: false }, allowed));
  assert.equal(parseBrandKit({ ...kit, extra: 1 }, allowed), null);
  assert.equal(parseBrandKit(emptyBrandKit(), allowed), null);
  assert.equal(normalizeHexColor("#ABC"), "#aabbcc");
});

test("brandbook images must be the owner's own planner uploads", () => {
  assert.ok(allowed(image));
  assert.equal(allowed(image.replace(owner, "99999999-2222-3333-4444-555555555555")), false, "another user's folder");
  assert.equal(allowed(image.replace("planner-images", "other")), false);
  assert.equal(allowed(image + "?x=1"), false);
  assert.equal(allowed(image.replace("https://abc.supabase.co", "https://evil.example")), false);
  assert.equal(allowed("https://abc.supabase.co/storage/v1/object/public/planner-images/" + owner + "/../x.jpg"), false);
  assert.equal(brandImageAllowed(image, owner, null), false);
});

test("brand file needs business, voice and brandbook", () => {
  assert.deepEqual(brandFileSteps({ business: true, voice: false, brand: false }).missing, ["Mi voz", "Mi brandbook y encargado"]);
  assert.equal(brandFileSteps({ business: true, voice: true, brand: true }).ready, true);
  assert.notEqual(brandKitId(owner), voiceProfileId(owner));
  assert.match(brandKitId(owner), /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("prompt carries the visual brand only when present", () => {
  const voice = { tone: "cercano", language: "es", personality: "Directa", useWords: "", avoidWords: "", cta: "Escríbeme", disclaimer: "", emojis: false } as const;
  const business = { businessName: "Marie", audience: "familias", services: "Notary Public", offer: "Cita", location: "Miami" };
  assert.doesNotMatch(buildSystemPrompt(voice, business), /Marca visual/);
  const withBrand = buildSystemPrompt(voice, business, kit);
  assert.match(withBrand, /Colores: #1f3a8a, #ff5a36/);
  assert.match(withBrand, /Reglas visuales: Fotos reales/);
});

const html = `<html><head><title>Personal CFO | Finanzas para tu negocio</title>
<meta name="description" content="Ordeno las finanzas de tu negocio &amp; te acompaño.">
<meta name="theme-color" content="#0B5FFF">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;family=Open+Sans&display=swap" rel="stylesheet">
<style>body{font-family:"Lato",Arial,sans-serif;color:#222222;background:#ffffff}.btn{background:#ff5a36}.x{color:#ff5a36}</style></head>
<body><a href="https://www.instagram.com/personalcfo/">IG</a><a href="https://www.facebook.com/sharer.php?u=x">share</a><a href="https://www.linkedin.com/company/personal-cfo/about">in</a></body></html>`;

test("website signals: name, description, colors, fonts and socials", () => {
  const signals = extractBrandSignals(html, "https://personalcfo.com/");
  assert.equal(signals.name, "Personal CFO");
  assert.equal(signals.description, "Ordeno las finanzas de tu negocio & te acompaño.");
  assert.deepEqual(signals.colors, ["#0b5fff", "#ff5a36"], "neutrals dropped, theme-color first");
  assert.deepEqual(signals.fonts, ["Poppins", "Open Sans", "Lato"]);
  assert.deepEqual(signals.socials, [{ platform: "instagram", url: "https://instagram.com/personalcfo" }, { platform: "linkedin", url: "https://linkedin.com/company/personal-cfo" }]);
});

test("website reader refuses private hosts and odd URLs", async () => {
  for (const ip of ["127.0.0.1", "10.0.0.5", "169.254.169.254", "192.168.1.1", "172.20.0.1", "0.0.0.0", "::", "::1", "fd00::1", "::ffff:10.0.0.1", "::ffff:7f00:1", "::ffff:a9fe:a9fe", "64:ff9b::7f00:1", "::7f00:1", "2002:7f00:1::", "100.64.0.1", "not-an-ip"]) assert.ok(isPrivateAddress(ip), ip);
  assert.equal(isPrivateAddress("93.184.216.34"), false);
  assert.equal(isPrivateAddress("2606:4700::1111"), false);
  assert.equal(publicWebsiteUrl("http://user:pw@site.com"), null);
  assert.equal(publicWebsiteUrl("https://site.com:8080"), null);
  assert.equal(publicWebsiteUrl("https://127.0.0.1"), null);
  assert.equal(publicWebsiteUrl("site.com")?.href, "https://site.com/");
  let fetched = false;
  const fetcher = (async () => { fetched = true; return new Response(html, { headers: { "content-type": "text/html" } }); }) as typeof fetch;
  const blocked = await readWebsiteSignals("https://internal.example", { fetcher, lookup: async () => [{ address: "10.0.0.2" }] });
  assert.equal(blocked.ok, false);
  assert.equal(fetched, false, "never connects to a private address");
  const ok = await readWebsiteSignals("personalcfo.com", { fetcher, lookup: async () => [{ address: "93.184.216.34" }] });
  assert.ok(ok.ok && ok.signals.name === "Personal CFO");
});

test("website reader re-checks every redirect hop", async () => {
  const calls: string[] = [];
  const fetcher = (async (url: string) => { calls.push(url); return new Response(null, { status: 302, headers: { location: "https://metadata.internal/" } }); }) as unknown as typeof fetch;
  const lookup = async (host: string) => [{ address: host === "metadata.internal" ? "169.254.169.254" : "93.184.216.34" }];
  const result = await readWebsiteSignals("https://site.com", { fetcher, lookup });
  assert.equal(result.ok, false);
  assert.deepEqual(calls, ["https://site.com/"]);
});

test("hostile HTML (unclosed tags) is parsed fast", () => {
  const started = Date.now();
  extractBrandSignals("<style>" + "a".repeat(1_500_000), "https://site.com/");
  extractBrandSignals("<title".repeat(200_000), "https://site.com/");
  extractBrandSignals("<meta ".repeat(200_000), "https://site.com/");
  extractBrandSignals(' href="https://'.repeat(100_000), "https://site.com/");
  assert.ok(Date.now() - started < 1500, `took ${Date.now() - started} ms`);
});
