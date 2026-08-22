import { ChevronRight } from "lucide-react";
import { generateRoadmap } from "@/lib/roadmap/generateRoadmap";
import { cn } from "@/lib/cn";

const preview = generateRoadmap({
  hasBusiness: "yes",
  businessRegistered: "yes",
  hasBusinessBankAccount: "no",
  hasBookkeeping: "no",
  hasWebsite: "no",
  hasGoogleBusiness: "no",
  primaryPriority: "organize_business",
});

const groups = [
  { key: "completed" as const, label: "Hoy", items: preview.completed.slice(0, 1), marker: "check" as const, badge: "bg-[var(--brand-red)] text-white" },
  { key: "now" as const, label: "Siguiente", items: preview.now.slice(0, 2), marker: "ring" as const, badge: "bg-white/10 text-white/80" },
  { key: "upcoming" as const, label: "Después", items: preview.upcoming.slice(0, 2), marker: "empty" as const, badge: "bg-white/10 text-white/60" },
];

function Marker({ variant }: { variant: "check" | "ring" | "empty" }) {
  if (variant === "check") {
    return (
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)] text-white">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (variant === "ring") {
    return (
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-red)] bg-[var(--brand-navy)]">
        <span className="size-2 rounded-full bg-[var(--brand-red)]" />
      </span>
    );
  }
  return <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-[var(--brand-navy)]" />;
}

/**
 * The "TU PLAN EVOLUSA" panel content — extracted so it can be reused both
 * in the normal mobile document flow (ProductReveal.tsx) and absolutely
 * positioned inside the desktop HeroArtboard at measured coordinates.
 * Always the same real `generateRoadmap()` data/logic — only the outer
 * sizing context differs.
 *
 * `compact` shrinks paddings/type for the desktop artboard's fixed-height
 * box (measured ~29% of the artboard height), where content must fit
 * without the section being allowed to grow to its natural size.
 */
export default function ProductRevealPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-white/10 text-white",
        // compact (desktop artboard) sits directly on top of the live photo,
        // so it needs a properly opaque backdrop — the subtle bg-white/[0.03]
        // treatment (correct for the mobile version, which sits on an
        // already-solid navy section) let the photo bleed through visibly.
        compact ? "justify-center gap-4 bg-[var(--brand-navy)]/95 p-5 lg:p-7" : "gap-8 bg-white/[0.03] p-8 sm:p-10 lg:p-14",
      )}
    >
      <div className={cn("grid gap-8", compact ? "lg:grid-cols-[minmax(0,1fr)_2.3fr] lg:gap-8" : "lg:grid-cols-[minmax(0,1fr)_2.3fr] lg:gap-16")}>
        <div>
          <p id="product-reveal-title" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">
            Tu plan EVOLUSA
          </p>
          <p className={cn("text-balance font-extrabold leading-tight", compact ? "mt-2 text-xl lg:text-2xl" : "mt-3 text-3xl sm:text-4xl")}>No necesitas resolverlo todo hoy.</p>
          <p className={cn("text-white/50", compact ? "mt-1 text-sm" : "mt-2 text-base")}>Necesitas saber qué sigue.</p>
        </div>

        <div className={cn("grid gap-6 sm:grid-cols-3", compact && "gap-4")}>
          {groups.map((group) => (
            <div key={group.key}>
              <span className={cn("inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold uppercase tracking-wide", group.badge)}>{group.label}</span>
              <ul className={cn("relative space-y-3", compact ? "mt-3" : "mt-4 space-y-5")}>
                {group.items.length > 1 && <span aria-hidden className="absolute left-3 top-3 bottom-3 w-px -translate-x-1/2 bg-white/15" />}
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <Marker variant={group.marker} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-semibold text-white", compact ? "text-xs" : "text-sm")}>{item.title}</p>
                      {!compact && <p className="mt-0.5 text-xs leading-5 text-white/45">{item.description}</p>}
                    </div>
                    <ChevronRight aria-hidden className="mt-1 shrink-0 text-white/25" size={16} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("border-t border-white/10", compact ? "pt-3" : "mt-2 pt-5")}>
        <p className={cn("leading-5 text-white/45", compact ? "text-[11px]" : "text-xs")}>
          <span className="underline">EVOLUSA</span> ofrece orientación educativa y operacional. Los servicios regulados permanecen fuera del catálogo hasta verificar proveedor, alcance y requisitos.
        </p>
      </div>
    </div>
  );
}
