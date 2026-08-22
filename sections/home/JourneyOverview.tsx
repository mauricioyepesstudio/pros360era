"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import EvolusaPath from "@/components/evolusa/EvolusaPath";
import PhotoSlot from "@/components/evolusa/PhotoSlot";
import { journeyStages } from "@/data/journey/stages";
import { stagePhotoSlot } from "@/data/photography/slots";
import { cn } from "@/lib/cn";

export default function JourneyOverview() {
  return (
    <Section id="journey" labelledBy="journey-title">
      <Heading id="journey-title" eyebrow="EVOLUSA Journey">Un camino que crece contigo</Heading>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">Desde que llegas hasta donde quieres llegar. Empieza en cualquier etapa.</p>
      <div className="mt-14 sm:mt-16">
        <EvolusaPath />
      </div>

      <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
        {journeyStages.map((stage, index) => {
          const reversed = index % 2 === 1;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={cn("grid items-center gap-8 lg:grid-cols-2 lg:gap-14", reversed && "lg:[&>*:first-child]:order-2")}
            >
              <PhotoSlot id={stagePhotoSlot[stage.id]} tone={index % 2 === 0 ? "navy" : "blue"} className="w-full rounded-[1.25rem]" />
              <div>
                <span className="text-sm font-bold text-[var(--brand-blue)]">{String(stage.order).padStart(2, "0")}</span>
                <h3 className="mt-3 text-3xl font-bold text-[var(--brand-navy)] sm:text-4xl">{stage.shortLabel}</h3>
                <p className="mt-3 max-w-md leading-7 text-[var(--muted)]">{stage.primaryGoal}</p>
                <Link href="#stage-selector" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]">
                  {stage.cta.label}
                  <ArrowRight aria-hidden className="ml-2" size={16} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
