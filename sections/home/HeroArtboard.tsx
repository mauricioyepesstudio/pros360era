import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Home hero. Owner rules (3-nov): photos edge to edge, never cropped, never
 * in containers, never repeated. The photo keeps its full 3:2 frame; on
 * desktop the copy sits over the open water on the left (the family is on
 * the right), on phones it goes below the photo on navy.
 *
 * Copy rules: no regulated services in the subline, "perfil aprobado por
 * EVOLUSA" (never "verificado"), no promised outcomes.
 */
export default function HeroArtboard() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative bg-[var(--brand-navy)] text-white">
      <div className="relative aspect-[3/2] w-full">
        <Image
          src="/images/hero/hero-family-2x.webp"
          alt="Una familia hispana frente a la bahía de Miami al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-[var(--brand-navy)]/90 via-[var(--brand-navy)]/45 via-45% to-transparent to-65% lg:block" />
      </div>

      <div className="px-5 py-12 lg:absolute lg:inset-0 lg:flex lg:items-center lg:px-[clamp(2rem,6vw,7rem)] lg:py-10">
        <div className="max-w-[540px]">
          <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[#ff7a87]">
            <span aria-hidden className="h-[3px] w-8 rounded-full bg-current" />
            Florida · en español
          </p>
          <h1 id="hero-title" className="mt-4 text-balance text-[2.2rem] font-bold leading-[1.12] tracking-[-0.02em] sm:text-[2.75rem] xl:text-[3.25rem]">
            Tu vida en EE.&nbsp;UU., paso a paso, con un profesional a tu lado.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/90">
            Te mostramos tu camino en 6 etapas: qué hacer ahora y qué sigue. En cada paso te conectamos con un profesional en Florida que habla tu idioma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" data-tour="hero-busco" className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-full text-center sm:w-auto bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Soy usuario · Empezar gratis <ArrowRight aria-hidden size={18} />
            </Link>
            <Link href="/aplicar-profesional" data-tour="hero-path" className="inline-flex min-h-14 w-full min-w-0 items-center justify-center rounded-full px-5 text-center sm:w-auto font-bold text-white ring-2 ring-inset ring-white/70 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Soy profesional · Solicitar mi perfil
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90">
            <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Empiezas gratis</li>
            <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Cada profesional con perfil aprobado por EVOLUSA</li>
            <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Todo en español</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
