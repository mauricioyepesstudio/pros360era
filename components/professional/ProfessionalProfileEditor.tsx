"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RadioGroup from "@/components/ui/RadioGroup";
import { updateMyProfessionalProfileAction } from "@/app/(account)/actions";
import { getProfessionalCategory } from "@/data/professional/categories";
import { consultationModeOptions } from "@/data/opportunities/copy";
import type { ConsultationMode, ProfessionalProfileSelf, ProfessionalSocialLinks } from "@/data/professional/types";

// Presentation-only — same local map ProfessionalProfileView.tsx keeps for
// the identical reason: this doesn't gate anything, so it isn't a new
// data/ catalog for one field.
const languageOptions: { code: string; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "Inglés" },
  { code: "pt", label: "Portugués" },
  { code: "fr", label: "Francés" },
];

type SocialKey = keyof ProfessionalSocialLinks;
const socialFields: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-usuario" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/tu-usuario" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tu-pagina" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tu-usuario" },
];

/** null/undefined-safe: the form always works with "" for an empty text field, converted back to null only when saving. */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function ProfessionalProfileEditor({ profile }: { profile: ProfessionalProfileSelf }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [state, setState] = useState(profile.state ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [languages, setLanguages] = useState<string[]>([...profile.languages]);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>(profile.consultationMode);
  const [isAcceptingClients, setIsAcceptingClients] = useState(profile.isAcceptingClients);
  const [bookingUrl, setBookingUrl] = useState(profile.bookingUrl ?? "");
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl ?? "");
  const [socialLinks, setSocialLinks] = useState<ProfessionalSocialLinks>({ ...profile.socialLinks });

  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const category = getProfessionalCategory(profile.category);

  function toggleLanguage(code: string) {
    setLanguages((current) => (current.includes(code) ? current.filter((value) => value !== code) : [...current, code]));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await updateMyProfessionalProfileAction({
        displayName,
        headline: orNull(headline),
        bio: orNull(bio),
        state: orNull(state),
        city: orNull(city),
        languages,
        consultationMode,
        isAcceptingClients,
        bookingUrl: orNull(bookingUrl),
        photoUrl: orNull(photoUrl),
        portfolioUrl: orNull(portfolioUrl),
        websiteUrl: orNull(websiteUrl),
        socialLinks: {
          instagram: orNull(socialLinks.instagram ?? "") ?? undefined,
          linkedin: orNull(socialLinks.linkedin ?? "") ?? undefined,
          facebook: orNull(socialLinks.facebook ?? "") ?? undefined,
          tiktok: orNull(socialLinks.tiktok ?? "") ?? undefined,
        },
      });
      setFeedback(
        result.saved
          ? { kind: "success", message: "Tu perfil se guardó correctamente." }
          : { kind: "error", message: "No pudimos guardar los cambios. Intenta de nuevo en unos minutos." },
      );
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Estado de tu perfil</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Estos campos los controla el equipo de EVOLUSA y no se pueden editar aquí.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Categoría</dt>
            <dd className="mt-1 font-semibold text-[var(--brand-navy)]">{category?.label ?? profile.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Visibilidad pública</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-[var(--brand-navy)]">
              {profile.isApproved ? (
                <>
                  <CheckCircle2 aria-hidden size={16} className="text-[var(--success)]" /> Perfil público aprobado
                </>
              ) : (
                <>
                  <Clock3 aria-hidden size={16} className="text-[var(--muted)]" /> Pendiente de revisión
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Identidad verificada</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-[var(--brand-navy)]">
              {profile.identityVerified ? (
                <>
                  <CheckCircle2 aria-hidden size={16} className="text-[var(--success)]" /> Verificada
                </>
              ) : (
                "Todavía no verificada"
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Información básica</h2>
        <FormField id="display-name" label="Nombre para mostrar" required>
          <Input id="display-name" required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </FormField>
        <FormField id="headline" label="Titular" hint="Una línea breve que describe lo que ofreces.">
          <Input id="headline" maxLength={140} value={headline} onChange={(event) => setHeadline(event.target.value)} />
        </FormField>
        <FormField id="bio" label="Sobre ti" hint="Se muestra en tu perfil público una vez aprobado.">
          <Textarea id="bio" maxLength={2000} value={bio} onChange={(event) => setBio(event.target.value)} />
        </FormField>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField id="state" label="Estado">
            <Input id="state" maxLength={60} value={state} onChange={(event) => setState(event.target.value)} placeholder="Ej. FL" />
          </FormField>
          <FormField id="city" label="Ciudad">
            <Input id="city" maxLength={100} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ej. Miami" />
          </FormField>
        </div>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Idiomas y disponibilidad</h2>
        <fieldset className="space-y-3">
          <legend className="mb-1 font-semibold text-[var(--brand-navy)]">Idiomas en los que atiendes</legend>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((option) => {
              const active = languages.includes(option.code);
              return (
                <button
                  key={option.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleLanguage(option.code)}
                  className={
                    active
                      ? "inline-flex min-h-11 items-center rounded-full border border-[var(--brand-blue)] bg-[var(--brand-navy)] px-4 text-sm font-semibold text-white"
                      : "inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)]"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <RadioGroup
          legend="¿Cómo ofreces tus consultas?"
          name="consultation-mode"
          options={consultationModeOptions}
          value={consultationMode}
          onChange={(event) => setConsultationMode(event.target.value as ConsultationMode)}
        />

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--sky-surface)]">
          <input
            type="checkbox"
            className="size-4 accent-[var(--brand-blue)]"
            checked={isAcceptingClients}
            onChange={(event) => setIsAcceptingClients(event.target.checked)}
          />
          <span className="font-semibold text-[var(--brand-navy)]">Estoy aceptando nuevos clientes ahora mismo</span>
        </label>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Enlaces y agenda</h2>
        <FormField id="booking-url" label="Enlace para agendar" hint="Por ejemplo, tu link de Cal.com. Se muestra solo a miembros ya emparejados contigo.">
          <Input id="booking-url" type="url" value={bookingUrl} onChange={(event) => setBookingUrl(event.target.value)} placeholder="https://cal.com/tu-usuario" />
        </FormField>
        <FormField id="photo-url" label="Foto de perfil (URL)" hint="Debe ser una foto real tuya. Si la dejas vacía, se muestra el isotipo de EVOLUSA.">
          <Input id="photo-url" type="url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="https://..." />
        </FormField>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField id="portfolio-url" label="Portafolio">
            <Input id="portfolio-url" type="url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} placeholder="https://..." />
          </FormField>
          <FormField id="website-url" label="Sitio web">
            <Input id="website-url" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
          </FormField>
        </div>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Redes sociales</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {socialFields.map((field) => (
            <FormField key={field.key} id={`social-${field.key}`} label={field.label}>
              <Input
                id={`social-${field.key}`}
                type="url"
                value={socialLinks[field.key] ?? ""}
                onChange={(event) => setSocialLinks((current) => ({ ...current, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
              />
            </FormField>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending || !displayName.trim()}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
        {feedback && (
          <p
            role="status"
            className={feedback.kind === "success" ? "text-sm font-semibold text-[var(--success)]" : "text-sm font-semibold text-[var(--danger)]"}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </form>
  );
}
