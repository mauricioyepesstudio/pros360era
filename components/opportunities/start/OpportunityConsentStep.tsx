import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { consentDataCategoryLabels } from "@/data/opportunities/copy";
import { consentDataCategories, type ConsentDataCategory } from "@/data/opportunities/types";
import type { OpportunityProfessionalSummary as OpportunityProfessionalSummaryType } from "@/data/opportunities/types";
import OpportunityProfessionalSummary from "@/components/opportunities/OpportunityProfessionalSummary";

export default function OpportunityConsentStep({
  selected,
  pending,
  onToggle,
  onConfirm,
  matchedProfessional,
}: {
  selected: readonly ConsentDataCategory[];
  pending: boolean;
  onToggle: (category: ConsentDataCategory) => void;
  onConfirm: () => void;
  matchedProfessional: OpportunityProfessionalSummaryType | null;
}) {
  return (
    <Card className="max-w-xl">
      <p className="text-lg font-bold text-[var(--brand-navy)]">Encontramos una opción compatible con tu categoría, estado e idioma.</p>
      <p className="mt-2 leading-6 text-[var(--muted)]">
        Elige exactamente qué información quieres compartir con este profesional. Solo se comparte lo que autorices aquí.
      </p>
      {matchedProfessional && (
        <div className="mt-5">
          <OpportunityProfessionalSummary professional={matchedProfessional} heading="Conexión propuesta" />
        </div>
      )}
      <fieldset className="mt-5 space-y-3">
        <legend className="mb-3 font-semibold text-[var(--brand-navy)]">Información a compartir</legend>
        {consentDataCategories.map((category) => (
          <label
            key={category}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--sky-surface)]"
          >
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand-blue)]"
              checked={selected.includes(category)}
              onChange={() => onToggle(category)}
            />
            <span className="font-medium text-[var(--foreground)]">{consentDataCategoryLabels[category]}</span>
          </label>
        ))}
      </fieldset>
      <Button type="button" className="mt-6" disabled={pending || selected.length === 0} onClick={onConfirm}>
        {pending ? "Conectando..." : "Conectar"}
      </Button>
    </Card>
  );
}
