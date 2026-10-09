"use client";

import FormField from "@/components/ui/FormField";
import Textarea from "@/components/ui/Textarea";
import ProfessionalCareerView from "@/components/professional/ProfessionalCareerView";
import {
  careerBioLimit,
  careerSections,
  hasCareerContent,
  serializeCareer,
  type ProfessionalCareer,
} from "@/lib/professional/career";

export default function ProfessionalCareerFields({
  value,
  onChange,
}: {
  value: ProfessionalCareer;
  onChange: (value: ProfessionalCareer) => void;
}) {
  const bio = serializeCareer(value);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-[var(--muted)]">
        Completa tu trayectoria con información real. No incluyas teléfono, correo, dirección particular ni documentos de identidad: estos campos pueden mostrarse públicamente cuando el perfil esté aprobado.
      </p>
      {careerSections.map((section) => (
        <FormField key={section.key} id={`career-${section.key}`} label={section.label} hint={section.hint}>
          <Textarea
            id={`career-${section.key}`}
            value={value[section.key]}
            onChange={(event) => onChange({ ...value, [section.key]: event.target.value })}
          />
        </FormField>
      ))}
      <p className="text-sm text-[var(--muted)]" aria-live="polite">
        {bio.length} / {careerBioLimit} caracteres
      </p>
      <details className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
        <summary className="cursor-pointer font-semibold text-[var(--brand-navy)]">
          Vista previa de tu trayectoria — cambios sin guardar
        </summary>
        <div className="mt-5">
          {hasCareerContent(value) ? (
            <ProfessionalCareerView bio={bio} />
          ) : (
            <p className="text-sm text-[var(--muted)]">Completa una sección para ver la vista previa.</p>
          )}
        </div>
        <p className="mt-5 text-xs leading-5 text-[var(--muted)]">
          Información declarada por el profesional. EVOLUSA no ha verificado estas credenciales.
        </p>
      </details>
    </div>
  );
}
