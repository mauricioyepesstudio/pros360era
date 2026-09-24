"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RadioGroup from "@/components/ui/RadioGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import { updateProfessionalProfileAction } from "@/app/(account)/panel-profesional/actions";
import { getProfessionalCategory } from "@/data/professional/categories";
import { consultationModeOptions } from "@/data/opportunities/copy";
import { socialLinkPlatformLabels, socialLinkPlatforms, type MyProfessionalProfile, type ProfessionalProfileEditableFields, type ProfessionalSocialLinks } from "@/data/professional/types";

const languageOptions: readonly { code: string; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "Inglés" },
  { code: "pt", label: "Portugués" },
  { code: "fr", label: "Francés" },
];

function toEditableFields(profile: MyProfessionalProfile): ProfessionalProfileEditableFields {
  return {
    displayName: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    state: profile.state,
    city: profile.city,
    languages: profile.languages,
    consultationMode: profile.consultationMode,
    isAcceptingClients: profile.isAcceptingClients,
    bookingUrl: profile.bookingUrl,
    photoUrl: profile.photoUrl,
    portfolioUrl: profile.portfolioUrl,
    websiteUrl: profile.websiteUrl,
    socialLinks: profile.socialLinks,
  };
}

/**
 * Self-service editor for the professional's OWN professional_profiles row
 * (RLS: update_own_professional_profile, 0005). category/isApproved/
 * identityVerified/slug are rendered as read-only info, never as form
 * inputs — they are operator-controlled or derived, and
 * updateProfessionalProfileAction's parameter type
 * (ProfessionalProfileEditableFields) structurally excludes them, so there
 * is no code path here that could even attempt to send them.
 */
