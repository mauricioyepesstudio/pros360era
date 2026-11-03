import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import BleedQuote from "@/sections/home/BleedQuote";
import Footer from "@/sections/home/Footer";

export const metadata: Metadata = {
  title: "EVOLUSA para profesionales",
  description: "Tu página profesional, tus redes, un CRM para tus clientes y solicitudes de hispanos en Florida que buscan tu servicio.",
};

/**
 * Pro landing (owner-approved mockup v6, 3-nov). Only tools that exist in
 * the professional panel today. No promised number of clients; paying never
 * changes ranking or approval; "perfil aprobado", never "verificado".
 */
const stagesForPros = [
  { label: "Llega", tag: "Documentos" },
  { label: "Establécete", tag: "Notaría" },
  { label: "Emprende", tag: "Operaciones" },
  { label: "Protégete", tag: "Notaría" },
  { label: "Crece", tag: "Marketing" },
  { label: "Evoluciona", tag: null },
] as const;

function Eyebrow({ children, tone = "red" }: { children: string; tone?: "red" | "light" }) {
  return (
    <p className={`flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] ${tone === "red" ? "text-[var(--brand-red-strong)]" : "text-[#ff7a87]"}`}>
      <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />
      {children}
    </p>
  );
}

const rowLine = "flex items-center justify-between gap-3 border-b border-[var(--border)] py-3.5 text-sm";
const pill = "shrink-0 rounded-full px-3 py-0.5 text-xs font-bold";

