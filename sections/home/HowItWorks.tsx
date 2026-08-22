"use client";

import { motion } from "framer-motion";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { howItWorksSteps } from "@/data/home/sections";

/**
 * A visual process, not a four-column text grid — a single connecting line
 * (desktop) that draws in on scroll, steps revealing in sequence rather than
 * all at once.
 */
export default function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-it-works-title">
      <Heading id="how-it-works-title" eyebrow="Cómo funciona">De la incertidumbre a una acción clara</Heading>

      <div className="relative mt-14 grid gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 xl:grid-cols-4">
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-x-0 top-4 hidden h-px origin-left bg-[var(--border)] xl:block"
        />
        {howItWorksSteps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
            className="relative"
          >
            <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
              {step.number.replace(/^0/, "")}
            </span>
            <h3 className="mt-4 text-xl font-bold text-[var(--brand-navy)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
