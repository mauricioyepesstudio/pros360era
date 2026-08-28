"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import EvolusaLogo from "@/components/brand/EvolusaLogo";
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
            <PhotoSlot id="hero" tone="luminous" priority className="h-full w-full" objectPosition="center" />
          </motion.div>
        </div>

        {/* Scrim — MEASURED: headline/copy/CTA occupy x=[6%,52%] y=[17%,60%], so the
            scrim covers the left ~55% width and full height for text safety, fading
            out toward the family on the right. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[var(--brand-navy)] via-[var(--brand-navy)]/75 to-transparent" style={{ width: "62%" }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[var(--brand-navy)] via-[var(--brand-navy)]/85 to-transparent" />

        {/* Header row — logo enlarged and nav given more top margin per owner
            direction ("navigation too small... do not make the nav tiny just
            because browser width is large"). */}
        {/* Wordmark only, no isotype — owner explicitly asked to drop the mark
            after seeing it. Sized up from the "app" preset (48px) since,
            without the icon+divider next to it, the wordmark alone needs more
            visual weight to read as a real logo rather than small nav text. */}
        <Link href="#home" aria-label="EVOLUSA — Ir al inicio" className="absolute" style={{ left: "2%", top: "3%" }}>
          <span className="inline-block origin-left" style={{ transform: "scale(1.3)" }}>
            <EvolusaLogo variant="reverse" size="app" />
          </span>
        </Link>
        <nav className="absolute flex items-center gap-7" aria-label="Navegación principal" style={{ left: "19%", top: "5.2%" }}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-base font-medium text-white transition hover:text-white/80">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute flex items-center gap-5" style={{ right: "3.3%", top: "3.8%" }}>
          <Link href="/login" className="text-base font-semibold text-white transition hover:text-white/80">
            Entrar
          </Link>
          <ButtonLink href="/onboarding" className="px-6 py-3 text-sm">
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
          style={{ left: "6.3%", top: "16%", width: "46%" }}
        >
          <h1 id="hero-title" className="text-balance leading-[0.95] tracking-[-0.03em]">
            <span className="block text-[3.25rem] font-light text-white/85">TU SUEÑO</span>
            <span className="block text-[4.75rem] font-extrabold">TIENE UN</span>
            <span className="block text-[4.75rem] font-extrabold">CAMINO.</span>
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
        <div id="roadmap-desktop" className="absolute" style={{ left: "5.4%", right: "4.8%", top: "71%", bottom: "0%" }}>
          <ProductRevealPanel compact />
        </div>
      </div>
    </section>
  );
}
