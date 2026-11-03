/**
 * Motor de IA del cerebro EVOLUSA. Un solo punto que habla con Claude: arma el
 * prompt con el perfil de voz, valida la respuesta, aplica el filtro de
 * cumplimiento y devuelve un BORRADOR. Si algo falla devuelve un error claro;
 * nunca rellena con texto inventado.
 */
import { z } from "zod";
import { checkDraft, withDisclaimer, type ComplianceResult } from "./compliance.ts";
import { buildSystemPrompt, buildUserPrompt, type DraftBusiness, type DraftRequest } from "./prompt.ts";
import { wordList, type VoiceProfile } from "./voice-profile.ts";

export const CEREBRO_DEFAULT_MODEL = "claude-sonnet-5-5";

/** Lo único que el motor necesita del SDK; se inyecta en las pruebas. */
export type CerebroClient = {
  messages: {
    create(params: { model: string; max_tokens: number; system: string; messages: { role: "user"; content: string }[] }): Promise<{ content: { type: string; text?: string }[] }>;
  };
};

export type Draft = { caption: string; hashtags: string[]; idea: string; compliance: ComplianceResult; model: string };
export type DraftFailure = "missing_key" | "provider_error" | "invalid_response";
export type DraftResult = { ok: true; draft: Draft } | { ok: false; reason: DraftFailure; message: string };

const responseSchema = z.object({
  caption: z.string().trim().min(1).max(3000),
  hashtags: z.array(z.string().trim().min(1).max(60)).max(15).default([]),
  idea: z.string().trim().max(400).default(""),
});

const failureMessages: Record<DraftFailure, string> = {
  missing_key: "El motor de IA está apagado: falta la clave de Anthropic en Vercel.",
  provider_error: "No pudimos generar el borrador ahora. Inténtalo de nuevo en unos minutos.",
  invalid_response: "La IA devolvió una respuesta que no pudimos leer. Inténtalo de nuevo.",
};
const fail = (reason: DraftFailure): DraftResult => ({ ok: false, reason, message: failureMessages[reason] });

export function parseModelJson(text: string): z.infer<typeof responseSchema> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = responseSchema.safeParse(JSON.parse(raw.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function generateDraft(
  input: { voice: VoiceProfile; business: DraftBusiness; request: DraftRequest },
  deps: { client?: CerebroClient | null; model?: string } = {},
): Promise<DraftResult> {
  const client = deps.client === undefined ? await defaultClient() : deps.client;
  if (!client) return fail("missing_key");
  const model = deps.model ?? process.env.CEREBRO_MODEL ?? CEREBRO_DEFAULT_MODEL;
  let text = "";
  try {
    const message = await client.messages.create({
      model,
      max_tokens: 1500,
      system: buildSystemPrompt(input.voice, input.business),
      messages: [{ role: "user", content: buildUserPrompt(input.request) }],
    });
    text = message.content.filter((block) => block.type === "text").map((block) => block.text ?? "").join("");
  } catch (error) {
    console.error("cerebro: provider_error", { model, error: error instanceof Error ? error.message : "unknown" });
    return fail("provider_error");
  }
  const parsed = parseModelJson(text);
  if (!parsed) return fail("invalid_response");
  const hashtags = parsed.hashtags.map((tag) => tag.replace(/^#+/, "").replace(/\s+/g, "")).filter(Boolean);
  const caption = withDisclaimer(parsed.caption, input.voice.disclaimer);
  const compliance = checkDraft([caption, hashtags.join(" "), parsed.idea].join("\n"), { disclaimer: input.voice.disclaimer, avoidWords: wordList(input.voice.avoidWords) });
  console.info("cerebro: draft", { model, platform: input.request.platform, status: compliance.status, issues: compliance.issues.map((issue) => issue.id) });
  return { ok: true, draft: { caption, hashtags, idea: parsed.idea, compliance, model } };
}

async function defaultClient(): Promise<CerebroClient | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic() as unknown as CerebroClient;
}
