import { INSTAGRAM_GRAPH_VERSION, PUBLIC_APP_URL } from "./instagram.ts";

/**
 * Publishing a planner post to the professional's own connected account.
 * Always started by the professional ("Publicar ahora"); nothing here runs on
 * a schedule or writes anything they didn't see in their planner.
 *
 * Errors are thrown as PublishError with a short Spanish message the planner
 * shows as is, so the professional knows what to fix.
 */

export type PublishProvider = "instagram" | "linkedin";
/** externalId is null only when the network accepted the post but returned no id. */
export type PublishResult = { externalId: string | null; permalink: string | null };

export class PublishError extends Error {
  readonly code: string;
  readonly userMessage: string;
  constructor(code: string, userMessage: string) {
    super(code);
    this.code = code;
    this.userMessage = userMessage;
  }
}

type Fetch = typeof fetch;
type Sleep = (ms: number) => Promise<void>;
const sleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const KIT_IMAGE = /^\/professionals\/kits\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpe?g|webp)$/;

/**
 * Where Instagram should download the image. Instagram only takes JPEG, so a
 * kit creative points at its .jpg twin (public/professionals/kits/*.jpg).
 * Pasted https links go through as is; Meta's servers fetch them, not ours.
 */
export function instagramImageUrl(imageUrl: string | null): string {
  if (!imageUrl) throw new PublishError("instagram_needs_image", "Instagram necesita una imagen. Elige un creativo o pega el enlace de una imagen JPG.");
  if (KIT_IMAGE.test(imageUrl)) {
    if (/-9x16\.[a-z]+$/.test(imageUrl)) {
      throw new PublishError("instagram_ratio", "Instagram no acepta imágenes 9:16 en el feed. Elige la versión 4:5 o 1:1 del creativo.");
    }
    return `${PUBLIC_APP_URL}${imageUrl.replace(/\.(png|jpe?g|webp)$/, ".jpg")}`;
  }
  if (imageUrl.startsWith("https://")) return imageUrl;
  throw new PublishError("instagram_image", "No reconocemos esa imagen. Elige un creativo o pega un enlace https.");
}

/** Kit creatives are the only images EVOLUSA downloads itself (for LinkedIn): no arbitrary URLs from our servers. */
export function linkedInImagePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (KIT_IMAGE.test(imageUrl)) return imageUrl.replace(/\.(png|jpe?g|webp)$/, ".jpg");
  throw new PublishError("linkedin_image", "Para LinkedIn usa uno de tus creativos o quita la imagen y publica solo el texto.");
}

// ---- Instagram (Instagram API with Instagram Login, content publishing) ----

const IG_GRAPH = `https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}`;

async function igCall(path: string, accessToken: string, fetchImpl: Fetch, init?: { body: Record<string, string> }) {
  const url = new URL(`${IG_GRAPH}${path}`);
  let request: RequestInit = { cache: "no-store" };
  if (init) {
    request = { method: "POST", body: new URLSearchParams({ ...init.body, access_token: accessToken }), cache: "no-store" };
  } else {
    url.searchParams.set("access_token", accessToken);
  }
  const response = await fetchImpl(url, request);
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.error) {
    const error = (data.error ?? {}) as { code?: unknown; error_subcode?: unknown };
    throw new PublishError(`instagram_${response.status}_${String(error.code ?? "")}_${String(error.error_subcode ?? "")}`, instagramMessage(error.code, error.error_subcode));
  }
  return data;
}

function instagramMessage(code: unknown, subcode: unknown): string {
  if (code === 190) return "Tu conexión con Instagram venció. Vuelve a conectarla en Redes.";
  if (code === 9 || code === 4 || subcode === 2207042) return "Instagram limita cuántas publicaciones se hacen por día. Intenta mañana.";
  if (subcode === 2207052 || subcode === 2207026 || subcode === 2207003) return "Instagram no pudo descargar la imagen. Usa una imagen JPG pública o uno de tus creativos.";
  if (subcode === 2207009 || subcode === 2207004) return "Instagram no aceptó el tamaño o la proporción de la imagen. Prueba la versión 4:5 o 1:1.";
  return "Instagram no aceptó la publicación. Revisa la imagen y el texto e intenta de nuevo.";
}

function idString(value: unknown): string | null {
  return typeof value === "string" && /^\d{1,64}$/.test(value) ? value : null;
}

