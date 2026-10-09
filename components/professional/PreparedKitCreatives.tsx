import { Download } from "lucide-react";
import { creativeFormatLabels, creativeSrc, type PreparedKit } from "@/data/professional/prepared-kits";

const statusCopy = {
  READY_FOR_REVIEW: { label: "Listo para revisar", className: "bg-[var(--sky-surface)] text-[var(--brand-navy)]" },
  NEEDS_CONFIRMATION: { label: "Necesita tu confirmación", className: "bg-amber-50 text-amber-800" },
} as const;

/** Concept-by-format grid of a prepared kit's creatives, with per-file download. */
export default function PreparedKitCreatives({ kit }: { kit: PreparedKit }) {
  return (
    <>
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
        Las cifras de las piezas educativas son ejemplos ilustrativos, no resultados de clientes. Revisa cada pieza y confirma los datos marcados antes de compartirla.
      </section>

      <ol className="space-y-6">
        {kit.creatives.concepts.map((concept, index) => {
          const status = statusCopy[concept.status];
          return (
            <li key={concept.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                    Concepto {String(index + 1).padStart(2, "0")} · {concept.topic}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--brand-navy)]">{concept.title}</h2>
                  {concept.note ? <p className="mt-1 text-sm text-amber-800">{concept.note}</p> : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
              </div>

              <div className="mt-5 grid grid-cols-3 items-start gap-3 sm:gap-5">
                {kit.creatives.formats.map((format) => {
                  const src = creativeSrc(kit, concept.id, format);
                  return (
                    <figure key={format} className="space-y-2">
                      <a href={src} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`${concept.title} (${creativeFormatLabels[format]})`} loading="lazy" className="w-full rounded-[var(--radius-sm)] border border-[var(--border)]" />
                      </a>
                      <figcaption className="flex flex-wrap items-center justify-between gap-1 text-xs text-[var(--muted)]">
                        <span>{creativeFormatLabels[format]}</span>
                        <a href={src} download className="inline-flex items-center gap-1 font-semibold text-[var(--brand-blue)] hover:underline">
                          <Download aria-hidden size={14} />
                          Descargar
                        </a>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
