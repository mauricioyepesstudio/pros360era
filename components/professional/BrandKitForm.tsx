"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { brandKitMaxColors, brandKitMaxImages, emptyBrandKit, normalizeHexColor, type BrandKit } from "@/lib/cerebro/brand-kit";
import { proposeBrandKitAction, saveBrandKitAction } from "@/app/(account)/panel-profesional/marca/actions";

type Proposal = Extract<Awaited<ReturnType<typeof proposeBrandKitAction>>, { ok: true }>["proposal"];
const areaClass = "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3";
const socialLabel = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", tiktok: "TikTok", youtube: "YouTube", x: "X" } as const;

export default function BrandKitForm({ initial, websiteUrl, ownerName }: { initial: BrandKit | null; websiteUrl: string | null; ownerName: string }) {
  // Por defecto el encargado es el propio profesional: cada perfil revisa y aprueba lo suyo.
  const [fields, setFields] = useState<BrandKit>(initial ?? { ...emptyBrandKit(), manager: ownerName.slice(0, 120) });
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const [pending, startTransition] = useTransition();
  const [site, setSite] = useState(websiteUrl ?? "");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposalError, setProposalError] = useState("");
  const [newColor, setNewColor] = useState("#1f3a8a");
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof BrandKit>(key: K, value: BrandKit[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setMessage("");
    setMessageOk(false);
  }

  function generateFromAccounts() {
    setProposal(null);
    setProposalError("");
    startTransition(async () => {
      try {
        const result = await proposeBrandKitAction({ websiteUrl: site });
        if (!result.ok) { setProposalError(result.message); return; }
        setProposal(result.proposal);
        // Rellena solo lo que está vacío: nunca pisa lo que la persona ya escribió.
        setFields((current) => ({
          ...current,
          colors: current.colors.length ? current.colors : result.proposal.colors,
          fonts: current.fonts || result.proposal.fonts,
          about: current.about || result.proposal.about.slice(0, 600),
        }));
      } catch {
        setProposalError("No pudimos leer tus cuentas ahora. Inténtalo de nuevo.");
      }
    });
  }

  const missing = [
    !fields.colors.length && "al menos un color",
    !fields.manager.trim() && "el encargado de tu marca",
    fields.imageUrls.length > 0 && !fields.imagesConsent && "confirmar el permiso de las imágenes (para quitar el permiso, primero quita las imágenes)",
  ].filter(Boolean) as string[];

  function addColor(value: string) {
    const color = normalizeHexColor(value);
    if (!color || fields.colors.includes(color) || fields.colors.length >= brandKitMaxColors) return;
    update("colors", [...fields.colors, color]);
  }

  async function upload(file: File) {
    if (!fields.imagesConsent) { setMessage("Primero confirma que tienes permiso para usar estas imágenes y que quedarán en un enlace público."); return; }
    if (fields.imageUrls.length >= brandKitMaxImages) { setMessage(`Tu brandbook admite hasta ${brandKitMaxImages} imágenes.`); return; }
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("publicImageConsent", "true");
      const response = await fetch("/api/professional/planner/image", { method: "POST", body: form });
      const result = (await response.json()) as { imageUrl?: string; error?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.error || "No pudimos subir la imagen.");
      update("imageUrls", [...fields.imageUrls, result.imageUrl]);
      setMessageOk(true);
      setMessage("Imagen añadida. Guarda el brandbook para que aparezca en tu planner.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = { ...fields };
    startTransition(async () => {
      try {
        const result = await saveBrandKitAction(submitted);
        setMessage(result.message);
        setMessageOk(result.saved);
      } catch {
        setMessage("No pudimos conectar. Tus cambios siguen aquí; vuelve a guardar.");
      }
    });
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 id="brandbook-heading" className="text-lg font-bold text-[var(--brand-navy)]">Mi brandbook</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Los colores, letras e imágenes de tu marca. La IA los usa como guía para proponerte piezas con tu línea gráfica. Revisa siempre cada pieza antes de usarla.</p>
        </div>

        <section aria-labelledby="from-accounts" className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--sky-surface)] p-4">
          <h3 id="from-accounts" className="font-bold text-[var(--brand-navy)]">Empezar desde mis cuentas</h3>
          <p className="text-sm leading-6">Leemos tu web pública y, si conectaste Instagram, el color de tus publicaciones, solo para sugerirte un borrador de colores, tipografías y descripción. Tú lo ajustas y lo apruebas al guardar; nadie más lo aprueba por ti y no guardamos nada antes. Más detalles en la <Link href="/privacidad" className="font-semibold underline">política de privacidad</Link>.</p>
          <FormField id="brand-site" label="Tu web" hint="Usa la web de tu propio negocio. Si la dejas vacía usamos la de «Mi perfil».">
            <Input id="brand-site" inputMode="url" maxLength={500} value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://tunegocio.com" />
          </FormField>
          <Button type="button" variant="secondary" disabled={pending} onClick={generateFromAccounts}>{pending ? "Leyendo tus cuentas…" : "Generar borrador desde mis cuentas"}</Button>
          <div role="alert" className="text-sm text-[var(--danger)]">{proposalError}</div>
          {proposal && (
            <div aria-live="polite" className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 text-sm">
              <p className="font-semibold">Esto leímos:</p>
              <ul className="list-disc space-y-1 pl-5">
                {proposal.sources.map((source) => <li key={source}>{source}</li>)}
                {proposal.website?.name && <li>Nombre en tu web: {proposal.website.name}</li>}
                {proposal.website?.socials.map((social) => <li key={social.url}>{socialLabel[social.platform]} enlazado en tu web: {social.url}</li>)}
              </ul>
              {proposal.websiteError && <p className="text-[var(--danger)]">{proposal.websiteError}</p>}
              <p className="text-[var(--muted)]">Completamos los campos vacíos de abajo con lo que dice tu web. Revísalos: si hay cifras, promesas o la palabra «verificado», quítalas.</p>
            </div>
          )}
        </section>

        <form onSubmit={submit} className="space-y-5" aria-labelledby="brandbook-heading">
          <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
            <FormField id="brand-colors" label="Colores de marca" hint={`El primero es el principal. Hasta ${brandKitMaxColors}.`} required>
              <div className="flex flex-wrap items-center gap-2">
                {fields.colors.map((color, index) => (
                  <span key={color} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white py-1 pl-1 pr-1 text-sm">
                    <span aria-hidden className="size-8 rounded-full border border-[var(--border)]" style={{ background: color }} />
                    {color}{index === 0 && " · principal"}
                    <button type="button" aria-label={`Quitar ${color}`} onClick={() => update("colors", fields.colors.filter((c) => c !== color))} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-[var(--sky-surface)]"><Trash2 aria-hidden size={14} /></button>
                  </span>
                ))}
                {fields.colors.length < brandKitMaxColors && (
                  <span className="inline-flex items-center gap-2">
                    <input id="brand-colors" type="color" aria-label="Elegir un color nuevo" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="size-11 cursor-pointer rounded-full border border-[var(--border)]" />
                    <Button type="button" variant="secondary" onClick={() => addColor(newColor)}>Añadir color</Button>
                  </span>
                )}
              </div>
            </FormField>
            <FormField id="brand-fonts" label="Tipografías" hint="Ej.: Poppins para títulos, Inter para textos.">
              <Input id="brand-fonts" maxLength={200} value={fields.fonts} onChange={(e) => update("fonts", e.target.value)} />
            </FormField>
            <FormField id="brand-about" label="De qué trata tu marca">
              <textarea id="brand-about" maxLength={600} rows={3} value={fields.about} onChange={(e) => update("about", e.target.value)} className={areaClass} />
            </FormField>
            <FormField id="brand-rules" label="Reglas visuales" hint="Qué sí y qué no: fotos reales o ilustración, fondo claro u oscuro, logo siempre visible…">
              <textarea id="brand-rules" maxLength={600} rows={3} value={fields.visualRules} onChange={(e) => update("visualRules", e.target.value)} className={areaClass} />
            </FormField>

            <div className="space-y-3">
              <p className="font-semibold text-[var(--brand-navy)]">Imágenes de tu brandbook</p>
              <p className="text-sm text-[var(--muted)]">Solo tu logo, fotos tuyas y de tu negocio, y piezas propias o con licencia. No subas fotos de clientes, familiares u otras personas, diseños de otras marcas ni documentos privados (identificaciones, contratos, formularios, datos de clientes). Cada imagen queda en un enlace público para poder usarla en tus publicaciones del planner. Hasta {brandKitMaxImages}.</p>
              <label className="flex min-h-11 items-start gap-3 text-sm">
                <input type="checkbox" checked={fields.imagesConsent} onChange={(e) => update("imagesConsent", e.target.checked)} className="mt-0.5 h-5 w-5" />
                Confirmo que soy dueño de estas imágenes o tengo licencia para usarlas en publicaciones públicas, que solo muestran mi logo, a mí o mi negocio (sin clientes, familiares ni otras personas), y que cada imagen subida queda en un enlace público.
              </label>
              {fields.imageUrls.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {fields.imageUrls.map((url, index) => (
                    <li key={url} className="relative">
                      <Image unoptimized src={url} alt={`Imagen ${index + 1} del brandbook`} width={300} height={300} className="aspect-square w-full rounded-[var(--radius-md)] border border-[var(--border)] object-cover" />
                      <button type="button" aria-label={`Quitar imagen ${index + 1}`} onClick={() => update("imageUrls", fields.imageUrls.filter((u) => u !== url))} className="absolute right-0 top-0 inline-flex size-11 items-center justify-center rounded-full bg-white shadow"><Trash2 aria-hidden size={14} /></button>
                    </li>
                  ))}
                </ul>
              )}
              {fields.imageUrls.length < brandKitMaxImages && (
                <div className="space-y-1">
                  <label aria-disabled={!fields.imagesConsent || uploading} className={`inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-blue)] ${fields.imagesConsent && !uploading ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                    {uploading ? "Subiendo…" : "Subir imagen (JPG, PNG o WebP, menos de 4 MB)"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading || !fields.imagesConsent} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(file); }} />
                  </label>
                  {!fields.imagesConsent && <p className="text-sm text-[var(--muted)]">Marca la casilla de arriba para subir imágenes.</p>}
                </div>
              )}
            </div>

            <FormField id="brand-manager" label="Encargado de tu marca" hint="Quien hace el branding y el community management de este perfil y aprueba cada pieza antes de publicarse. Por defecto eres tú; cámbialo solo si alguien de tu equipo lo hace por ti." required>
              <Input id="brand-manager" required maxLength={120} value={fields.manager} onChange={(e) => update("manager", e.target.value)} placeholder="Nombre de la persona" />
            </FormField>
            {missing.length > 0 && <p id="brand-missing" className="text-sm text-[var(--muted)]">Para guardar falta: {missing.join(", ")}.</p>}
            <Button type="submit" aria-describedby={missing.length ? "brand-missing" : undefined} disabled={pending || uploading || missing.length > 0}>{pending ? "Guardando…" : "Guardar mi brandbook"}</Button>
          </fieldset>
          <div role="status" aria-live="polite" className="text-sm font-semibold text-[var(--success-text)]">{messageOk ? message : ""}</div>
          <div role="alert" className="text-sm text-[var(--danger)]">{!messageOk ? message : ""}</div>
        </form>
      </div>
    </Card>
  );
}
