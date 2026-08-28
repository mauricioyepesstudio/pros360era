"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
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
 *
 * Mobile nav is a full-screen dark-navy takeover (matching the approved
 * mobile reference) rather than a small dropdown card — real React state
 * (not native <details>) so it can own its own logo/close row and lock
 * body scroll while open.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Threshold used to be a flat 40px, which assumed the Hero was always
    // short. Once the desktop HeroArtboard became a full-viewport-width,
    // aspect-ratio-locked composition (often taller than one screen), 40px
    // made this header's opaque white bar appear while still deep inside
    // the Hero photo, floating over HeroArtboard's own nav. Basing it on
    // #home's actual rendered bottom edge keeps this header hidden until
    // the Hero (mobile or desktop) has genuinely scrolled out of view.
    const onScroll = () => {
      const hero = document.getElementById("home");
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 40;
      setScrolled(pastHero);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled && !menuOpen ? "border-b border-slate-200/70 bg-[rgba(252,252,249,0.88)] backdrop-blur-xl" : "border-b border-transparent bg-transparent",
        // The transparent/floating state is rendered by HeroArtboard on
        // desktop instead (measured-coordinate header inside the artboard);
        // this header only needs to appear on desktop once scrolled past it.
        !scrolled && "lg:hidden",
      )}
    >
      {!scrolled && !menuOpen && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      )}
      <Container className="flex min-h-24 items-center justify-between gap-4">
        <Link href="#home" aria-label="EVOLUSA — Ir al inicio" className="relative z-10 shrink-0">
          <BrandMark size="lg" theme={scrolled && !menuOpen ? "light" : "dark"} />
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

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={menuOpen}
          className={cn(
            "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full xl:hidden",
            menuOpen ? "text-white" : scrolled ? "border border-slate-300/80 bg-white/70 text-[var(--brand-navy)]" : "border border-white/40 bg-white/10 text-white",
          )}
        >
          {menuOpen ? <X aria-hidden size={24} /> : <Menu aria-hidden size={21} />}
        </button>
      </Container>

      {menuOpen && (
        <nav
          className="fixed inset-0 z-0 flex flex-col overflow-y-auto bg-[var(--brand-navy)] px-6 pb-10 pt-28 xl:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMenuOpen(false)} className="block py-3 text-xl font-semibold text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/10 pt-6">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-lg font-semibold text-white">
              Entrar
            </Link>
          </div>
          <ButtonLink href="/onboarding" onClick={() => setMenuOpen(false)} className="mt-4 w-full justify-center">
            Descubre tu próximo paso
            <ArrowRight aria-hidden className="ml-2" size={16} />
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
