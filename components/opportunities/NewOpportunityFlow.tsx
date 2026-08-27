"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import RadioGroup from "@/components/ui/RadioGroup";
import { createOpportunityAction, consentAndRouteOpportunityAction } from "@/app/(account)/actions";
import { consentDataCategories, type ConsentDataCategory, type IntentReadiness } from "@/data/opportunities/types";
import type { ConsultationMode } from "@/data/professional/types";
import { consentDataCategoryLabels, consultationModeOptions, intentReadinessOptions } from "@/data/opportunities/copy";
import type { NeedId } from "@/data/needs/catalog";

type NeedOption = { id: NeedId; labelEs: string; descriptionEs: string };

type Phase =
  | { name: "form" }
  | { name: "error"; message: string }
  | { name: "no-match" }
  | { name: "consent"; opportunityId: string }
  | { name: "done" };

const GENERIC_ERROR = "No pudimos procesar tu solicitud en este momento. Intenta de nuevo en unos minutos.";

/**
 * Milestone 04D — the previously-missing UI for create_qualified_opportunity
 * / consent_and_route_opportunity (see docs/EVOLUSA-OPPORTUNITY-EXPERIENCE.md's
 * "What remains deferred"). Deliberately shows no professional identity or
 * score at any point: matched_professional_profile_id has no joinable public
 * identifier by design (0005's SECURITY BOUNDARY), and organic_match_score
 * must never reach a Client Component, matching the same rule OpportunityCard
 * already enforces for /conexiones. The "compatible match" copy below is the
 * same static, always-true-once-matched sentence used in
 * data/opportunities/copy.ts's ROUTED state, not a fetched detail.
 */
export default function NewOpportunityFlow({ needs }: { needs: readonly NeedOption[] }) {
  const [phase, setPhase] = useState<Phase>({ name: "form" });
  const [needId, setNeedId] = useState<NeedId | "">(needs[0]?.id ?? "");
  const [city, setCity] = useState("");
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>("VIRTUAL");
  const [readiness, setReadiness] = useState<IntentReadiness>("CONSIDERING");
  const [categories, setCategories] = useState<ConsentDataCategory[]>(["NAME", "CONTACT_EMAIL", "NEED_SUMMARY"]);
  const [pending, startTransition] = useTransition();

  function toggleCategory(category: ConsentDataCategory) {
    setCategories((current) => (current.includes(category) ? current.filter((item) => item !== category) : [...current, category]));
  }

  function handleSubmitNeed() {
    if (!needId) return;
    startTransition(async () => {
      const result = await createOpportunityAction(needId, city.trim() || null, consultationMode, readiness);
      if (!result.saved) {
        setPhase({ name: "error", message: GENERIC_ERROR });
        return;
      }
      if (result.matchedProfessionalCount === 0) {
        setPhase({ name: "no-match" });
        return;
      }
      setPhase({ name: "consent", opportunityId: result.opportunityId });
    });
  }

  function handleConfirmConsent(opportunityId: string) {
    startTransition(async () => {
      const result = await consentAndRouteOpportunityAction(opportunityId, categories);
      setPhase(result.saved ? { name: "done" } : { name: "error", message: GENERIC_ERROR });
    });
  }

  if (phase.name === "error") {
    return (
      <Card className="max-w-xl">
        <p className="font-bold text-[var(--brand-navy)]">{phase.message}</p>
        <Button type="button" className="mt-5" onClick={() => setPhase({ name: "form" })}>
          Intentar de nuevo
        </Button>
      </Card>
    );
  }

  if (phase.name === "no-match") {
    return (
      <Card className="max-w-xl text-center">
        <p className="text-lg font-bold text-[var(--brand-navy)]">Todavía no tenemos una opción compatible para esta necesidad.</p>
        <p className="mt-2 leading-6 text-[var(--muted)]">
          Guardamos tu solicitud. La red de profesionales de EVOLUSA sigue creciendo — vuelve a intentarlo más adelante.
        </p>
        <ButtonLink href="/conexiones" className="mt-5">
          Volver a mis conexiones
        </ButtonLink>
      </Card>
    );
  }

  if (phase.name === "done") {
    return (
      <Card className="max-w-xl text-center">
        <p className="text-lg font-bold text-[var(--brand-navy)]">Encontramos una opción compatible.</p>
        <p className="mt-2 leading-6 text-[var(--muted)]">
          Compartiste únicamente la información que autorizaste. Ahora estamos esperando que el profesional inicie el contacto.
        </p>
        <ButtonLink href="/conexiones" className="mt-5">
          Ver mis conexiones
        </ButtonLink>
      </Card>
    );
  }

  if (phase.name === "consent") {
    return (
      <Card className="max-w-xl">
        <p className="text-lg font-bold text-[var(--brand-navy)]">Encontramos una opción compatible con tu categoría, estado e idioma.</p>
        <p className="mt-2 leading-6 text-[var(--muted)]">
          Elige exactamente qué información quieres compartir con este profesional. Solo se comparte lo que autorices aquí.
        </p>
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
                checked={categories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              <span className="font-medium text-[var(--foreground)]">{consentDataCategoryLabels[category]}</span>
            </label>
          ))}
        </fieldset>
        <Button type="button" className="mt-6" disabled={pending || categories.length === 0} onClick={() => handleConfirmConsent(phase.opportunityId)}>
          {pending ? "Conectando..." : "Conectar"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl space-y-6">
      <FormField id="need" label="¿En qué necesitas ayuda?" required>
        <select
          id="need"
          value={needId}
          onChange={(event) => setNeedId(event.target.value as NeedId)}
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
        <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ej. Miami" />
      </FormField>

      <RadioGroup
        legend="¿Cómo prefieres la consulta?"
        name="consultation-mode"
        options={consultationModeOptions}
        value={consultationMode}
        onChange={(event) => setConsultationMode(event.target.value as ConsultationMode)}
      />

      <RadioGroup
        legend="¿Qué tan listo/a estás para avanzar?"
        name="readiness"
        options={intentReadinessOptions}
        value={readiness}
        onChange={(event) => setReadiness(event.target.value as IntentReadiness)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={pending || !needId} onClick={handleSubmitNeed}>
          {pending ? "Buscando..." : "Buscar una opción compatible"}
        </Button>
        <Link href="/conexiones" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand-navy)]">
          Cancelar
        </Link>
      </div>
    </Card>
  );
}
