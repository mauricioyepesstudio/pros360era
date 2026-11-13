import Link from "next/link";
import ButtonLink from "@/components/ui/ButtonLink";
import { CheckCircle2, Circle } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import BrandKitForm from "@/components/professional/BrandKitForm";
import ProfessionalBusinessForm from "@/components/professional/ProfessionalBusinessForm";
import VoiceProfileForm from "@/components/professional/VoiceProfileForm";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyBrandFile } from "@/lib/cerebro/persistence";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";

/**
 * Expediente de marca: los tres pasos que el cerebro exige antes de redactar
 * (negocio, voz, brandbook con encargado). Misma barrera de rol que /perfil;
 * los datos viven en onboarding_responses, filtrados por user_id con RLS.
 */
export default async function BrandFilePage() {
  await requireProfessionalArea();
  const [profile, file] = await Promise.all([getMyProfessionalProfile(), getMyBrandFile()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Mi marca"
        description="Tu expediente de marca. Los borradores con IA de EVOLUSA usan lo que guardes aquí: tu negocio, cómo hablas y tu línea gráfica. Con los tres pasos listos se desbloquean en el planner. Tú revisas y apruebas todo; nada se publica sin tu aprobación."
      />
      {!profile ? (
        <p role="alert" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">Todavía no encontramos tu perfil profesional.</p>
      ) : (
        <>
          <nav aria-label="Pasos del expediente" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
            <p className="font-bold text-[var(--brand-navy)]">{file.ready ? "Expediente completo: ya puedes generar borradores en el planner." : `Te falta: ${file.missing.join(", ")}.`}</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {file.steps.map((step, index) => (
                <li key={step.id}>
                  <Link href={step.href} className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 font-semibold hover:bg-[var(--sky-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)]">
                    {step.done ? <CheckCircle2 aria-hidden className="text-[var(--success)]" size={20} /> : <Circle aria-hidden className="text-[var(--muted)]" size={20} />}
                    <span>{index + 1}. {step.label}</span>
                    <span className="sr-only">{step.done ? "(listo)" : "(pendiente)"}</span>
                  </Link>
                </li>
              ))}
            </ol>
            {file.ready && <ButtonLink href="/panel-profesional/planner?review=weekly" className="mt-4">Ir al planner</ButtonLink>}
          </nav>
          <section id="mi-negocio" className="scroll-mt-24">
            {file.business.available ? <ProfessionalBusinessForm initial={file.business.business} displayName={profile.displayName} location={[profile.city, profile.state].filter(Boolean).join(", ")} /> : <p role="alert">No pudimos cargar tu negocio. Reintenta antes de cambiarlo.</p>}
          </section>
          <section id="mi-voz" className="scroll-mt-24">
            {file.voice.available ? <VoiceProfileForm initial={file.voice.voice} /> : <p role="alert">No pudimos cargar tu perfil de voz. Reintenta antes de cambiarlo.</p>}
          </section>
          <section id="mi-brandbook" className="scroll-mt-24">
            {file.brand.available ? <BrandKitForm initial={file.brand.brand} websiteUrl={profile.websiteUrl} ownerName={profile.displayName} /> : <p role="alert">No pudimos cargar tu brandbook. Reintenta antes de cambiarlo.</p>}
          </section>
        </>
      )}
    </div>
  );
}
