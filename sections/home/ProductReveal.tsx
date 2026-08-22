"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ProductRevealPanel from "./ProductRevealPanel";

/**
 * The Product Reveal — "TU PLAN EVOLUSA" — mobile/tablet (below `lg:`).
 * Desktop renders the same `ProductRevealPanel` content instead inside
 * `HeroArtboard.tsx`, positioned at coordinates measured directly from the
 * approved reference composition, not as an independently fluid section.
 */
export default function ProductReveal() {
  return (
    <section id="roadmap" className="bg-[var(--brand-navy)] px-6 pb-16 pt-6 sm:px-8 sm:pb-20 lg:hidden">
      <Container>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <ProductRevealPanel />
        </motion.div>
      </Container>
    </section>
  );
}
