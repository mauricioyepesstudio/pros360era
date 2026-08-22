import Image from "next/image";
import Link from "next/link";

/**
 * TEMPORARY desktop-only visual lock.
 *
 * The approved 1536×1024 master is the desktop source of truth. At lg+
 * we render the WHOLE master inside the first viewport instead of scaling
 * it by width and letting the lower portion fall below the fold. This is
 * intentionally a visual lock: the live responsive reconstruction remains
 * the follow-up engineering task, while mobile/tablet continue using the
 * real components from app/page.tsx.
 *
 * All functional overlays use percentages of the master frame, so they
 * remain aligned when the master is fitted to the desktop viewport.
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
    <section className="relative h-[100svh] min-h-[720px] max-h-[1024px] w-full overflow-hidden bg-[#061B3A]">
      <div className="relative h-full w-full">
        <Image
          src="/images/hero/evolusa-hero-desktop-lock.png"
          alt="EVOLUSA — Tu sueño tiene un camino"
          fill
          priority
          sizes="100vw"
          className="object-fill"
        />

        {/* Functional overlays — real links aligned to the approved master. */}
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
    </section>
  );
}
