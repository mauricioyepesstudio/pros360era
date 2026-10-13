import sharp from "sharp";

export const plannerImageBucket = "planner-images";
export const plannerImageMaxBytes = 4 * 1024 * 1024;
export const plannerImageMaxObjects = 200;

/** Stream-bound the entire multipart body before parsing; Content-Length is not trusted. */
export async function readPlannerImageForm(request: Request): Promise<FormData> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("missing body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > plannerImageMaxBytes) { await reader.cancel(); throw new Error("too large"); }
    chunks.push(value);
  }
  const body = Buffer.concat(chunks);
  return new Response(body, { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
}

/** Decode supported rasters, strip metadata and normalize to public-social-compatible JPEG. */
export async function normalizePlannerImage(file: File): Promise<Buffer> {
  if (!file.size || file.size >= plannerImageMaxBytes || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("invalid image");
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { limitInputPixels: 25_000_000, animated: false });
  const metadata = await image.metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || !metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) throw new Error("invalid image");
  const output = await image.rotate().resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
  if (output.length > plannerImageMaxBytes) throw new Error("too large");
  return output;
}

export type UploadDependencies = {
  owner: () => Promise<string | null>;
  store: (ownerId: string, image: Buffer) => Promise<string | null>;
};

/** Shared request contract is exercised without real sessions or storage in tests. */
export async function handlePlannerImageUpload(request: Request, dependencies: UploadDependencies): Promise<Response> {
  const reply = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Vuelve a abrir el planner e intenta de nuevo.", 403);
  const ownerId = await dependencies.owner();
  if (!ownerId) return reply("Necesitas entrar con tu cuenta profesional.", 401);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) return reply("Selecciona una imagen JPG, PNG o WebP.", 400);
  try {
    const form = await readPlannerImageForm(request);
    if (form.get("publicImageConsent") !== "true") return reply("Confirma que la imagen es para publicación pública.", 400);
    const file = form.get("image");
    if (!(file instanceof File)) return reply("Selecciona una imagen.", 400);
    const image = await normalizePlannerImage(file);
    const url = await dependencies.store(ownerId, image);
    return url ? Response.json({ imageUrl: url }, { headers: { "Cache-Control": "private, no-store" } }) : reply("No pudimos guardar la imagen o llegaste al límite de 200 imágenes. La imagen anterior sigue intacta.", 503);
  } catch {
    return reply("No pudimos subirla. Usa JPG, PNG o WebP de menos de 4 MB; tus cambios siguen intactos.", 400);
  }
}
