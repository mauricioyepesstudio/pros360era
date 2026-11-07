import { PUBLIC_APP_URL } from "./instagram.ts";

export const LINKEDIN_PUBLISH_SCOPE = "w_member_social";
const api = "https://api.linkedin.com/rest";
const version = "202607";
const maxBytes = 64 * 1024 * 1024;
export type LinkedInPublication = { caption: string; title: string; mediaUrl: string | null; kind: "TEXT" | "IMAGE" | "VIDEO" };
export class LinkedInPublishError extends Error {
  readonly publicationUncertain: boolean;
  constructor(message: string, uncertain = false) { super(message); this.publicationUncertain = uncertain; }
}

/** Downloads are restricted to this deployment's public media; never fetch arbitrary planner URLs server-side. */
export function linkedInMediaUrl(raw: string): URL {
  const url = new URL(raw, PUBLIC_APP_URL);
  if (url.origin !== PUBLIC_APP_URL || url.username || url.password || !/^\/(videos\/[a-z0-9-]+\.mp4|professionals\/kits\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpe?g|webp))$/.test(url.pathname) || url.search || url.hash) {
    throw new LinkedInPublishError("LinkedIn necesita un archivo público del kit o un video alojado en EvolUSA.");
  }
  return url;
}
function uploadUrl(raw: unknown): string {
  if (typeof raw !== "string") throw new LinkedInPublishError("LinkedIn no devolvió una dirección de carga válida.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || !(url.hostname === "www.linkedin.com" || url.hostname.endsWith(".linkedin.com"))) throw new LinkedInPublishError("LinkedIn devolvió una dirección de carga no permitida.");
  return url.href;
}

/** No automatic retry after creating a post: an interrupted response may already have published it. */
export async function publishLinkedInPost(accountId: string, token: string, post: LinkedInPublication, fetchImpl: typeof fetch = fetch, wait: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)), options: { deadline?: number; now?: () => number } = {}): Promise<{ mediaId: string; permalink: string }> {
  const now = options.now ?? Date.now;
  const deadline = options.deadline ?? now() + 220_000;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(accountId)) throw new LinkedInPublishError("La cuenta de LinkedIn no es válida.");
  const headers = { Authorization: `Bearer ${token}`, "Linkedin-Version": version, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" };
  const request = async (url: string, init: RequestInit, publishing = false) => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new LinkedInPublishError("LinkedIn agotó el tiempo de procesamiento.");
    try {
      const response = await fetchImpl(url, { ...init, redirect: "error", signal: AbortSignal.timeout(Math.min(30_000, remaining)), cache: "no-store" });
      if (!response.ok) throw new LinkedInPublishError(response.status === 401 || response.status === 403 ? "Revisa la conexión y los permisos de LinkedIn." : "LinkedIn rechazó la publicación o el archivo.");
      return response;
    } catch (error) {
      if (error instanceof LinkedInPublishError) throw error;
      throw new LinkedInPublishError(publishing ? "No sabemos si salió en LinkedIn. Revisa la red antes de programarla otra vez." : "LinkedIn no respondió durante la preparación del archivo.", publishing);
    }
  };
  const json = async (url: string, body: unknown) => (await request(url, { method: "POST", headers, body: JSON.stringify(body) })).json();
  const owner = `urn:li:person:${accountId}`;
  let asset: string | null = null;
  if (post.kind !== "TEXT") {
    if (!post.mediaUrl) throw new LinkedInPublishError("Falta el archivo para LinkedIn.");
    const source = linkedInMediaUrl(post.mediaUrl);
    const response = await request(source.href, {});
    const length = Number(response.headers.get("content-length"));
    if (length > maxBytes) { await response.body?.cancel(); throw new LinkedInPublishError("El archivo supera el límite de carga de EvolUSA de 64 MB."); }
    const reader = response.body?.getReader();
    if (!reader) throw new LinkedInPublishError("El archivo está vacío.");
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > maxBytes) throw new LinkedInPublishError("El archivo supera el límite de carga de EvolUSA de 64 MB.");
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    if (!size) throw new LinkedInPublishError("El archivo está vacío.");
    const bytes = Buffer.concat(chunks);
    if (post.kind === "VIDEO") {
      const data = await json(`${api}/videos?action=initializeUpload`, { initializeUploadRequest: { owner, fileSizeBytes: size, uploadCaptions: false, uploadThumbnail: false } });
      const value = data.value;
      if (!value || typeof value.video !== "string" || !/^urn:li:video:[A-Za-z0-9_-]+$/.test(value.video) || !Array.isArray(value.uploadInstructions) || !value.uploadInstructions.length || typeof value.uploadToken !== "string") throw new LinkedInPublishError("LinkedIn no pudo preparar el video.");
      asset = value.video;
      const ids: string[] = []; let next = 0;
      for (const part of value.uploadInstructions) {
        if (!Number.isInteger(part.firstByte) || !Number.isInteger(part.lastByte) || part.firstByte !== next || part.lastByte < next || part.lastByte >= size) throw new LinkedInPublishError("LinkedIn devolvió partes de video inválidas.");
        const uploaded = await request(uploadUrl(part.uploadUrl), { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: bytes.subarray(part.firstByte, part.lastByte + 1) });
        const etag = uploaded.headers.get("etag")?.replace(/^"|"$/g, "");
        if (!etag) throw new LinkedInPublishError("LinkedIn no confirmó la carga del video.");
        ids.push(etag); next = part.lastByte + 1;
      }
      if (next !== size) throw new LinkedInPublishError("La carga del video quedó incompleta.");
      await json(`${api}/videos?action=finalizeUpload`, { finalizeUploadRequest: { video: asset, uploadToken: value.uploadToken, uploadedPartIds: ids } });
      let available = false;
      while (deadline - now() > 15_000) {
        const status = await (await request(`${api}/videos/${encodeURIComponent(asset!)}`, { headers })).json();
        if (status.status === "AVAILABLE") { available = true; break; }
        if (status.status === "PROCESSING_FAILED") throw new LinkedInPublishError("LinkedIn no pudo procesar el video.");
        await wait(5_000);
      }
      if (!available) throw new LinkedInPublishError("LinkedIn sigue procesando el video. No se creó la publicación.");
    } else {
      const data = await json(`${api}/images?action=initializeUpload`, { initializeUploadRequest: { owner } });
      if (typeof data.value?.image !== "string" || !/^urn:li:image:[A-Za-z0-9_-]+$/.test(data.value.image)) throw new LinkedInPublishError("LinkedIn no pudo preparar la imagen.");
      asset = data.value.image;
      await request(uploadUrl(data.value.uploadUrl), { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": response.headers.get("content-type") ?? "application/octet-stream" }, body: bytes });
    }
  }
  if (post.kind === "TEXT" && !post.caption.trim()) throw new LinkedInPublishError("La publicación no tiene texto.");
  const body = { author: owner, commentary: post.caption, visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false, ...(asset ? { content: { media: { id: asset, title: post.title } } } : {}) };
  const published = await request(`${api}/posts`, { method: "POST", headers, body: JSON.stringify(body) }, true);
  const id = published.headers.get("x-restli-id");
  if (!id || !/^urn:li:(share|ugcPost):\d+$/.test(id)) throw new LinkedInPublishError("LinkedIn aceptó el envío sin devolver su identificador. Revisa la red antes de reprogramar.", true);
  return { mediaId: id, permalink: `https://www.linkedin.com/feed/update/${encodeURIComponent(id)}/` };
}