export default function ProfessionalProfileForm({ profile }: { profile: MyProfessionalProfile }) {
  const [fields, setFields] = useState<ProfessionalProfileEditableFields>(() => toEditableFields(profile));
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const category = getProfessionalCategory(profile.category);

  function update<K extends keyof ProfessionalProfileEditableFields>(key: K, value: ProfessionalProfileEditableFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function toggleLanguage(code: string) {
    setFields((current) => ({
      ...current,
      languages: current.languages.includes(code) ? current.languages.filter((l) => l !== code) : [...current.languages, code],
    }));
  }

  function updateSocialLink(platform: keyof ProfessionalSocialLinks, value: string) {
    setFields((current) => {
      const socialLinks = { ...current.socialLinks };
      if (value.trim()) socialLinks[platform] = value;
      else delete socialLinks[platform];
      return { ...current, socialLinks };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const response = await updateProfessionalProfileAction(fields);
    setPending(false);
    setResult(response.saved ? "success" : "error");
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Categoría</p>
            <p className="mt-1 font-semibold text-[var(--brand-navy)]">{category?.label ?? profile.category}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Solo un operador de EVOLUSA puede cambiar tu categoría.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={profile.isApproved ? "complete" : "current"}>
              {profile.isApproved ? "Perfil público" : "En revisión — aún no es público"}
            </StatusBadge>
            {profile.identityVerified && (
              <StatusBadge status="complete" className="inline-flex items-center gap-1.5">
                <CheckCircle2 aria-hidden size={14} />
                Identidad verificada
              </StatusBadge>
            )}
          </div>
        </div>
        {profile.isApproved && (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Así es como te ven los miembros:{" "}
            <Link href={`/profesionales/${profile.slug}`} className="font-semibold text-[var(--brand-blue)] hover:underline">
              /profesionales/{profile.slug}
            </Link>
          </p>
        )}
      </Card>

      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormField id="display-name" label="Nombre para mostrar" required>
            <Input id="display-name" required maxLength={200} value={fields.displayName} onChange={(e) => update("displayName", e.target.value)} />
          </FormField>

          <FormField id="headline" label="Frase corta (headline)" hint="Una línea que resuma lo que haces.">
            <Input id="headline" maxLength={200} value={fields.headline ?? ""} onChange={(e) => update("headline", e.target.value)} />
          </FormField>

          <FormField id="bio" label="Sobre ti" hint="Lo que un miembro lee antes de decidir si te contacta.">
            <Textarea id="bio" maxLength={1000} value={fields.bio ?? ""} onChange={(e) => update("bio", e.target.value)} />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="city" label="Ciudad">
              <Input id="city" maxLength={100} value={fields.city ?? ""} onChange={(e) => update("city", e.target.value)} />
            </FormField>
            <FormField id="state" label="Estado">
              <Input id="state" maxLength={100} value={fields.state ?? ""} onChange={(e) => update("state", e.target.value)} placeholder="Ej. FL" />
            </FormField>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 font-semibold text-[var(--brand-navy)]">Idiomas en los que atiendes</legend>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map((option) => (
                <label
                  key={option.code}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 has-[:checked]:border-[var(--brand-gold-strong)] has-[:checked]:bg-amber-50"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand-gold-strong)]"
                    checked={fields.languages.includes(option.code)}
                    onChange={() => toggleLanguage(option.code)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <RadioGroup
            legend="¿Cómo ofreces tus consultas?"
            name="consultation-mode"
            options={consultationModeOptions}
            value={fields.consultationMode}
            onChange={(e) => update("consultationMode", e.target.value as ProfessionalProfileEditableFields["consultationMode"])}
          />

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--brand-gold-strong)] has-[:checked]:bg-amber-50">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand-gold-strong)]"
              checked={fields.isAcceptingClients}
              onChange={(e) => update("isAcceptingClients", e.target.checked)}
            />
            <span>
              <span className="block font-medium text-[var(--foreground)]">Estoy aceptando nuevos clientes</span>
              <span className="mt-1 block text-sm text-[var(--muted)]">Desmárcalo temporalmente si no tienes disponibilidad.</span>
            </span>
          </label>

          <FormField id="booking-url" label="Enlace para agendar" hint="Ej. tu link de Cal.com. Se muestra solo a miembros ya conectados contigo.">
            <Input id="booking-url" type="url" maxLength={500} value={fields.bookingUrl ?? ""} onChange={(e) => update("bookingUrl", e.target.value)} placeholder="https://cal.com/tu-usuario" />
          </FormField>

          <FormField id="photo-url" label="Foto de perfil (URL)" hint="Enlace directo a una imagen. Próximamente permitiremos subir el archivo directamente.">
            <Input id="photo-url" type="url" maxLength={500} value={fields.photoUrl ?? ""} onChange={(e) => update("photoUrl", e.target.value)} placeholder="https://..." />
          </FormField>

          <FormField id="portfolio-url" label="Portafolio" hint="Opcional.">
            <Input id="portfolio-url" type="url" maxLength={500} value={fields.portfolioUrl ?? ""} onChange={(e) => update("portfolioUrl", e.target.value)} placeholder="https://..." />
          </FormField>

          <FormField id="website-url" label="Sitio web" hint="Opcional.">
            <Input id="website-url" type="url" maxLength={500} value={fields.websiteUrl ?? ""} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://..." />
          </FormField>

          <fieldset className="space-y-4">
            <legend className="font-semibold text-[var(--brand-navy)]">Redes sociales</legend>
            {socialLinkPlatforms.map((platform) => (
              <FormField key={platform} id={`social-${platform}`} label={socialLinkPlatformLabels[platform]}>
                <Input
                  id={`social-${platform}`}
                  type="url"
                  maxLength={500}
                  value={fields.socialLinks[platform] ?? ""}
                  onChange={(e) => updateSocialLink(platform, e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
            ))}
          </fieldset>

          {result === "error" && <p className="text-sm text-[var(--danger)]">No pudimos guardar los cambios. Intenta de nuevo en un momento.</p>}
          {result === "success" && <p className="text-sm font-semibold text-[var(--success)]">Cambios guardados.</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
