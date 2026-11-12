import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BarChart3, Bot, BriefcaseBusiness, CheckCircle2,
  CircleDollarSign, ClipboardList, Globe2, Handshake, LockKeyhole,
  Megaphone, ShieldCheck, Users,
} from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import { brand } from "@/config/brand";
import {
  growthCapabilities, growthMarkets, buildGrowthInquiryUrl,
} from "@/lib/growth-engine/catalog";

export const metadata: Metadata = {
  title: "Growth Engine | Crecimiento para cada industria | EVOLUSA",
  description:
    "Una oficina comercial digital para negocios y profesionales: captación, ARM, presencia digital y módulos por industria. Conoce los pilotos y servicios en desarrollo.",
  robots: { index: true, follow: true },
};

const core = [
  { icon: Globe2, title: "Presencia profesional", text: "Un sitio, perfil y propuesta claros para que tus próximos clientes te encuentren." },
  { icon: Users, title: "Oportunidades y ARM", text: "Cada negocio gestiona sus propios contactos y oportunidades con seguimiento y permisos." },
  { icon: Megaphone, title: "Marketing y contenido", text: "Campañas y calendario adaptados al cliente, su mercado y las cuentas que autorice." },
  { icon: BarChart3, title: "Crecimiento medible", text: "Diferenciar solicitudes, citas, clientes, ingresos reales y costos. Sin números ficticios." },
] as const;

export default function GrowthEnginePage() {
  const pilots = growthMarkets.filter((market) => market.partnerStatus === "pilot").length;
  const planned = growthCapabilities.filter((c) => c.readiness === "planned").length;
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white pt-24 text-[var(--brand-navy)]">
        <section className="bg-[var(--brand-navy)] px-5 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff8594]">
              EVOLUSA · Para empresas y profesionales
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.06] sm:text-6xl">
              Tu empresa. Tu mercado. Un motor de crecimiento a tu medida.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/85">
              Growth Engine reúne presencia digital, captación, gestión de clientes y
              oportunidades para ayudarte a construir un proceso comercial medible.
              Adaptamos cada implementación a tu industria; no vendemos promesas de ingresos.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#industrias"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-6 font-bold text-white transition hover:bg-[#bd0c23]"
              >
                Explorar industrias <ArrowRight size={18} aria-hidden="true" />
              </a>
              <Link href="/aplicar-profesional" className="inline-flex min-h-12 items-center rounded-full border border-white/65 px-6 font-bold hover:bg-white/10">
                Unirme como profesional
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/65">
              {pilots} áreas con profesionales piloto · {growthMarkets.length} industrias en el catálogo · {planned} capacidades en desarrollo
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="motor-title">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand-red)]">Una base, múltiples especialidades</p>
          <h2 id="motor-title" className="mt-3 text-3xl font-bold sm:text-4xl">El motor común de cada negocio</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {core.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-xl border border-[var(--border)] p-7">
                <Icon className="text-[var(--brand-red)]" size={30} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="industrias" className="scroll-mt-28 bg-[var(--surface-subtle)] px-5 py-20" aria-labelledby="verticals-title">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand-red)]">Mercados por desarrollar</p>
            <h2 id="verticals-title" className="mt-3 text-3xl font-bold sm:text-4xl">Crecimiento adaptado a tu sector</h2>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
              Los sectores piloto tienen profesionales públicos en EvolUSA. En las demás industrias
              estamos incorporando aliados; no presentamos proveedores ni servicios futuros como operativos.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {growthMarkets.map((market) => {
                const inquiry = buildGrowthInquiryUrl(market.id, brand.whatsapp.href);
                return (
                  <article key={market.id} id={market.id} className="flex scroll-mt-28 flex-col rounded-xl border border-[var(--border)] bg-white p-6">
                    <div className="flex items-start justify-between gap-3">
                      <BriefcaseBusiness className="text-[var(--brand-red)]" size={28} aria-hidden="true" />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {market.partnerStatus === "pilot" ? "Profesionales piloto" : "Buscamos aliados"}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{market.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{market.audience}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {market.examples.map((example) => (
                        <li key={example} className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold">{example}</li>
                      ))}
                    </ul>
                    {market.regulatoryNote && (
                      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                        <ShieldCheck className="mr-1 inline align-text-bottom" size={14} aria-hidden="true" />
                        {market.regulatoryNote}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-3 pt-6">
                      {inquiry && (
                        <a href={inquiry} target="_blank" rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-4 text-sm font-bold text-white hover:opacity-90">
                          Consultar solución <ArrowRight size={16} aria-hidden="true" />
                        </a>
                      )}
                      {market.partnerStatus === "pilot" && (
                        <Link href={`/servicios-miami#sector-${market.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold underline underline-offset-4">
                          Ver profesionales
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="modules-title">
          <h2 id="modules-title" className="text-3xl font-bold sm:text-4xl">Tecnología que crece por etapas</h2>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
            Las etiquetas distinguen funciones en piloto de capacidades que requieren más desarrollo.
            Ninguna función piloto garantiza que un canal externo o una integración estén conectados para cada empresa.
          </p>
          <div className="mt-9 grid gap-3 md:grid-cols-2">
            {growthCapabilities.map((capability) => (
              <div key={capability.id} className="flex gap-3 rounded-lg border border-[var(--border)] p-5">
                {capability.readiness === "pilot"
                  ? <CheckCircle2 size={22} className="shrink-0 text-[var(--brand-red)]" aria-hidden="true" />
                  : <ClipboardList size={22} className="shrink-0 text-slate-500" aria-hidden="true" />}
                <div>
                  <p className="font-bold">{capability.name} <span className="ml-1 text-xs font-normal text-[var(--muted)]">· {capability.readiness === "pilot" ? "Piloto" : "Por implementar"}</span></p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{capability.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--brand-navy)] px-5 py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#ff8594]">Empezar bien</p>
              <h2 className="mt-2 text-3xl font-bold">Cada empresa conserva sus cuentas y sus clientes.</h2>
              <p className="mt-3 max-w-2xl text-white/80">
                Configuramos permisos, campañas y seguimiento por organización. No cruzamos datos
                entre clientes ni publicamos en perfiles de terceros sin autorización.
              </p>
            </div>
            <a href={brand.whatsapp.href} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-6 font-bold text-white hover:opacity-90">
              Hablar sobre mi empresa <ArrowRight size={18} aria-hidden="true"/>
            </a>
          </div>
          <div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-5 text-sm text-white/75">
            <span className="inline-flex items-center gap-2"><LockKeyhole size={16} aria-hidden="true" /> Datos por negocio</span>
            <span className="inline-flex items-center gap-2"><Handshake size={16} aria-hidden="true" /> Aliados autorizados</span>
            <span className="inline-flex items-center gap-2"><CircleDollarSign size={16} aria-hidden="true" /> Ingresos verificados</span>
            <span className="inline-flex items-center gap-2"><Bot size={16} aria-hidden="true" /> IA supervisada</span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
