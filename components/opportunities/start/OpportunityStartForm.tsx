import type { FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import RadioGroup from "@/components/ui/RadioGroup";
import { consultationModeOptions, intentReadinessOptions } from "@/data/opportunities/copy";
import type { IntentReadiness } from "@/data/opportunities/types";
import type { NeedId } from "@/data/needs/catalog";
import type { ConsultationMode } from "@/data/professional/types";

type NeedOption = { id: NeedId; labelEs: string; descriptionEs: string };

export default function OpportunityStartForm({
  needs,
  needId,
  city,
  consultationMode,
  readiness,
  pending,
  onNeedChange,
  onCityChange,
  onConsultationModeChange,
  onReadinessChange,
  onSubmit,
}: {
  needs: readonly NeedOption[];
  needId: NeedId | "";
  city: string;
  consultationMode: ConsultationMode;
  readiness: IntentReadiness;
  pending: boolean;
  onNeedChange: (value: NeedId) => void;
  onCityChange: (value: string) => void;
  onConsultationModeChange: (value: ConsultationMode) => void;
  onReadinessChange: (value: IntentReadiness) => void;
  onSubmit: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Card className="max-w-xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField id="need" label="¿En qué necesitas ayuda?" required>
          <select
            id="need"
            required
            value={needId}
            onChange={(event) => onNeedChange(event.target.value as NeedId)}
            className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2 text-[var(--foreground)]"
          >
            {needs.map((need) => (
              <option key={need.id} value={need.id}>
                {need.labelEs}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="city" label="Ciudad" hint="Opcional — nos ayuda a encontrar una opción más cercana.">
          <Input id="city" maxLength={100} value={city} onChange={(event) => onCityChange(event.target.value)} placeholder="Ej. Miami" />
        </FormField>

        <RadioGroup
          legend="¿Cómo prefieres la consulta?"
          name="consultation-mode"
          options={consultationModeOptions}
          value={consultationMode}
          onChange={(event) => onConsultationModeChange(event.target.value as ConsultationMode)}
        />

        <RadioGroup
          legend="¿Qué tan listo/a estás para avanzar?"
          name="readiness"
          options={intentReadinessOptions}
          value={readiness}
          onChange={(event) => onReadinessChange(event.target.value as IntentReadiness)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending || !needId}>
            {pending ? "Buscando..." : "Buscar una opción compatible"}
          </Button>
          <Link href="/conexiones" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand-navy)]">
            Cancelar
          </Link>
        </div>
      </form>
    </Card>
  );
}