/** Container → wait until Instagram has the image → publish → permalink. */
export async function publishToInstagram(
  accessToken: string,
  igUserId: string,
  post: { imageUrl: string; caption: string },
  options: { fetchImpl?: Fetch; wait?: Sleep } = {},
): Promise<PublishResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const wait = options.wait ?? sleep;
  if (!/^\d{1,64}$/.test(igUserId)) throw new PublishError("instagram_account", "Vuelve a conectar tu Instagram en Redes.");

  const container = idString((await igCall(`/${igUserId}/media`, accessToken, fetchImpl, { body: { image_url: post.imageUrl, caption: post.caption } })).id);
  if (!container) throw new PublishError("instagram_no_container", "Instagram no aceptó la publicación. Intenta de nuevo.");

  for (let attempt = 0; ; attempt += 1) {
    const status = (await igCall(`/${container}?fields=status_code`, accessToken, fetchImpl)).status_code;
    if (status === "FINISHED") break;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new PublishError(`instagram_container_${String(status).toLowerCase()}`, "Instagram no pudo procesar la imagen. Usa una imagen JPG 4:5 o 1:1.");
    }
    if (attempt >= 8) throw new PublishError("instagram_slow", "Instagram está tardando en procesar la imagen. Intenta de nuevo en unos minutos.");
    await wait(1500);
  }

  const mediaId = idString((await igCall(`/${igUserId}/media_publish`, accessToken, fetchImpl, { body: { creation_id: container } })).id);
  // Instagram answered OK, so the post is live; never retry it into a duplicate.
  if (!mediaId) return { externalId: null, permalink: null };

  // The post is live already; a missing permalink only means no "Ver" link.
  let permalink: string | null = null;
  try {
    const value = (await igCall(`/${mediaId}?fields=permalink`, accessToken, fetchImpl)).permalink;
    permalink = typeof value === "string" && /^https:\/\/(www\.)?instagram\.com\//.test(value) && value.length <= 2048 ? value : null;
  } catch {
    permalink = null;
  }
  return { externalId: mediaId, permalink };
}

// ---- LinkedIn (Posts API + Images API, member's own profile) ----

/** Monthly versions are supported about a year; bump before it is sunset. */
export const LINKEDIN_API_VERSION = "202608";

function linkedInHeaders(accessToken: string, json = true): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function linkedInFailure(status: number, step: string): PublishError {
  if (status === 401) return new PublishError(`linkedin_${step}_401`, "Tu conexión con LinkedIn venció. Vuelve a conectarla en Redes.");
  if (status === 403) return new PublishError(`linkedin_${step}_403`, "LinkedIn no dio permiso para publicar. Vuelve a conectar tu cuenta en Redes.");
  if (status === 429) return new PublishError(`linkedin_${step}_429`, "LinkedIn limita cuántas publicaciones se hacen por día. Intenta más tarde.");
  return new PublishError(`linkedin_${step}_${status}`, "LinkedIn no aceptó la publicación. Intenta de nuevo.");
}

/**
 * LinkedIn's post text ("little text") treats these characters as markup; an
 * unescaped "(" or "@" can cut the post short.
 */
export function escapeLinkedInText(text: string): string {
  return text.replace(/[\\|{}@[\]()<>#*_~]/g, (char) => `\\${char}`);
}

async function uploadLinkedInImage(accessToken: string, author: string, image: { bytes: ArrayBuffer; contentType: string }, fetchImpl: Fetch): Promise<string> {
  const init = await fetchImpl("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: linkedInHeaders(accessToken),
    body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
    cache: "no-store",
  });
  if (!init.ok) throw linkedInFailure(init.status, "image_init");
  const value = ((await init.json().catch(() => ({}))) as { value?: { uploadUrl?: unknown; image?: unknown } }).value ?? {};
  const uploadUrl = typeof value.uploadUrl === "string" && /^https:\/\/[a-z0-9.-]+\.linkedin\.com\//.test(value.uploadUrl) ? value.uploadUrl : null;
  const imageUrn = typeof value.image === "string" && /^urn:li:image:[A-Za-z0-9_-]{1,128}$/.test(value.image) ? value.image : null;
  if (!uploadUrl || !imageUrn) throw new PublishError("linkedin_image_init", "LinkedIn no aceptó la imagen. Intenta de nuevo o publica solo el texto.");

  const upload = await fetchImpl(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": image.contentType },
    body: image.bytes,
    cache: "no-store",
  });
  if (!upload.ok) throw linkedInFailure(upload.status, "image_upload");
  return imageUrn;
}

export async function publishToLinkedIn(
  accessToken: string,
  memberId: string,
  post: { text: string; image: { bytes: ArrayBuffer; contentType: string } | null; altText: string },
  fetchImpl: Fetch = fetch,
): Promise<PublishResult> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(memberId)) throw new PublishError("linkedin_account", "Vuelve a conectar tu LinkedIn en Redes.");
  const author = `urn:li:person:${memberId}`;
  const imageUrn = post.image ? await uploadLinkedInImage(accessToken, author, post.image, fetchImpl) : null;

  const response = await fetchImpl("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: linkedInHeaders(accessToken),
    body: JSON.stringify({
      author,
      commentary: escapeLinkedInText(post.text),
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      ...(imageUrn ? { content: { media: { id: imageUrn, altText: Array.from(post.altText).slice(0, 300).join("") } } } : {}),
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw linkedInFailure(response.status, "post");
  const urn = response.headers.get("x-restli-id") ?? response.headers.get("x-linkedin-id");
  const externalId = urn && /^urn:li:(share|ugcPost):\d{1,32}$/.test(urn) ? urn : null;
  // LinkedIn answered 201, so the post is live even without a usable id.
  if (!externalId) return { externalId: null, permalink: null };
  return { externalId, permalink: `https://www.linkedin.com/feed/update/${externalId}/` };
}
