import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { howItWorksSteps } from "@/data/home/sections";

export default function HowItWorks() {
  return <Section id="how-it-works" labelledBy="how-it-works-title"><Heading id="how-it-works-title" eyebrow="Cómo funciona">De la incertidumbre a una acción clara</Heading><ol className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{howItWorksSteps.map((step) => <li key={step.number} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-7"><span className="text-sm font-bold text-[var(--brand-gold-strong)]">{step.number}</span><h3 className="mt-5 text-xl font-bold text-[var(--brand-navy)]">{step.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{step.description}</p></li>)}</ol></Section>;
}
