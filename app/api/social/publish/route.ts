import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { socialConnectionOwner } from "@/lib/social/connections";
import { PUBLIC_APP_URL } from "@/lib/social/instagram";
import { readSocialTokenKey } from "@/lib/social/crypto";
import { PublishError } from "@/lib/social/publish";
import { publishPlannerPost } from "@/lib/social/publish-service";
import { markPlannerPostPublished, readSavedPlanner } from "@/lib/professional-planner/persistence";

export const maxDuration = 60;

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Date and time the post went out, as the professional reads it (Florida). */
function localStamp(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/**
 * "Publicar ahora" from the planner. The session decides whose planner and
 * whose connection are used; the body only names which saved post. What gets
 * published is what is saved in the planner, not what the browser sends.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || (origin !== new URL(request.url).origin && origin !== PUBLIC_APP_URL)) return reply(403, { message: "Solicitud no permitida." });

  const owner = await socialConnectionOwner();
  if (!owner) return reply(401, { message: "Inicia sesión con tu cuenta profesional." });

  const body = (await request.json().catch(() => null)) as { postId?: unknown } | null;
  const postId = typeof body?.postId === "string" && /^[a-z0-9-]{1,64}$/.test(body.postId) ? body.postId : null;
  if (!postId) return reply(400, { message: "Publicación no válida." });

  const tokenKey = readSocialTokenKey();
  const service = createSupabaseServiceRoleClient();
  if (!tokenKey || !service) return reply(503, { message: "La publicación todavía no está activada." });

  try {
    const planner = await readSavedPlanner(owner.db, owner.user.id);
    const post = planner?.posts.find((item) => item.id === postId);
    if (!post) return reply(404, { message: "Guarda la publicación en tu planner antes de publicarla." });

    const result = await publishPlannerPost(service, tokenKey, owner.user.id, post);
    const updated = await markPlannerPostPublished(owner.db, owner.user.id, post.id, localStamp(new Date()));
    return reply(200, {
      provider: result.provider,
      permalink: result.permalink,
      post: updated,
      message: updated ? "¡Publicada! Ya está en tu cuenta." : "¡Publicada! Márcala como publicada en tu planner.",
    });
  } catch (error) {
    if (error instanceof PublishError) {
      console.error("social_publish_failed", error.code);
      return reply(422, { message: error.userMessage });
    }
    console.error("social_publish_failed", error instanceof Error ? error.message : "unknown");
    return reply(500, { message: "No pudimos publicar. Intenta de nuevo en unos minutos." });
  }
}
