import { BadgeCheck, Landmark, Network } from "lucide-react";
import Heading from "@/components/ui/Heading";
import Section from "@/components/ui/Section";
import { trustPrinciples } from "@/data/home/sections";
import { disclaimers, fulfillmentTypes } from "@/data/compliance/claims";

const icons = [BadgeCheck, Network, Landmark];
export default function TrustAndTransparency() {
  const regulated = disclaimers.find((item) => item.id === "regulated-services")!;
  return <Section id="trust" labelledBy="trust-title" className="bg-[var(--surface-subtle)]"><Heading id="trust-title" eyebrow="Confianza y transparencia">Siempre sabes qué sigue y quién puede ayudarte</Heading><p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">EVOLUSA puede orientar, organizar próximos pasos y mostrar opciones activas. No es una agencia gubernamental ni sustituye asesoría profesional individualizada.</p><div className="mt-12 grid gap-6 lg:grid-cols-3">{trustPrinciples.map((principle, index) => { const Icon = icons[index]; return <article key={principle.title} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-7"><Icon aria-hidden="true" className="text-[var(--brand-gold-strong)]" size={28} /><h3 className="mt-5 text-xl font-bold text-[var(--brand-navy)]">{principle.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{principle.description}</p></article>; })}</div><div className="mt-8 grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="font-semibold text-[var(--brand-navy)]">Servicios y profesionales con contexto visible</p><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{regulated.full}</p></div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{fulfillmentTypes.length} tipos de fulfillment definidos</p></div></Section>;
}
