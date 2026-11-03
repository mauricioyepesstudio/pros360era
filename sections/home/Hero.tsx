"use client";
import HomeAccountEntry from "@/components/layout/HomeAccountEntry";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";

/**
 * Fluid layout below `xl:` — larger desktops use HeroArtboard.tsx instead.
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
    <section id="home" aria-labelledby="hero-title" className="relative xl:hidden">
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
          <p className="mt-4 text-lg font-semibold text-white">Tus trámites en EE. UU., paso a paso y en español.</p>
          <p className="mt-2 text-sm leading-6 text-white/75"><span className="font-bold text-white">EVOLUSA</span> te dice qué sigue y te conecta con un profesional aprobado para cada paso.</p>
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
              <ButtonLink href="#como-funciona" data-tour="hero-busco" variant="member" className="justify-center py-3.5 text-base" title="Ver cómo te ayuda EVOLUSA">
                Busco ayuda
                <ArrowRight aria-hidden className="ml-2" size={16} />
              </ButtonLink>
              <ButtonLink href="#para-profesionales" data-tour="hero-pro" variant="pro" className="justify-center py-3.5 text-base" title="Ver qué gana un profesional en EVOLUSA">
                Soy profesional
                <ArrowRight aria-hidden className="ml-2" size={16} />
              </ButtonLink>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <HomeAccountEntry />
              <Link href="#journey" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-blue-on-dark)] underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4">
                Explorar las 6 etapas
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} data-tour="hero-path" className="mt-10 w-full">
          <EvolusaPath theme="dark" activeId="LLEGA" />
        </motion.div>
      </Container>
    </section>
  );
}
