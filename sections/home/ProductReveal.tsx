"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
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
 * The Product Reveal — "TU PLAN EVOLUSA": a compact bordered panel (not a
 * full-bleed section) that sits immediately below the Hero/Path, matching
 * the approved reference exactly. Real generateRoadmap() data drives every
 * column — including each item's `description`, which the RoadmapItem type
 * already carries but earlier rounds didn't render.
 *
 * Mobile/tablet only (see app/page.tsx) — desktop uses the visual-lock
 * image instead, which bakes this same panel's appearance into the
 * reference screenshot. `id="roadmap"` stays here unchanged (mobile's
 * existing, working behavior is left untouched); on desktop, `#roadmap`
 * links (StageSelector, StageServices, CTA, and the locked image's own
 * header nav) target this same id but it's inside a `lg:hidden` element
 * there, so those links won't auto-scroll on desktop — an accepted,
 * low-severity gap for this temporary lock, since the desktop panel is
 * already fully visible in the static image without needing to scroll.
 */
export default function ProductReveal() {
  return (
    <section id="roadmap" aria-labelledby="product-reveal-title" className="bg-[var(--brand-navy)] px-6 pb-16 pt-6 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_2.3fr] lg:gap-12">
            <div>
              <p id="product-reveal-title" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">
                Tu plan EVOLUSA
              </p>
              <p className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">No necesitas resolverlo todo hoy.</p>
              <p className="mt-2 text-base text-white/50">Necesitas saber qué sigue.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {groups.map((group) => (
                <div key={group.key}>
                  <span className={cn("inline-flex rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold uppercase tracking-wide", group.badge)}>{group.label}</span>
                  <ul className="relative mt-4 space-y-4">
                    {group.items.length > 1 && (
                      <span aria-hidden className="absolute left-3 top-3 bottom-3 w-px -translate-x-1/2 bg-white/15" />
                    )}
                    {group.items.map((item) => (
                      <li key={item.id} className="flex items-start gap-3">
                        <Marker variant={group.marker} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-5 text-white/45">{item.description}</p>
                        </div>
                        <ChevronRight aria-hidden className="mt-1 shrink-0 text-white/25" size={16} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs leading-5 text-white/45">
              <span className="underline">EVOLUSA</span> ofrece orientación educativa y operacional. Los servicios regulados permanecen fuera del catálogo hasta verificar proveedor, alcance y requisitos.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
