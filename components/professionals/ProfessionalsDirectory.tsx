"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import { getProfessionalCategory, professionalCategories } from "@/data/professional/categories";
import { getStagesForProfessionalCategory, journeyStageOptions } from "@/data/professional/stage-mapping";
import type { ProfessionalProfilePublic } from "@/data/professional/types";

const languageLabels: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
  fr: "Francés",
};

export default function ProfessionalsDirectory({ professionals }: { professionals: ProfessionalProfilePublic[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return professionals.filter((professional) => {
      if (categoryFilter !== "ALL" && professional.category !== categoryFilter) return false;
      if (stageFilter !== "ALL") {
        const stages = getStagesForProfessionalCategory(professional.category);
        if (!stages.includes(stageFilter)) return false;
      }
      return true;
    });
  }, [professionals, categoryFilter, stageFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="filter-category">Filtrar por profesión</label>
        <select
          id="filter-category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)]"
        >
          <option value="ALL">Todas las profesiones</option>
          {professionalCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-stage">Filtrar por etapa</label>
        <select
          id="filter-stage"
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
          className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)]"
        >
          <option value="ALL">Todas las etapas</option>
          {journeyStageOptions.map((stage) => (
            <option key={stage.id} value={stage.id}>{stage.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-8 max-w-xl">
          <p className="text-[var(--muted)]">Ningún profesional coincide con este filtro todavía.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((professional) => {
            const category = getProfessionalCategory(professional.category);
            const location = [professional.city, professional.state].filter(Boolean).join(", ");
            const languages = professional.languages.map((code) => languageLabels[code] ?? code.toUpperCase());

            return (
              <Link key={professional.slug} href={`/profesionales/${professional.slug}`} className="group block h-full">
                <Card className="flex h-full flex-col transition group-hover:border-[var(--brand-blue)] group-hover:shadow-[var(--shadow-md)]">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--sky-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-navy)]">
                      {category?.label ?? "Profesional EVOLUSA"}
                    </span>
                    <VerifiedBadge verified={professional.identityVerified} />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-blue)]">
                    {professional.displayName}
                  </h2>
                  {professional.headline && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{professional.headline}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                    {location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden size={14} />
                        {location}
                      </span>
                    )}
                    {languages.length > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users aria-hidden size={14} />
                        {languages.join(" · ")}
                      </span>
                    )}
                  </div>
                  {!professional.isAcceptingClients && (
                    <p className="mt-4 text-xs font-semibold text-[var(--muted)]">No está aceptando nuevos clientes por ahora</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
