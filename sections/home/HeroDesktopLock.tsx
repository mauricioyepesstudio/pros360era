import Image from "next/image";
import Link from "next/link";

/**
 * TEMPORARY desktop-only visual lock. The owner-approved reference image
 * already composites Header + Hero + EVOLUSA Path + Product Reveal into one
 * exact visual — repeated attempts to reconstruct that composition from
 * live components (crop/scale/position tuning) kept drifting from it. This
 * renders that approved image directly as the desktop visual layer and
 * layers real, invisible links on top at the same relative positions for
 * the interactive elements (nav, CTAs) — preserving actual navigation
 * without re-deriving the visual from scratch.
 *
 * All overlay positions are percentages of the image's own 1536×1024 frame,
 * so they track correctly regardless of rendered width, as long as the
 * wrapping element keeps that exact aspect ratio (enforced below).
 *
 * Mobile/tablet do NOT use this — see app/page.tsx, which keeps the real
 * functional Header/Hero/ProductReveal components below the `lg` breakpoint
 * until a dedicated mobile master exists.
 */
const navigation = [
  { label: "Etapas", href: "#stage-selector", left: 23.0, width: 4.6 },
  { label: "Journey", href: "#journey", left: 28.6, width: 4.8 },
  { label: "Servicios", href: "#stage-services", left: 34.8, width: 5.2 },
  { label: "Roadmap", href: "#roadmap", left: 41.2, width: 5.0 },
  { label: "Confianza", href: "#trust", left: 47.7, width: 6.0 },
  { label: "Preguntas", href: "#faq", left: 54.8, width: 6.0 },
] as const;

export default function HeroDesktopLock() {
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1536 / 1024" }}>
      <Image
        src="/images/hero/evolusa-hero-desktop-lock.png"
        alt="EVOLUSA — Tu sueño tiene un camino"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Functional overlays — real links, invisible, percentage-positioned. */}
      <Link href="#home" aria-label="EVOLUSA — Ir al inicio" className="absolute" style={{ left: "2.5%", top: "1%", width: "17%", height: "7%" }} />

      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="absolute"
          style={{ left: `${item.left}%`, top: "2.8%", width: `${item.width}%`, height: "4%" }}
        >
          <span className="sr-only">{item.label}</span>
        </Link>
      ))}

      <Link href="/login" className="absolute" style={{ left: "74%", top: "3.5%", width: "5%", height: "3.8%" }}>
        <span className="sr-only">Entrar</span>
      </Link>

      <Link href="/onboarding" className="absolute" style={{ left: "78.5%", top: "2%", width: "17%", height: "5.8%" }}>
        <span className="sr-only">Descubre tu próximo paso</span>
      </Link>

      <Link href="/onboarding" className="absolute" style={{ left: "6.5%", top: "56.4%", width: "16%", height: "3.9%" }}>
        <span className="sr-only">Descubrir mi camino</span>
      </Link>

      <Link href="/login" className="absolute" style={{ left: "23.8%", top: "56.8%", width: "10.4%", height: "2.5%" }}>
        <span className="sr-only">Ya tengo cuenta</span>
      </Link>
    </div>
  );
}
