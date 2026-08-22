"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const navigation = [
  { label: "Etapas", href: "#stage-selector" },
  { label: "Journey", href: "#journey" },
  { label: "Servicios", href: "#stage-services" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Confianza", href: "#trust" },
  { label: "Preguntas", href: "#faq" },
] as const;

/**
 * Floating overlay nav over the Hero photograph (fixed, not sticky — sticky
 * reserves its own height and would push Hero down; fixed lets Hero render
 * full-bleed from y=0 underneath it). Transparent + white text at the top of
 * the page; switches to the original opaque/blurred white bar + navy text
 * once scrolled, for contrast over ordinary content sections.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-slate-200/70 bg-[rgba(252,252,249,0.88)] backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      {!scrolled && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      )}
      <Container className="flex min-h-24 items-center justify-between gap-4">
        <Link href="#home" aria-label="EVOLUSA — Ir al inicio" className="shrink-0">
          <BrandMark size="lg" theme={scrolled ? "light" : "dark"} />
        </Link>
        <nav className="hidden items-center gap-7 xl:flex" aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-sm font-medium transition", scrolled ? "text-[var(--brand-navy)] hover:text-[var(--brand-blue)]" : "text-white hover:text-white/80")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-5 sm:flex">
          <Link href="/login" className={cn("text-sm font-semibold transition", scrolled ? "text-[var(--brand-navy)] hover:text-[var(--brand-blue)]" : "text-white hover:text-white/80")}>
            Entrar
          </Link>
          <ButtonLink href="/onboarding" className="px-5">
            Descubre tu próximo paso
            <ArrowRight aria-hidden className="ml-2" size={16} />
          </ButtonLink>
        </div>
        <details className="relative xl:hidden">
          <summary
            className={cn(
              "flex size-11 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden",
              scrolled ? "border-slate-300/80 bg-white/70 text-[var(--brand-navy)]" : "border-white/40 bg-white/10 text-white",
            )}
            aria-label="Abrir navegación"
          >
            <Menu aria-hidden size={21} />
          </summary>
          <nav className="absolute right-0 top-14 w-[min(18rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--warm-canvas)] p-4 shadow-[var(--shadow-md)]" aria-label="Navegación móvil">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-[var(--radius-md)] px-4 py-3 font-medium text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="block rounded-[var(--radius-md)] px-4 py-3 font-medium text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
                  Entrar
                </Link>
              </li>
            </ul>
            <ButtonLink href="/onboarding" className="mt-3 w-full">
              Descubre tu próximo paso
            </ButtonLink>
          </nav>
        </details>
      </Container>
    </header>
  );
}
