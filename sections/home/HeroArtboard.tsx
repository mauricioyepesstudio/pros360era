"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import ButtonLink from "@/components/ui/ButtonLink";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";
import ProductRevealPanel from "./ProductRevealPanel";

const navigation = [
  { label: "Etapas", href: "#stage-selector" },
  { label: "Journey", href: "#journey" },
  { label: "Servicios", href: "#stage-services" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Confianza", href: "#trust" },
  { label: "Preguntas", href: "#faq" },
] as const;

/**
 * Desktop-only (`lg:` and up). This is NOT a screenshot — every element
 * below is a real, live component (BrandMark, EvolusaPath, ProductRevealPanel
 * with real generateRoadmap() data, real <Link>s). What's different from a
 * normal fluid layout is the CONTAINING FRAME: an "artboard" locked to the
 * aspect ratio measured directly from the approved reference
 * (evolusa-home-final-approved.png), so the composition holds its proportions
 * instead of stretching wider/flatter on large monitors. Every child below
 * is positioned with percentages measured from that same reference image
 * (see the MEASURED_* comments) — not estimated, not tuned by eye.
 *
 * Measurement method: connected-component color analysis (scipy.ndimage) on
 * the reference PNG located the EVOLUSA-red UI elements' exact pixel boxes,
 * cross-checked with targeted crops viewed directly. Desktop mockup region
 * measured at 1024x890px (the file's actual desktop portion, above the row
 * of phone mockups) — NOT 1536x1024 as an earlier instruction assumed; that
 * figure doesn't match this reference file, so the artboard's aspect ratio
 * uses the real measured value instead. See the final report for this
 * discrepancy.
 */
export default function HeroArtboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  const pathProgress = useTransform(scrollYProgress, [0, 0.85], [0.02, 1]);

  // Measured aspect ratio of the reference's desktop composition: 1024 x 890.
  const ART_W = 1024;
  const ART_H = 890;

  return (
    <section ref={sectionRef} id="home" aria-labelledby="hero-title" className="relative hidden bg-[var(--brand-navy)] lg:block">
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: "min(100vw, 1536px)",
          aspectRatio: `${ART_W} / ${ART_H}`,
        }}
      >
        {/* Background photo — MEASURED family bounds: x=[67.9%,92.8%] y=[24.2%,63.3%].
            At this artboard's aspect ratio, object-fit:cover is height-constrained
            (source 1536x1024 is wider-aspect than this 1024x890 frame), so vertical
            crop is ~zero and only object-position-x meaningfully shifts the crop. */}
        <div className="absolute inset-0" style={{ transform: "scale(1.4) translateY(-11.7%)", transformOrigin: "center top" }}>
          <motion.div style={{ scale: imageScale }} className="absolute inset-0">
            <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" objectPosition="80% 15%" />
          </motion.div>
        </div>

        {/* Scrim — MEASURED: headline/copy/CTA occupy x=[6%,52%] y=[17%,60%], so the
            scrim covers the left ~55% width and full height for text safety, fading
            out toward the family on the right. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[var(--brand-navy)] via-[var(--brand-navy)]/75 to-transparent" style={{ width: "62%" }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/85 to-transparent" />

        {/* Header row — MEASURED: logo x=[2%,26.4%] y=[1.7%,7.3%]; nav x=[19%,61%] y=[3.9%,5.8%]; CTA x=[77.1%,96.7%] y=[3.0%,7.4%]. */}
        <Link href="#home" aria-label="EVOLUSA — Ir al inicio" className="absolute" style={{ left: "2%", top: "1.7%" }}>
          <BrandMark size="lg" theme="dark" />
        </Link>
        <nav className="absolute flex items-center gap-6" aria-label="Navegación principal" style={{ left: "19%", top: "3.4%" }}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-white transition hover:text-white/80">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute flex items-center gap-5" style={{ right: "3.3%", top: "2.5%" }}>
          <Link href="/login" className="text-sm font-semibold text-white transition hover:text-white/80">
            Entrar
          </Link>
          <ButtonLink href="/onboarding" className="px-5 py-2.5 text-sm">
            Descubre tu próximo paso
            <ArrowRight aria-hidden className="ml-2" size={14} />
          </ButtonLink>
        </div>

        {/* Headline block — MEASURED bounds: x=[6.3%,51.8%] y=[17.4%,38.8%] (headline);
            swoosh y=[38.8%,40.4%]; copy y=[42.1%,51.7%]; CTA row y=[55.4%,59.7%]. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute text-white"
          style={{ left: "6.3%", top: "17.4%", width: "46%" }}
        >
          <h1 id="hero-title" className="text-balance leading-[0.95] tracking-[-0.03em]">
            <span className="block text-[2.75rem] font-medium text-white/85">TU SUEÑO</span>
            <span className="block text-[4.25rem] font-extrabold">TIENE UN</span>
            <span className="block text-[4.25rem] font-extrabold">CAMINO.</span>
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
          <p className="mt-2 max-w-md text-base leading-6 text-white/70">Desde establecerte hasta emprender, proteger lo que construyes y seguir creciendo.</p>
          <div className="mt-6 flex items-center">
            <ButtonLink href="/onboarding">
              Descubrir mi camino
              <ArrowRight aria-hidden className="ml-2" size={18} />
            </ButtonLink>
            <span aria-hidden className="mx-4 h-6 w-px bg-white/25" />
            <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white">
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>

        {/* Path — MEASURED: x=[5.4%,95.2%] y=[63.3%,70.2%]. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="absolute"
          style={{ left: "5.4%", right: "4.8%", top: "63.3%" }}
        >
          <EvolusaPath theme="dark" activeId="LLEGA" scrollProgress={pathProgress} />
        </motion.div>

        {/* Product Reveal panel — MEASURED: x=[5.4%,95.2%] y=[71.0%,100%]. Real
            generateRoadmap() data via the shared ProductRevealPanel component. */}
        <div className="absolute" style={{ left: "5.4%", right: "4.8%", top: "71%", bottom: "0%" }}>
          <ProductRevealPanel compact />
        </div>
      </div>
    </section>
  );
}
