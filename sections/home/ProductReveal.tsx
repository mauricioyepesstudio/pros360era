"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import { generateRoadmap } from "@/lib/roadmap/generateRoadmap";

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
  { key: "completed" as const, label: "Hoy", items: preview.completed.slice(0, 1), marker: "check" as const },
  { key: "now" as const, label: "Siguiente", items: preview.now.slice(0, 2), marker: "dot" as const },
  { key: "upcoming" as const, label: "Después", items: preview.upcoming.slice(0, 3), marker: "ring" as const },
];

function Marker({ variant }: { variant: "check" | "dot" | "ring" }) {
  if (variant === "check") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white">
        <svg viewBox="0 0 16 16" className="size-4" fill="none"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  if (variant === "dot") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-blue-on-dark)]">
        <span className="size-3 rounded-full bg-[var(--brand-blue-on-dark)]" />
      </span>
    );
  }
  return <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/25" />;
}

/**
 * The Product Reveal — merges the former CoreBelief editorial statement and
 * RoadmapPreview into one full-width narrative moment: the dream becomes a
 * plan. Same visual language that opened in the Hero (thin line, marker
 * states), scaled up to be the page's strongest moment, not a small
 * centered card in empty space. `id="roadmap"` is preserved — StageSelector,
 * StageServices, and CTA all link to `#roadmap`.
 */
export default function ProductReveal() {
  return (
    <section id="roadmap" aria-labelledby="product-reveal-title" className="bg-[var(--brand-navy)] pb-24 pt-14 text-white sm:pb-32 sm:pt-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <p id="product-reveal-title" className="text-balance text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            No necesitas resolverlo todo hoy.
          </p>
          <p className="mt-4 text-balance text-2xl font-semibold leading-tight text-white/60 sm:text-3xl">
            Necesitas saber qué sigue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mt-16 sm:mt-24"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-blue-on-dark)]">Tu plan EVOLUSA</p>

          <div className="relative mt-10 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {/* connecting progression line, desktop only */}
            <span aria-hidden className="absolute inset-x-0 top-4 hidden h-px bg-white/15 sm:block" />
            {groups.map((group, i) => (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.15 * i, ease: "easeOut" }}
                className="relative"
              >
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/50">{group.label}</p>
                <ul className="mt-5 space-y-5">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <Marker variant={group.marker} />
                      <span className={group.key === "upcoming" ? "text-lg text-white/55" : "text-xl font-semibold text-white"}>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <p className="mt-12 max-w-2xl text-xs leading-5 text-white/45">{preview.disclaimer}</p>
          <div className="mt-8">
            <ButtonLink href="#stage-selector">Comenzar por mi etapa</ButtonLink>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
