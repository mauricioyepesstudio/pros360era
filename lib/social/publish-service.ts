import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlannerPost } from "@/lib/professional-planner/validation";
import { decryptToken } from "@/lib/social/crypto";
import { tokenBinding } from "@/lib/social/connections";
import { PUBLIC_APP_URL } from "@/lib/social/instagram";
import {
  instagramImageUrl,
  linkedInImagePath,
  PublishError,
  publishToInstagram,
  publishToLinkedIn,
  type PublishProvider,
  type PublishResult,
} from "@/lib/social/publish";

/**
 * Service-role side of "Publicar ahora". The route has already checked that
 * the session is a professional and read the post from their own planner;
 * this only reads their own connection and records the attempt. Never import
 * this into a page or server action.
 */

/** A PUBLISHING row older than this is treated as a crashed attempt and may be retried. */
export const STALE_PUBLISHING_MS = 15 * 60 * 1000;
const LINKEDIN_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

const REQUIRED_SCOPE: Record<PublishProvider, string> = {
  instagram: "instagram_business_content_publish",
  linkedin: "w_member_social",
};

export function publishProviderFor(post: PlannerPost): PublishProvider | null {
  return post.platform === "instagram" || post.platform === "linkedin" ? post.platform : null;
}

type ConnectionRow = { id: string; provider_account_id: string; token_ciphertext: string | null; token_expires_at: string | null; scopes: string[] | null };

async function activeConnection(service: SupabaseClient, userId: string, provider: PublishProvider, now: Date): Promise<ConnectionRow> {
  const { data, error } = await service
    .from("social_connections")
    .select("id, provider_account_id, token_ciphertext, token_expires_at, scopes")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (error) throw new Error("social_storage_unavailable");
  const name = provider === "instagram" ? "Instagram" : "LinkedIn";
  const row = data as ConnectionRow | null;
  if (!row || !row.token_ciphertext || (row.token_expires_at && Date.parse(row.token_expires_at) <= now.getTime())) {
    throw new PublishError(`${provider}_not_connected`, `Conecta tu ${name} en Redes para publicar desde aquí.`);
  }
  if (!(row.scopes ?? []).includes(REQUIRED_SCOPE[provider])) {
    throw new PublishError(`${provider}_scope`, `Tu conexión con ${name} no tiene permiso para publicar. Desconéctala y vuelve a conectarla en Redes.`);
  }
  return row;
}

/**
 * Takes this post's turn on this network. The unique key makes a double click
 * (or two tabs) lose here instead of posting twice. A failed attempt, or one
 * stuck far longer than any publish takes, can be retried.
 */
async function claim(service: SupabaseClient, userId: string, connectionId: string, provider: PublishProvider, postId: string, now: Date) {
  const stamp = now.toISOString();
  const { error } = await service
    .from("social_publications")
    .insert({ user_id: userId, connection_id: connectionId, provider, planner_post_id: postId, status: "PUBLISHING", attempted_at: stamp });
  if (!error) return;
  if (error.code !== "23505") throw new Error("social_storage_unavailable");

  const stale = new Date(now.getTime() - STALE_PUBLISHING_MS).toISOString();
  const { data, error: retryError } = await service
    .from("social_publications")
    .update({ status: "PUBLISHING", connection_id: connectionId, attempted_at: stamp, error_code: null })
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("planner_post_id", postId)
    .or(`status.eq.FAILED,and(status.eq.PUBLISHING,attempted_at.lt."${stale}")`)
    .select("id");
  if (retryError) throw new Error("social_storage_unavailable");
  if (data?.length) return;

  const { data: existing } = await service
    .from("social_publications")
    .select("status")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("planner_post_id", postId)
    .maybeSingle();
  throw existing?.status === "PUBLISHED"
    ? new PublishError("already_published", "Esta publicación ya salió en esa red.")
    : new PublishError("in_progress", "Esta publicación se está enviando. Espera un momento y recarga la página.");
}

async function finish(service: SupabaseClient, userId: string, provider: PublishProvider, postId: string, update: Record<string, unknown>) {
  const { error } = await service
    .from("social_publications")
    .update(update)
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("planner_post_id", postId)
    .eq("status", "PUBLISHING");
  if (error) console.error("social_publication_record_failed", provider);
}

async function kitImage(path: string, fetchImpl: typeof fetch) {
  const response = await fetchImpl(`${PUBLIC_APP_URL}${path}`, { cache: "no-store", redirect: "error" });
  const length = Number(response.headers.get("content-length") ?? "0");
  if (!response.ok || length > LINKEDIN_IMAGE_MAX_BYTES) throw new PublishError("linkedin_image_fetch", "No pudimos preparar la imagen. Intenta de nuevo o publica solo el texto.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > LINKEDIN_IMAGE_MAX_BYTES) throw new PublishError("linkedin_image_fetch", "No pudimos preparar la imagen. Intenta de nuevo o publica solo el texto.");
  return { bytes, contentType: "image/jpeg" };
}

export async function publishPlannerPost(
  service: SupabaseClient,
  tokenKey: Buffer,
  userId: string,
  post: PlannerPost,
  options: { fetchImpl?: typeof fetch; now?: Date } = {},
): Promise<{ provider: PublishProvider } & PublishResult> {
  const now = options.now ?? new Date();
  const fetchImpl = options.fetchImpl ?? fetch;
  const provider = publishProviderFor(post);
  if (!provider) throw new PublishError("unsupported_platform", "Por ahora solo publicamos en Instagram y LinkedIn. Para otras redes, copia el texto y publícalo desde tu app.");
  if (post.status === "PUBLISHED") throw new PublishError("already_published", "Esta publicación ya está marcada como publicada.");
  const caption = post.caption.trim();
  if (provider === "linkedin" && !caption) throw new PublishError("linkedin_needs_text", "Escribe el texto de la publicación antes de publicarla en LinkedIn.");

  // Everything that can be checked without touching the network goes before the claim.
  const igImage = provider === "instagram" ? instagramImageUrl(post.imageUrl) : null;
  const liImage = provider === "linkedin" ? linkedInImagePath(post.imageUrl) : null;
  const connection = await activeConnection(service, userId, provider, now);
  const token = decryptToken(connection.token_ciphertext ?? "", tokenKey, tokenBinding(provider, connection.provider_account_id));
  if (!token) throw new PublishError(`${provider}_token`, "Vuelve a conectar tu cuenta en Redes para publicar.");

  await claim(service, userId, connection.id, provider, post.id, now);
  try {
    const result =
      provider === "instagram"
        ? await publishToInstagram(token, connection.provider_account_id, { imageUrl: igImage!, caption }, { fetchImpl })
        : await publishToLinkedIn(token, connection.provider_account_id, { text: caption, image: liImage ? await kitImage(liImage, fetchImpl) : null, altText: post.title }, fetchImpl);
    await finish(service, userId, provider, post.id, { status: "PUBLISHED", external_id: result.externalId, permalink: result.permalink, published_at: new Date().toISOString() });
    return { provider, ...result };
  } catch (error) {
    const code = error instanceof PublishError ? error.code : "unexpected";
    await finish(service, userId, provider, post.id, { status: "FAILED", error_code: code.slice(0, 200) });
    throw error;
  }
}
