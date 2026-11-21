import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Download, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { creativeFormatLabels, creativeSrc, type PreparedKit } from "@/data/professional/prepared-kits";

const statusCopy = {
  READY_FOR_REVIEW: { label: "Pendiente de aprobación editorial", className: "border-slate-300 text-slate-700 bg-slate-50" },
  NEEDS_CONFIRMATION: { label: "Datos por confirmar", className: "border-amber-200 bg-amber-50 text-amber-900" },
} as const;

const creativeChecks = [
  "La imagen y el servicio pertenecen a esta marca",
  "Tipografía, contraste, composición y recorte en móvil",
  "Derechos de la foto, identidad y datos de contacto",
  "Texto profesional, requisitos legales y aprobación del titular",
];

/** Private brand-specific kit review. The kit assets are drafts, not publication approvals. */
export default function PreparedKitCreatives({ kit }: { kit: PreparedKit }) {
  const isNotary = kit.category === "NOTARY";
  return (
    <section aria-labelledby="agency-studio-title" className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-sm sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7c6ff]">EvolUSA · Estudio creativo privado</p>
          <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85">Un equipo dedicado a cada marca</span>
        </div>
        <h2 id="agency-studio-title" className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Creatividad que representa tu profesión.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
          Propuestas para {kit.profile.displayName}. Estrategia, diseño, contenido y cumplimiento trabajan sobre tu identidad, no sobre plantillas genéricas de otros profesionales.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["01 · Estrategia", "Mensaje y audiencia"],
            ["02 · Dirección de arte", "Identidad, imagen y formato"],
            ["03 · Calidad", "Revisión profesional antes de publicar"],
          ].map(([name, detail]) => (
            <div key={name} className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm font-semibold">{name}</p>
              <p className="mt-1 text-xs text-white/70">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:flex-row sm:items-start">
        <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={22} />
        <div className="space-y-2">
          <p className="font-bold">Borradores privados. No son piezas aprobadas para publicar.</p>
          <p>La descarga permite revisar el material, no acredita calidad de agencia ni derechos de imagen. El titular debe validar marca, texto, fotografía y recortes en los tres tamaños.</p>
          {isNotary ? <p className="font-medium">Para servicios de Notary Public en Florida, revisa el aviso legal íntegro y su legibilidad en cada formato. No presentes servicios de asesoría legal.</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand-blue)]">Campaña privada · {kit.profile.displayName}</p>
          <h3 className="mt-1 text-xl font-bold text-[var(--brand-navy)]">Conceptos para revisión</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{kit.creatives.concepts.length} conceptos · {kit.creatives.formats.length} tamaños por concepto</p>
        </div>
        <Link href="/panel-profesional/planner?review=weekly#propuestas" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white hover:opacity-90">
          Ir al planner <ArrowUpRight aria-hidden size={17} />
        </Link>
      </div>

      <ol className="space-y-8">
        {kit.creatives.concepts.map((concept, index) => {
          const status = statusCopy[concept.status];
          return (
            <li key={concept.id} className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] bg-[#f8f9fb] p-5 sm:p-7">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-blue)]">Concepto {String(index + 1).padStart(2, "0")} / {concept.topic}</p>
                  <h4 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-navy)] sm:text-2xl">{concept.title}</h4>
                  {concept.note ? <p className="mt-2 text-sm text-amber-900">{concept.note}</p> : null}
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_240px] sm:p-7">
                <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3">
                  {kit.creatives.formats.map((format) => {
                    const src = creativeSrc(kit, concept.id, format);
                    return (
                      <figure key={format} className="min-w-0">
                        <a href={src} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[#f3f4f6]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Borrador de ${concept.title} en ${creativeFormatLabels[format]}`} loading="lazy" className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]" />
                        </a>
                        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[var(--brand-navy)]">{creativeFormatLabels[format]}</span>
                          <a href={src} download className="inline-flex min-h-9 items-center gap-1 font-semibold text-[var(--brand-blue)] underline-offset-4 hover:underline" aria-label={`Descargar borrador ${creativeFormatLabels[format]} de ${concept.title}`}>
                            <Download aria-hidden size={14} /> Descargar
                          </a>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
                <aside className="self-start rounded-2xl border border-[var(--border)] bg-[#fbfbfc] p-5">
                  <div className="flex items-center gap-2 text-[var(--brand-navy)]"><ImageIcon aria-hidden size={18}/><p className="text-sm font-bold">Control de calidad</p></div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Lista de verificación editorial. Ningún punto se marca automáticamente como aprobado.</p>
                  <ul className="mt-4 space-y-3">
                    {creativeChecks.map(check => <li key={check} className="flex gap-2 text-xs leading-5 text-slate-700"><span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-slate-400" aria-hidden="true" />{check}</li>)}
                  </ul>
                  <div className="mt-5 flex items-start gap-2 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]"><CheckCircle2 aria-hidden className="mt-0.5 shrink-0" size={16}/><span>Continúa al planner únicamente después de revisar la pieza.</span></div>
                </aside>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
