"use client";

import { useEffect, useRef, useState } from "react";
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

  // The "family larger/dominant" crop is desktop-only — on a narrow mobile
  // viewport, object-fit:cover already crops the source photo heavily to a
  // tall vertical slice, and adding the same zoom/right-shift there risked
  // pushing the children out of frame. Mirrors the matchMedia pattern
  // already used in SiteHeader's scroll-state detection.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Parallax-lite: the photo drifts and scales very slightly as the hero
  // scrolls past — never enough to feel like scroll-hijacking. On desktop,
  // the base scale starts above 1 (rather than growing from 1) so the
  // family/skyline read larger and more dominant within the crop from the
  // first frame; mobile keeps the original subtle scale.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], isDesktop ? [1.18, 1.24] : [1, 1.06]);
  // The Path's fill reads as "continuing" through the hero's scroll range —
  // the same thread that will resolve into the plan below.
  const pathProgress = useTransform(scrollYProgress, [0, 0.85], [0.02, 1]);

  return (
    <section ref={sectionRef} id="home" aria-labelledby="hero-title" className="relative h-[clamp(680px,88vh,900px)] overflow-hidden">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" objectPosition={isDesktop ? "68% 30%" : undefined} />
      </motion.div>

      {/* Scrim confined to the text-safety zone only — sized so sky stays visible above it. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/70 to-transparent lg:h-[58%]" />

      {/*
        Structural three-zone layout (not independent absolute positioning,
        which is what caused the Path to overlap the CTA row): the outer
        column stacks a flex-growing, vertically-centered content zone
        followed by an auto-height Path zone. Because the content zone
        consumes exactly "whatever space isn't the Path's", the two can
        never overlap regardless of how tall the headline gets — no matter
        the resolution, no matter how content wraps.

        Mobile/tablet keep the original bottom-anchored flex stack.
        Desktop (lg+) switches to the centered/reserved-zone structure.
      */}
      <Container className="relative flex h-full flex-col justify-end pb-10 sm:pb-14 lg:justify-start lg:gap-8 lg:pb-10 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl text-white lg:flex lg:flex-1 lg:flex-col lg:justify-center"
        >
          <h1 id="hero-title" className="text-balance leading-[0.95] tracking-[-0.035em]">
            <span className="block text-[clamp(2.25rem,5.5vw,3.25rem)] font-medium text-white/85">TU SUEÑO</span>
            <span className="block text-[clamp(3rem,7.5vw,5.5rem)] font-extrabold">TIENE UN</span>
            <span className="block text-[clamp(3rem,7.5vw,5.5rem)] font-extrabold">CAMINO.</span>
          </h1>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-3 block h-1.5 w-28 origin-left rounded-full bg-[var(--brand-red)]"
          />
          <p className="mt-4 text-lg font-semibold text-[var(--brand-blue-on-dark)] sm:text-xl">
            EVOLUSA te ayuda a convertirlo en un plan.
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/70 sm:text-base">
            Desde establecerte hasta emprender, proteger lo que construyes y seguir creciendo.
          </p>
          <div className="mt-6">
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
          className="mt-12 w-full shrink-0 lg:mt-0"
        >
          <EvolusaPath theme="dark" activeId="LLEGA" scrollProgress={pathProgress} />
        </motion.div>
      </Container>
    </section>
  );
}
