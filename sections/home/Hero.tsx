"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  // Parallax-lite: the photo drifts and scales very slightly as the hero
  // scrolls past — never enough to feel like scroll-hijacking.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  // The Path's fill reads as "continuing" through the hero's scroll range —
  // the same thread that will resolve into the plan below.
  const pathProgress = useTransform(scrollYProgress, [0, 0.85], [0.02, 1]);

  return (
    <section ref={sectionRef} id="home" aria-labelledby="hero-title" className="relative h-screen min-h-[560px] overflow-hidden">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" />
      </motion.div>

      {/* Scrim confined to the text-safety zone only — more sky stays exposed above it. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/70 to-transparent" />

      <Container className="relative flex h-full flex-col justify-end pb-10 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >
          <h1 id="hero-title" className="text-balance leading-[1.0] tracking-[-0.03em]">
            <span className="block text-[clamp(2rem,5vw,3rem)] font-medium text-white/85">TU SUEÑO</span>
            <span className="block text-[clamp(2.5rem,6.5vw,4.5rem)] font-extrabold">TIENE UN</span>
            <span className="block text-[clamp(2.5rem,6.5vw,4.5rem)] font-extrabold">CAMINO.</span>
          </h1>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-2 block h-1.5 w-28 origin-left rounded-full bg-[var(--brand-red)]"
          />
          <p className="mt-5 text-lg font-semibold text-[var(--brand-blue-on-dark)] sm:text-xl">
            EVOLUSA te ayuda a convertirlo en un plan.
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/70 sm:text-base">
            Desde establecerte hasta emprender, proteger lo que construyes y seguir creciendo.
          </p>
          <div className="mt-7">
            <ButtonLink href="/onboarding">
              Descubrir mi camino
              <ArrowRight aria-hidden className="ml-2" size={18} />
            </ButtonLink>
            <Link href="/login" className="ml-6 inline-flex min-h-11 items-center font-semibold text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white">
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-12 w-full"
        >
          <EvolusaPath theme="dark" activeId="LLEGA" scrollProgress={pathProgress} />
        </motion.div>
      </Container>
    </section>
  );
}
