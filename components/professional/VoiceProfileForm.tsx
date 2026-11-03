"use client";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { emptyVoiceProfile, voiceLanguages, voiceTones, type VoiceProfile } from "@/lib/cerebro/voice-profile";
import { draftPlatforms } from "@/lib/cerebro/prompt";
import { draftWithVoiceAction, saveVoiceProfileAction } from "@/app/(account)/panel-profesional/perfil/voice-actions";

type DraftView = Awaited<ReturnType<typeof draftWithVoiceAction>>;
const selectClass = "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2";
const areaClass = "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3";
const platformLabel: Record<(typeof draftPlatforms)[number], string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn" };
const statusLabel = { ok: "Sin observaciones del filtro", needs_review: "Revisa las observaciones antes de usarlo", blocked: "El filtro lo frena: corrígelo antes de usarlo" } as const;

export default function VoiceProfileForm({ initial }: { initial: VoiceProfile | null }) {
  const [fields, setFields] = useState<VoiceProfile>(initial ?? emptyVoiceProfile());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(Boolean(initial));
  const [platform, setPlatform] = useState<(typeof draftPlatforms)[number]>("instagram");
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState<DraftView | null>(null);

  function update<K extends keyof VoiceProfile>(key: K, value: VoiceProfile[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setMessage("");
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = { ...fields };
    startTransition(async () => {
      try {
        const result = await saveVoiceProfileAction(submitted);
        setMessage(result.message);
        setSaved(result.saved);
      } catch {
        setMessage("No pudimos conectar. Tus respuestas siguen aquí; vuelve a guardar.");
      }
    });
  }
  function tryDraft() {
    setDraft(null);
    startTransition(async () => {
      try {
        setDraft(await draftWithVoiceAction({ platform, topic }));
      } catch {
        setDraft({ ok: false, reason: "provider_error", message: "No pudimos conectar. Inténtalo de nuevo." });
      }
    });
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5" aria-labelledby="voice-heading">
        <div>
          <h2 id="voice-heading" className="text-lg font-bold text-[var(--brand-navy)]">Mi voz</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Así suena tu contenido. El cerebro de EVOLUSA usa esta voz en cada borrador que te propone. Todo sale como borrador: nada se publica sin tu aprobación.</p>
        </div>
        <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="voice-tone" label="Tono">
              <select id="voice-tone" value={fields.tone} onChange={(e) => update("tone", e.target.value as VoiceProfile["tone"])} className={selectClass}>
                {voiceTones.map((tone) => <option key={tone.id} value={tone.id}>{tone.label}</option>)}
              </select>
            </FormField>
            <FormField id="voice-language" label="Idioma">
              <select id="voice-language" value={fields.language} onChange={(e) => update("language", e.target.value as VoiceProfile["language"])} className={selectClass}>
                {voiceLanguages.map((language) => <option key={language.id} value={language.id}>{language.label}</option>)}
              </select>
            </FormField>
          </div>
          <FormField id="voice-personality" label="¿Cómo hablas con tus clientes?">
            <textarea id="voice-personality" required maxLength={300} rows={3} value={fields.personality} onChange={(e) => update("personality", e.target.value)} className={areaClass} placeholder="Ej.: directa y cálida, explico paso a paso sin tecnicismos" />
          </FormField>
          <FormField id="voice-use" label="Palabras o frases que sí usas" hint="Sepáralas con comas.">
            <Input id="voice-use" maxLength={300} value={fields.useWords} onChange={(e) => update("useWords", e.target.value)} />
          </FormField>
          <FormField id="voice-avoid" label="Palabras que nunca usas" hint="Sepáralas con comas.">
            <Input id="voice-avoid" maxLength={300} value={fields.avoidWords} onChange={(e) => update("avoidWords", e.target.value)} />
          </FormField>
          <FormField id="voice-cta" label="Tu llamado a la acción">
            <Input id="voice-cta" required maxLength={160} value={fields.cta} onChange={(e) => update("cta", e.target.value)} placeholder="Ej.: Escríbeme por mensaje directo para agendar" />
          </FormField>
          <FormField id="voice-disclaimer" label="Aviso obligatorio (si tu actividad lo exige)" hint="Se agrega completo al final de cada borrador. Déjalo vacío si no aplica.">
            <textarea id="voice-disclaimer" maxLength={500} rows={3} value={fields.disclaimer} onChange={(e) => update("disclaimer", e.target.value)} className={areaClass} />
          </FormField>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={fields.emojis} onChange={(e) => update("emojis", e.target.checked)} className="h-5 w-5" />
            Puede usar pocos emojis
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar mi voz"}</Button>
        </fieldset>
        {message && <p role="status" aria-live="polite" className={saved ? "text-sm font-semibold text-[var(--success)]" : "text-sm text-[var(--danger)]"}>{message}</p>}
      </form>

      {saved && (
        <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-6">
          <h3 className="font-bold text-[var(--brand-navy)]">Probar mi voz</h3>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <select aria-label="Red" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} className={selectClass}>
              {draftPlatforms.map((p) => <option key={p} value={p}>{platformLabel[p]}</option>)}
            </select>
            <Input aria-label="Tema del borrador" maxLength={300} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema, por ejemplo: qué preguntar antes de contratar" />
          </div>
          <Button type="button" variant="secondary" disabled={pending || !topic.trim()} onClick={tryDraft}>{pending ? "Generando…" : "Generar borrador de prueba"}</Button>
          {draft && !draft.ok && <p role="alert" className="text-sm text-[var(--danger)]">{draft.message}</p>}
          {draft && draft.ok && (
            <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4" aria-live="polite">
              <p className="whitespace-pre-line text-sm leading-6">{draft.draft.caption}</p>
              {draft.draft.hashtags.length > 0 && <p className="text-sm text-[var(--muted)]">{draft.draft.hashtags.map((tag) => `#${tag}`).join(" ")}</p>}
              {draft.draft.idea && <p className="text-sm"><span className="font-semibold">Idea visual:</span> {draft.draft.idea}</p>}
              <p className={draft.draft.compliance.status === "ok" ? "text-sm font-semibold text-[var(--success)]" : "text-sm font-semibold text-[var(--danger)]"}>{statusLabel[draft.draft.compliance.status]}</p>
              {draft.draft.compliance.issues.length > 0 && <ul className="list-disc pl-5 text-sm">{draft.draft.compliance.issues.map((issue) => <li key={issue.id}>{issue.message}</li>)}</ul>}
              <p className="text-xs text-[var(--muted)]">Es solo un borrador de prueba: no se guarda ni se publica.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
