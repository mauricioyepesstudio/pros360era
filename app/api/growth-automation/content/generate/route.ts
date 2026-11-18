import { isGrowthAutomationReady, growthUnavailableMessage } from "@/lib/growth-automation/readiness";
import { NextRequest, NextResponse } from "next/server";
import { draftWithMyVoice } from "@/lib/cerebro/persistence";

/**
 * Growth Automation ahora redacta con el motor central del cerebro
 * (lib/cerebro): perfil de voz, filtro de cumplimiento y sin texto de respaldo
 * inventado. La «semana completa» se arma en el planner, no aquí.
 */
export async function POST(request: NextRequest) {
  if (!isGrowthAutomationReady()) {
    return NextResponse.json({ error: growthUnavailableMessage }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!body || body.type !== "generate") {
    return NextResponse.json({ error: "Usa el planner para preparar la semana; aquí solo se genera un borrador." }, { status: 400 });
  }
  const result = await draftWithMyVoice({ platform: body.platform, topic: body.topic ?? body.niche });
  if (!result.ok) {
    const status = result.reason === "missing_key" ? 503 : result.reason === "not_ready" ? 400 : 502;
    return NextResponse.json({ error: result.message }, { status });
  }
  return NextResponse.json({ caption: result.draft.caption, hashtags: result.draft.hashtags, contentIdeas: result.draft.idea ? [result.draft.idea] : [], compliance: result.draft.compliance });
}
