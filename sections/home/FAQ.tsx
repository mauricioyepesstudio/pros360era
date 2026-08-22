import { ChevronDown } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { homeFaqs } from "@/data/home/faqs";

export default function FAQ() {
  return <Section id="faq" labelledBy="faq-title"><Heading id="faq-title" eyebrow="Preguntas frecuentes">Claridad antes de avanzar</Heading><p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">Respuestas directas sobre el producto, sus límites y cómo maneja tus próximos pasos.</p><div className="mt-10 max-w-4xl divide-y divide-[var(--border)] border-y border-[var(--border)]">{homeFaqs.map((faq) => <details key={faq.question} className="group py-2"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-semibold text-[var(--brand-navy)] [&::-webkit-details-marker]:hidden">{faq.question}<ChevronDown aria-hidden="true" className="shrink-0 text-[var(--brand-blue)] transition group-open:rotate-180" size={20} /></summary><p className="max-w-3xl pb-6 pr-10 leading-7 text-[var(--muted)]">{faq.answer}</p></details>)}</div></Section>;
}
