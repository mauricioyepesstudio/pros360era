"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";
import ProductRevealPanel from "./ProductRevealPanel";

/**
 * Desktop-only (`lg:` and up). This is NOT a screenshot — every element
 * below is a real, live component (BrandMark, EvolusaPath, ProductRevealPanel
 * with real generateRoadmap() data, real <Link>s). What's different from a
 * normal fluid layout is the CONTAINING FRAME: an "artboard" locked to the
 * aspect ratio of the approved reference, capped at max-width so it doesn't
 * distort on ultra-wide monitors — the surrounding <section> supplies solid
 * navy on either side rather than the composition stretching indefinitely.
 *
 * CORRECTION (owner-confirmed): the artboard was previously 1024x890, per an
 * even earlier in-code note claiming 1536x1024 "doesn't match the reference
 * file." That earlier measurement was wrong. The owner confirmed the real
 * reference is 1536x1024 (3:2) — which also happens to match hero-family.webp's
 * own native aspect ratio (~1.5) almost exactly, which is why the photo no
 * longer needs any extra scale/crop transform below: at matching aspect
 * ratios, object-fit:cover shows the whole photo with no distortion.
 */
export default function HeroArtboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  const pathProgress = useTransform(scrollYProgress, [0, 0.85], [0.02, 1]);

  // Corrected aspect ratio of the approved reference: 1536 x 1024 (3:2).
  const ART_W = 1536;
  const ART_H = 1024;

  return (
    <section ref={sectionRef} id="home" aria-labelledby="hero-title" className="relative hidden bg-[var(--brand-navy)] lg:block">
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: "min(100%, 1536px)",
          aspectRatio: `${ART_W} / ${ART_H}`,
        }}
      >
        {/* Background photo — bottom-anchored 1.15x scale. Measured the actual
            source file directly: ~13.9% of the top is empty sky before the
            first building appears, while the water at the bottom runs to the
            very edge (0% margin there). Anchoring the scale at the bottom
            means the family's feet/legs stay exactly where they already were
            (nothing already-visible gets cropped) while that empty sky margin
            gets trimmed and the family sits slightly higher/larger in frame. */}
        <div className="absolute inset-0" style={{ transform: "scale(1.28)", transformOrigin: "center bottom" }}>
          <motion.div style={{ scale: imageScale }} className="absolute inset-0">
            <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" objectPosition="center" sizes="2000px" />
          </motion.div>
        </div>

        {/* Scrim — MEASURED: headline/copy/CTA occupy x=[6%,52%] y=[17%,60%], so the
            scrim covers the left ~55% width and full height for text safety, fading
            out toward the family on the right. Stronger opacity for text legibility. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[var(--brand-navy)]/95 via-[var(--brand-navy)]/80 to-transparent" style={{ width: "62%" }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/90 to-transparent" />


        {/* Headline block — MEASURED bounds: x=[6.3%,51.8%] y=[17.4%,38.8%] (headline);
            swoosh y=[38.8%,40.4%]; copy y=[42.1%,51.7%]; CTA row y=[55.4%,59.7%]. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute text-white"
          style={{ left: "6.3%", top: "16%", width: "46%" }}
        >
          <h1 id="hero-title" className="text-balance leading-[0.95] tracking-[-0.03em]">
            <span className="block text-[clamp(2rem,3.4vw,3.25rem)] font-light text-white">TU SUEÑO</span>
            <span className="block text-[clamp(3rem,4.95vw,4.75rem)] font-extrabold text-white">TIENE UN</span>
            <span className="block text-[clamp(3rem,4.95vw,4.75rem)] font-extrabold text-white">CAMINO.</span>
          </h1>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-3 block h-2 w-56 origin-left rounded-full bg-[var(--brand-red)]"
          />
          <p className="mt-4 text-xl font-semibold">
            <span className="font-extrabold text-white">EVOLUSA</span> <span className="text-[var(--brand-blue-on-dark)]">te ayuda a convertirlo en un plan.</span>
          </p>
          <p className="mt-2 max-w-md text-base leading-6 text-white/70">Para hispanohablantes en EE. UU. y los profesionales aprobados que los acompañan.</p>
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex gap-4">
              <ButtonLink href="/aplicar-profesional" data-tour="hero-pro" variant="primary" title="Aplica como profesional aprobado">
                Soy profesional
                <ArrowRight aria-hidden className="ml-2" size={18} />
              </ButtonLink>
              <ButtonLink href="/profesionales" data-tour="hero-busco" variant="primary" title="Ver profesionales aprobados">
                Busco un profesional
                <ArrowRight aria-hidden className="ml-2" size={18} />
              </ButtonLink>
            </div>
          </div>
        </motion.div>

        {/* Path — MEASURED: x=[5.4%,95.2%] y=[63.3%,70.2%]. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          data-tour="hero-path"
          className="absolute"
          style={{ left: "5.4%", right: "4.8%", top: "63.3%" }}
        >
          <EvolusaPath theme="dark" activeId="LLEGA" scrollProgress={pathProgress} />
        </motion.div>

        {/* Product Reveal panel — MEASURED: x=[5.4%,95.2%] y=[71.0%,100%]. Real
            generateRoadmap() data via the shared ProductRevealPanel component. */}
        <div id="roadmap-desktop" data-tour="hero-roadmap" className="absolute" style={{ left: "5.4%", right: "4.8%", top: "71%", bottom: "0%" }}>
          <ProductRevealPanel compact />
        </div>
      </div>
    </section>
  );
}
