"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";

/**
 * Mobile/tablet only (`lg:hidden` — desktop uses HeroArtboard.tsx instead).
 *
 * MEASURED from the approved reference's Phone 1 mockup: the mobile photo is
 * NOT a tall full-bleed band cropped from the same wide frame as desktop —
 * it's a short, wide band (~16:9) at the very top, with the family filling
 * almost the full width and minimal sky above their heads, then the
 * headline/copy/CTA/Path flow in normal document flow below it on solid
 * navy. The previous mobile implementation reused the desktop-style tall
 * object-fit:cover treatment, which is what produced "father cut off,
 * mother mostly missing" — a materially different crop shape was needed,
 * not just a different object-position on the same tall window.
 */
export default function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative lg:hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" objectPosition="center 15%" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--brand-navy)] to-transparent" />
      </div>

      <Container className="relative bg-[var(--brand-navy)] pb-10 pt-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-white">
          <h1 id="hero-title" className="text-balance leading-[0.95] tracking-[-0.03em]">
            <span className="block text-[2rem] font-medium text-white/85">TU SUEÑO</span>
            <span className="block text-[2.75rem] font-extrabold">TIENE UN</span>
            <span className="block text-[2.75rem] font-extrabold">CAMINO.</span>
          </h1>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-3 block h-1.5 w-40 origin-left rounded-full bg-[var(--brand-red)]"
          />
          <p className="mt-4 text-lg font-semibold">
            <span className="font-extrabold text-white">EVOLUSA</span> <span className="text-[var(--brand-blue-on-dark)]">te ayuda a convertirlo en un plan.</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-white/70">Desde establecerte hasta emprender, proteger lo que construyes y seguir creciendo.</p>
          <div className="mt-6 flex flex-col items-start gap-3">
            <ButtonLink href="/onboarding" className="w-full justify-center">
              Descubrir mi camino
              <ArrowRight aria-hidden className="ml-2" size={18} />
            </ButtonLink>
            <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center font-semibold text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white">
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="mt-10 w-full">
          <EvolusaPath theme="dark" activeId="LLEGA" />
        </motion.div>
      </Container>
    </section>
  );
}