const features = [
  {
    title: "Oportunidades de tu nicho",
    body: "Personas en la etapa exacta en que te necesitan. Llegan con lo que buscan, su zona y su idioma.",
    ui: (
      <div className="border-t-2 border-[var(--brand-navy)]">
        <div className={rowLine}><span className="truncate">Notarizar un poder · Hialeah · español</span><span className={`${pill} bg-[var(--brand-red-strong)] text-white`}>Nueva</span></div>
        <div className={rowLine}><span className="truncate">Ordenar documentos · Doral · español</span><span className={`${pill} bg-[var(--brand-red-strong)] text-white`}>Nueva</span></div>
        <div className={rowLine}><span className="truncate">Organizar mi negocio · Kendall</span><span className={`${pill} bg-[var(--brand-navy)] text-white`}>Respondida</span></div>
      </div>
    ),
  },
  {
    title: "Tu perfil profesional",
    body: "Una página con tus servicios, tu zona y tus idiomas. La revisamos antes de publicarla como perfil aprobado.",
    ui: (
      <div>
        <div className="flex flex-wrap items-center gap-3.5 border-y border-[var(--border)] border-t-2 border-t-[var(--brand-navy)] py-4">
          <span aria-hidden className="grid size-[54px] place-items-center rounded-full bg-[var(--brand-blue)] font-extrabold text-white">TN</span>
          <span><span className="block font-bold text-[var(--brand-navy)]">Tu nombre · Notaría</span><span className="text-sm text-[var(--muted)]">Miami-Dade · Español e inglés</span></span>
          <span className={`${pill} ml-auto bg-[#e7f6ec] text-[#1d6b3a]`}>Perfil aprobado</span>
        </div>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-[var(--brand-navy)]">
          <span><span aria-hidden className="text-[var(--brand-red)]">— </span>Poderes</span>
          <span><span aria-hidden className="text-[var(--brand-red)]">— </span>Declaraciones juradas</span>
          <span><span aria-hidden className="text-[var(--brand-red)]">— </span>A domicilio</span>
        </p>
      </div>
    ),
  },
  {
    title: "Tu CRM de clientes",
    body: "Cada contacto y en qué va, sin hojas de cálculo ni mensajes perdidos.",
    ui: (
      <div className="grid grid-cols-3 gap-6 border-t-2 border-[var(--brand-navy)] pt-3.5 text-sm">
        {[["Nuevo", ["Ana R.", "Luis P."]], ["En curso", ["Carla M."]], ["Cliente", ["José T.", "Rosa V."]]].map(([col, names]) => (
          <div key={col as string}>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{col as string}</p>
            {(names as string[]).map((n) => <p key={n} className="border-b border-[var(--border)] py-1.5">{n}</p>)}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Tus redes, planeadas y publicadas",
    body: "Planeamos tu semana y, con tus cuentas conectadas, tus publicaciones salen en Instagram y LinkedIn.",
    ui: (
      <div className="grid grid-cols-5 gap-2.5 border-t-2 border-[var(--brand-navy)] pt-3.5 text-center text-xs font-semibold">
        {[["Lun", "ig"], ["Mar", "li"], ["Mié", ""], ["Jue", "ig"], ["Vie", "li"]].map(([d, k]) => (
          <div key={d}>{d}<span aria-hidden className={`mt-2 block h-11 rounded-lg ${k === "ig" ? "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" : k === "li" ? "bg-[#0a66c2]" : "bg-[var(--border)]"}`} /></div>
        ))}
      </div>
    ),
  },
  {
    title: "Ves qué te funciona",
    body: "Visitas a tu perfil, mensajes y publicaciones, mes a mes.",
    ui: (
      <div className="border-t-2 border-[var(--brand-navy)] pt-4">
        <div aria-hidden className="flex h-28 items-end gap-2.5">
          {[30, 42, 38, 58, 66, 84].map((h, i) => <span key={i} className={`flex-1 rounded-t ${i > 3 ? "bg-[var(--brand-red)]" : "bg-[var(--brand-navy)]"}`} style={{ height: `${h}%` }} />)}
        </div>
        <p className="mt-2.5 text-xs text-[var(--muted)]">Ejemplo ilustrativo, no son datos reales.</p>
      </div>
    ),
  },
];

export default function ParaProfesionalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section aria-labelledby="pro-hero-title" className="grid bg-[var(--brand-navy)] text-white lg:min-h-[37.5vw] lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto">
            <Image src="/images/journey/achievement.jpg" alt="Una profesional sonríe con los brazos cruzados frente a la ciudad" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex items-center px-5 py-12 lg:px-[clamp(2rem,5vw,6rem)] lg:py-10">
            <div className="max-w-[560px]">
              <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[#ff7a87]"><span aria-hidden className="h-[3px] w-8 rounded-full bg-current" />Para profesionales en Florida</p>
              <h1 id="pro-hero-title" className="mt-4 text-[2.2rem] font-bold leading-[1.12] tracking-[-0.02em] sm:text-[2.75rem] xl:text-[3.25rem]">
                Tú atiendes.<br />Nosotros te traemos los clientes.
              </h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/90">Al registrarte recibes tu página profesional, tus redes planeadas, un CRM para tus clientes y solicitudes de hispanos que ya buscan lo que tú haces.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/aplicar-profesional" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]">Aplicar en 5 minutos <ArrowRight aria-hidden size={18} /></Link>
                <Link href="#lo-que-recibes" className="inline-flex min-h-14 items-center rounded-full px-7 font-bold text-white ring-2 ring-inset ring-white/70 transition hover:bg-white/10">Ver lo que recibes</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90">
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Un nicho definido</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Todo en un panel</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Español primero</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="lo-que-recibes" aria-labelledby="kit-title" className="scroll-mt-24 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-5">
            <Eyebrow>Lo que recibes al registrarte</Eyebrow>
            <h2 id="kit-title" className="mt-3 text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">Tu oficina digital, completa.</h2>
            <p className="mt-4 max-w-[58ch] text-lg text-[var(--muted)]">Cinco herramientas que hoy tendrías que buscar por separado, en un solo panel y pensadas para atender a la comunidad hispana.</p>
            <ol className="mt-14">
              {features.map((feature, index) => (
                <li key={feature.title} className="grid items-center gap-4 border-t border-[var(--border)] py-11 last:border-b md:grid-cols-[90px_1fr_1.05fr] md:gap-10">
                  <span aria-hidden className="text-5xl font-extrabold leading-none text-[var(--brand-red)]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">{feature.title}</h3>
                    <p className="mt-2.5 max-w-[44ch] text-[16.5px] text-[var(--muted)]">{feature.body}</p>
                  </div>
                  <div aria-hidden className="text-[var(--brand-navy)]">{feature.ui}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="why-title" className="bg-[var(--brand-navy)] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-[1200px] px-5">
            <Eyebrow tone="light">Por qué funciona</Eyebrow>
            <h2 id="why-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">Te encuentran justo en la etapa en que te necesitan.</h2>
            <p className="mt-4 max-w-[58ch] text-lg text-white/85">Cada persona en EVOLUSA sigue su camino de 6 etapas. Cuando llega al paso que tú resuelves, apareces tú.</p>
            <ol className="relative mt-14 grid grid-cols-3 gap-y-7 sm:grid-cols-6 sm:gap-y-0">
              <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-[33px] hidden h-1 bg-white/20 sm:block" />
              {stagesForPros.map((stage, index) => (
                <li key={stage.label} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                  <span aria-hidden className={`grid size-14 place-items-center rounded-full border-[3px] text-lg font-extrabold sm:size-[70px] sm:text-xl ${stage.tag ? "border-[var(--brand-red)] bg-[var(--brand-red)]" : "border-white/35 bg-[var(--brand-navy)]"}`}>{index + 1}</span>
                  <span className="mt-1.5 text-[15px] font-bold">{stage.label}</span>
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#ff7a87]">{stage.tag ?? "Su siguiente meta"}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <BleedQuote src="/images/journey/growth.jpg" alt="Un dueño de negocio trabaja en su laptop en su taller" photoSide="right" quote="Tus clientes hablan español y buscan en el celular. Que te encuentren a ti." cite="Por qué EVOLUSA y no un directorio cualquiera" />

        <section aria-labelledby="apply-title" className="border-t-[6px] border-[var(--brand-red)] bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1200px] items-end gap-10 px-5 md:grid-cols-[1.2fr_1fr] md:gap-14">
            <div>
              <Eyebrow>Aplica hoy</Eyebrow>
              <h2 id="apply-title" className="mt-3 text-4xl font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">Aplica en <span className="text-[var(--brand-red)]">5 minutos</span>.</h2>
              <p className="mt-4 text-lg text-[var(--muted)]">Revisamos tu perfil y te avisamos por correo.</p>
              <Link href="/aplicar-profesional" className="mt-10 inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]">Aplicar como profesional <ArrowRight aria-hidden size={18} /></Link>
            </div>
            <ol className="border-t-2 border-[var(--brand-navy)] text-[var(--brand-navy)]">
              {["Llenas tu solicitud", "Revisamos tu perfil", "Publicamos tu perfil aprobado"].map((item, index) => (
                <li key={item} className="flex items-baseline gap-5 border-b border-[var(--border)] py-4 text-[17px] font-semibold">
                  <span aria-hidden className="text-2xl font-extrabold text-[var(--brand-red)]">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
            <p className="max-w-[84ch] text-[12.5px] leading-5 text-[var(--muted)] md:col-span-2">No prometemos un número de clientes. Revisamos cada perfil antes de publicarlo como perfil aprobado; eso no es una verificación de identidad. Ningún pago cambia tu posición ni tu aprobación. Hoy recibimos marketing, operaciones de negocio, notaría y preparación documental, en Florida.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
