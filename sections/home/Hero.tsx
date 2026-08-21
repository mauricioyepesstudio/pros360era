import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import EvolusaPath from "@/components/evolusa/EvolusaPath";

/**
 * Abstract, editorial composition standing in for real photography (see
 * docs — the previous stock "happy family at sunset" image was replaced
 * deliberately; it read as generic multiservices stock, not the premium/
 * professional-optimism direction). This panel is self-contained and can
 * be swapped for real editorial photography later without touching layout.
 */
function HeroComposition() {
  return (
    <div aria-hidden className="relative hidden aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--brand-navy)] via-[#0c2740] to-[var(--brand-blue-strong)] lg:block">
      <div className="absolute -right-16 -top-16 size-72 rounded-full bg-[var(--brand-blue)]/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 size-64 rounded-full bg-[var(--brand-coral)]/15 blur-3xl" />
      <svg viewBox="0 0 320 400" className="absolute inset-0 size-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="60" y1="340" x2="260" y2="60" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
        {[
          { x: 60, y: 340, r: 6, fill: "white", opacity: 0.9 },
          { x: 100, y: 284, r: 5, fill: "white", opacity: 0.55 },
          { x: 140, y: 228, r: 5, fill: "white", opacity: 0.55 },
          { x: 180, y: 172, r: 5, fill: "white", opacity: 0.55 },
          { x: 220, y: 116, r: 5, fill: "white", opacity: 0.55 },
          { x: 260, y: 60, r: 7, fill: "#E63946", opacity: 1 },
        ].map((node, i) => (
          <circle key={i} cx={node.x} cy={node.y} r={node.r} fill={node.fill} opacity={node.opacity} />
        ))}
      </svg>
      <p className="absolute bottom-7 left-7 right-7 text-sm font-semibold uppercase tracking-[0.14em] text-white/60">Tu camino, en progreso</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden bg-[var(--brand-navy)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(23,92,211,0.22),transparent_60%)]" />
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-blue-on-dark)]">Bienvenido a tu próxima etapa</p>
          <h1 id="hero-title" className="mt-6 text-balance text-[clamp(2.5rem,6.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Llegaste a USA.
            <br />
            Ahora, <span className="text-[var(--brand-blue-on-dark)]">evoluciona</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">Construir una nueva vida tiene muchos pasos. EVOLUSA te ayuda a entender dónde estás, qué hacer ahora y cómo seguir avanzando con claridad.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/onboarding">
              Descubre tu camino
              <ArrowRight aria-hidden className="ml-2" size={18} />
            </ButtonLink>
            <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-white/90 underline decoration-white/40 underline-offset-4 transition hover:text-white hover:decoration-white">
              Ya tengo cuenta — continuar mi progreso
              <ArrowRight aria-hidden className="ml-2" size={16} />
            </Link>
          </div>
          <div className="mt-12 max-w-xl">
            <EvolusaPath theme="dark" />
          </div>
        </div>
        <HeroComposition />
      </Container>
    </section>
  );
}
