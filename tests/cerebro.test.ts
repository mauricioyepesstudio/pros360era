import test from "node:test";
import assert from "node:assert/strict";
import { parseVoiceProfile, emptyVoiceProfile, wordList, type VoiceProfile } from "../lib/cerebro/voice-profile.ts";
import { checkDraft, withDisclaimer } from "../lib/cerebro/compliance.ts";
import { buildSystemPrompt, buildUserPrompt } from "../lib/cerebro/prompt.ts";
import { generateDraft, parseModelJson, type CerebroClient } from "../lib/cerebro/engine.ts";
import { voiceProfileId } from "../lib/cerebro/identity.ts";

const notaryDisclaimer = "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN THE STATE OF FLORIDA, AND I MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE.";
const voice: VoiceProfile = { tone: "cercano", language: "es-en", personality: "Directa y cálida", useWords: "paso a paso, con cita", avoidWords: "barato", cta: "Escríbeme para agendar", disclaimer: notaryDisclaimer, emojis: false };
const business = { businessName: "Marie Fernandez", audience: "familias en Miami", services: "Notary Public móvil", offer: "Cita a domicilio", location: "Miami, FL" };
const client = (text: string, calls: unknown[] = []): CerebroClient => ({ messages: { create: async (params) => { calls.push(params); return { content: [{ type: "text", text }] }; } } });

test("voice profile parses valid input and rejects bad shapes", () => {
  assert.deepEqual(parseVoiceProfile({ ...voice, personality: "  Directa y cálida  " }), voice);
  assert.equal(parseVoiceProfile({ ...voice, tone: "agresivo" }), null);
  assert.equal(parseVoiceProfile({ ...voice, cta: " " }), null);
  assert.equal(parseVoiceProfile({ ...voice, extra: "x" }), null);
  assert.equal(parseVoiceProfile({ ...voice, personality: "x".repeat(301) }), null);
  assert.equal(parseVoiceProfile(emptyVoiceProfile()), null, "empty profile is not savable");
  assert.deepEqual(wordList("uno, dos\ntres,,"), ["uno", "dos", "tres"]);
  assert.match(voiceProfileId("user-1"), /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(voiceProfileId("user-1"), voiceProfileId("user-2"));
});

test("compliance blocks promised figures, «verificado» and «notario»", () => {
  for (const text of ["Aumenta tus ventas un 30%", "Gana $500 extra", "Resultados en 30 días", "Te lo garantizamos", "Perfil verificado", "Tu notaria de confianza", "Resultados garantizados."]) {
    assert.equal(checkDraft(text).status, "blocked", text);
  }
  assert.equal(checkDraft("Hablemos de tu visa").status, "needs_review");
  assert.equal(checkDraft("Agenda tu cita con un Notary Public bilingüe.").status, "ok");
  assert.equal(checkDraft("Precio barato", { avoidWords: ["barato"] }).status, "needs_review");
});

test("the profile disclaimer is required, appended once and not flagged itself", () => {
  assert.equal(checkDraft("Agenda tu cita.", { disclaimer: notaryDisclaimer }).status, "blocked");
  const text = withDisclaimer("Agenda tu cita.", notaryDisclaimer);
  assert.equal(withDisclaimer(text, notaryDisclaimer), text);
  assert.deepEqual(checkDraft(text, { disclaimer: notaryDisclaimer }), { status: "ok", issues: [] });
});

test("prompt carries the rules, the voice and the business", () => {
  const system = buildSystemPrompt(voice, business);
  for (const piece of ["No prometas resultados", "perfil aprobado", "Notary Public", "Directa y cálida", "paso a paso", "barato", "Escríbeme para agendar", "No uses emojis", "Miami, FL", "JSON"]) assert.ok(system.includes(piece), piece);
  assert.match(buildUserPrompt({ platform: "linkedin", topic: "Apostillas" }), /LinkedIn[\s\S]*Apostillas/);
});

test("engine never invents text: no key, provider error or bad JSON fail clearly", async () => {
  assert.deepEqual(await generateDraft({ voice, business, request: { platform: "instagram", topic: "x" } }, { client: null }), { ok: false, reason: "missing_key", message: "El motor de IA está apagado: falta la clave de Anthropic en Vercel." });
  const broken: CerebroClient = { messages: { create: async () => { throw new Error("boom"); } } };
  assert.equal((await generateDraft({ voice, business, request: { platform: "instagram", topic: "x" } }, { client: broken })).ok, false);
  const bad = await generateDraft({ voice, business, request: { platform: "instagram", topic: "x" } }, { client: client("no es json") });
  assert.deepEqual(bad.ok ? null : bad.reason, "invalid_response");
});

test("engine returns a checked draft with the disclaimer and the chosen model", async () => {
  const calls: unknown[] = [];
  const result = await generateDraft({ voice, business, request: { platform: "instagram", topic: "Apostillas" } }, { client: client('```json\n{"caption":"¿Necesitas notarizar un documento? Voy a tu casa.","hashtags":["#Miami","NotaryPublic"],"idea":"Foto en la mesa de firma"}\n```', calls), model: "test-model" });
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.ok(result.draft.caption.endsWith(notaryDisclaimer));
  assert.deepEqual(result.draft.hashtags, ["Miami", "NotaryPublic"]);
  assert.equal(result.draft.compliance.status, "ok");
  assert.equal(result.draft.model, "test-model");
  assert.equal((calls[0] as { model: string }).model, "test-model");
  assert.equal(parseModelJson('Aquí va: {"caption":"Hola"}')?.caption, "Hola");
});
