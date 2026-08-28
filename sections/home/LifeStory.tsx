"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import PhotoSlot, { type PhotoSlotIconName } from "@/components/evolusa/PhotoSlot";
import type { PhotoSlotId } from "@/data/photography/slots";
import { cn } from "@/lib/cn";

/**
 * Full-bleed, edge-to-edge image moments — no framed/rounded image blocks,
 * text overlaid directly on the photo via a one-side scrim. Photo slots are
 * documented in data/photography/slots.ts and reused from Journey's stage
 * scenes — the same real-world moment shown at two scales/contexts, not a
 * separate photo per surface.
 */
const moments = [
  {
    id: "emprende",
    eyebrow: "Emprende",
    line: "CONVIERTE TUS HABILIDADES\nEN OPORTUNIDADES.",
    href: "#stage-selector",
    cta: "Preparar mi negocio",
    slot: "entrepreneurship" as PhotoSlotId,
    tone: "navy" as const,
    textSide: "left" as const,
    icon: "Rocket" as PhotoSlotIconName,
  },
  {
    id: "establecete",
    eyebrow: "Establécete",
    line: "CONSTRUYE ESTABILIDAD.",
    href: "#stage-selector",
    cta: "Organizar mis próximos pasos",
    slot: "stability" as PhotoSlotId,
    tone: "luminous" as const,
    textSide: "right" as const,
    icon: "FolderCheck" as PhotoSlotIconName,
  },
  {
    id: "crece",
    eyebrow: "Crece",
    line: "CRECE CON UN PLAN.",
    href: "#stage-selector",
    cta: "Fortalecer mi presencia",
    slot: "growth" as PhotoSlotId,
    tone: "blue" as const,
    textSide: "left" as const,
    icon: "TrendingUp" as PhotoSlotIconName,
  },
] as const;

export default function LifeStory() {
  return (
    <section aria-label="Historias de progreso" className="bg-[var(--background)]">
      {moments.map((moment) => {
        const onRight = moment.textSide === "right";
        return (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]"
          >
            <motion.div
              initial={{ scale: 1.06 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <PhotoSlot id={moment.slot} tone={moment.tone} icon={moment.icon} className="h-full w-full" />
            </motion.div>

            <div
              aria-hidden
              className={cn(
                "absolute inset-y-0 w-full sm:w-2/3",
                onRight
                  ? "right-0 bg-gradient-to-l from-[var(--brand-navy)] via-[var(--brand-navy)]/70 to-transparent"
                  : "left-0 bg-gradient-to-r from-[var(--brand-navy)] via-[var(--brand-navy)]/70 to-transparent",
              )}
            />

            <div className={cn("absolute inset-0 flex items-center", onRight ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-md px-6 py-10 sm:px-10", onRight && "text-right")}>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue-on-dark)]">{moment.eyebrow}</p>
                <p className="mt-3 whitespace-pre-line text-balance text-2xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-4xl">
                  {moment.line}
                </p>
                <Link
                  href={moment.href}
                  className={cn("mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white/85 hover:text-white", onRight && "flex-row-reverse")}
                >
                  {moment.cta}
                  <ArrowRight aria-hidden className={onRight ? "mr-2 rotate-180" : "ml-2"} size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
