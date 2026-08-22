import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Section from "@/components/ui/Section";

export default function CTA() {
  return (
    <Section id="contact" className="bg-[var(--background)]">
      <div className="rounded-[var(--radius-lg)] bg-[var(--brand-navy)] px-6 py-14 text-center text-white shadow-[var(--shadow-md)] sm:px-10 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-on-dark)]">Empieza desde donde estás</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-5xl">
          Tu próximo paso puede comenzar hoy.
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/onboarding">
            Descubre mi camino
            <ArrowRight aria-hidden className="ml-2" size={18} />
          </ButtonLink>
          <ButtonLink href="#roadmap" variant="secondary" className="border-white/20">
            Conocer el Roadmap
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
