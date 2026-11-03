import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Home hero (owner-approved mockup v6, 3-nov): one full-bleed photo, no
 * framed/shaped photos, white type over a navy scrim on the left. On phones
 * the photo sits on top and the copy below it on navy, so text never covers
 * faces.
 *
 * Copy rules: no regulated services in the subline, "perfil aprobado por
 * EVOLUSA" (never "verificado"), no promised outcomes.
 */
export default function HeroArtboard() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden bg-[var(--brand-navy)] text-white md:flex md:min-h-[min(88vh,820px)] md:items-center">
      <div className="relative h-[340px] md:absolute md:inset-0 md:h-auto">
        <Image
          src="/images/hero/hero-family-2x.webp"
          alt="Una familia hispana frente a la bahía de Miami al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center] md:object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-[var(--brand-navy)] md:bg-gradient-to-r md:from-[var(--brand-navy)]/85 md:from-0% md:via-[var(--brand-navy)]/55 md:via-40% md:to-transparent md:to-70%" />
      </div>

      <div className="relative mx-auto -mt-10 w-full max-w-[1200px] px-5 pb-12 md:mt-0 md:py-20">
        <div className="max-w-[600px]">
          <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em]">
            <span aria-hidden className="h-[3px] w-8 rounded-full bg-[var(--brand-red)]" />
            Florida · en español
          </p>
          <h1 id="hero-title" className="mt-4 text-balance text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[4.2rem]">
            Tu vida en EE.&nbsp;UU.,{" "}
            <span className="underline decoration-[var(--brand-red)] decoration-[0.11em] underline-offset-[0.14em] [text-decoration-skip-ink:none]">paso a paso</span>
            , con un profesional a tu lado.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/90">
            Te mostramos tu camino en 6 etapas: qué hacer ahora y qué sigue. En cada paso te conectamos con un profesional en Florida que habla tu idioma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#como-funciona" data-tour="hero-busco" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Empezar gratis <ArrowRight aria-hidden size={18} />
            </Link>
            <Link href="#journey" data-tour="hero-path" className="inline-flex min-h-14 items-center rounded-full px-7 font-bold text-white ring-2 ring-inset ring-white/70 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explorar las 6 etapas
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90">
            <li><span aria-hidden className="mr-1.5 font-black text-[var(--brand-red)]">✓</span>Empiezas gratis</li>
            <li><span aria-hidden className="mr-1.5 font-black text-[var(--brand-red)]">✓</span>Cada profesional con perfil aprobado por EVOLUSA</li>
            <li><span aria-hidden className="mr-1.5 font-black text-[var(--brand-red)]">✓</span>Todo en español</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
