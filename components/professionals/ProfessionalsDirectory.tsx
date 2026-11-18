"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import { getProfessionalCategory, professionalCategories } from "@/data/professional/categories";
import { getStagesForProfessionalCategory, journeyStageOptions } from "@/data/professional/stage-mapping";
import type { ProfessionalProfilePublic } from "@/data/professional/types";
import { safeHttpUrl } from "@/lib/professional/links";
import ProfessionalPhoto from "@/components/professional/ProfessionalPhoto";

const categoryThemes: Record<string, string> = {
  IMMIGRATION_DOCUMENT_SUPPORT: "bg-gradient-to-r from-sky-950 via-blue-900 to-cyan-700",
  NOTARY: "bg-gradient-to-r from-slate-900 via-slate-800 to-rose-800",
  BUSINESS_OPERATIONS: "bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-700",
  BUSINESS_MARKETING: "bg-gradient-to-r from-violet-950 via-indigo-900 to-blue-800",
};

const categoryHighlights: Record<string, string[]> = {
  IMMIGRATION_DOCUMENT_SUPPORT: ["Residencia", "Asilo", "Ciudadanía"],
  NOTARY: ["Notaría", "Documentos", "Citas"],
  BUSINESS_OPERATIONS: ["Finanzas", "Proyecciones", "Operaciones"],
  BUSINESS_MARKETING: ["Branding", "Web", "Marketing"],
};

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
          className="min-h-11 max-w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)]"
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
          className="min-h-11 max-w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)]"
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
          <div className="mt-4 flex flex-wrap gap-3">
            {(categoryFilter !== "ALL" || stageFilter !== "ALL") && <button
              type="button"
              onClick={() => { setCategoryFilter("ALL"); setStageFilter("ALL"); }}
              className="min-h-11 rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white"
            >Ver todos los profesionales</button>}
            <Link href="/onboarding" className="inline-flex min-h-11 items-center px-3 text-sm font-bold text-[var(--brand-blue)] underline">Describir mi necesidad</Link>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((professional) => {
            const category = getProfessionalCategory(professional.category);
            const location = [professional.city, professional.state].filter(Boolean).join(", ");
            const languages = professional.languages.map((code) => languageLabels[code] ?? code.toUpperCase());
            const photoUrl = safeHttpUrl(professional.photoUrl);

            return (
              <Link key={professional.slug} href={`/profesionales/${professional.slug}`} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden transition duration-200 group-hover:-translate-y-1 group-hover:border-[var(--brand-blue)] group-hover:shadow-[var(--shadow-md)]">
                  <div aria-hidden className={`-mx-6 -mt-6 mb-5 flex h-16 items-center justify-between px-6 text-white ${categoryThemes[professional.category] ?? "bg-[var(--brand-navy)]"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-[.17em] text-white/90">EVOLUSA · {category?.label ?? "Profesional"}</span>
                    <span className="text-3xl font-black tracking-tighter text-white/20">EV</span>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--sky-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-navy)]">
                      {category?.label ?? "Profesional EVOLUSA"}
                    </span>
                    <VerifiedBadge verified={professional.identityVerified} />
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--sky-surface)]"><ProfessionalPhoto src={photoUrl} name={professional.displayName} className="h-full w-full object-cover" /></div>
                    <h2 className="text-xl font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-blue)]">
                      {professional.displayName}
                    </h2>
                  </div>
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
                  <div className="mt-5 flex flex-wrap gap-2" aria-label="Áreas de servicio">
                    {(categoryHighlights[professional.category] ?? []).map((item) => (
                      <span key={item} className="rounded-full border border-[var(--border)] bg-[var(--sky-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-navy)]">{item}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5"><span className="text-sm font-bold text-[var(--brand-blue)]">{professional.isAcceptingClients ? "Conocer servicios y contactar" : "Explorar perfil profesional"}</span><ArrowUpRight aria-hidden size={19} className="text-[var(--brand-blue)]" /></div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
