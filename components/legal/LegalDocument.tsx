import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";

export type LegalSection = { title: string; body: ReactNode };

/** Plain, readable layout shared by /privacidad and /terminos. */
export default function LegalDocument({ eyebrow, title, updated, intro, sections }: { eyebrow: string; title: string; updated: string; intro: ReactNode; sections: readonly LegalSection[] }) {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <Section className="pt-32 sm:pt-40" labelledBy="legal-title">
          <Heading as="h1" id="legal-title" eyebrow={eyebrow}>
            {title}
          </Heading>
          <p className="mt-3 text-sm text-[var(--muted)]">Última actualización: {updated}</p>
          <div className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{intro}</div>
          <div className="mt-12 grid max-w-3xl gap-10">
            {sections.map((section, index) => (
              <section key={section.title} aria-labelledby={`legal-${index}`}>
                <h2 id={`legal-${index}`} className="text-xl font-bold text-[var(--brand-navy)]">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-3 space-y-3 leading-7 text-[var(--foreground)] [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-[var(--brand-blue)] [&_a]:underline">{section.body}</div>
              </section>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
