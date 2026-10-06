"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const navigation = [
  { label: "Etapas", href: "#stage-selector" },
  { label: "¿Cómo funciona?", href: "#como-funciona" },
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
    // Use the visible hero to switch contrast; interior pages use the light header.
    const onScroll = () => {
      const candidates = document.querySelectorAll<HTMLElement>("#home");
      const hero = Array.from(candidates).find((el) => el.getClientRects().length > 0);
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : true;
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
      )}
    >
      {!scrolled && !menuOpen && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      )}
      <Container className="flex min-h-24 items-center justify-between gap-4">
        <Link href="/#home" aria-label="EVOLUSA — Ir al inicio" className="relative z-10 shrink-0">
          <BrandMark size="lg" theme={scrolled && !menuOpen ? "light" : "dark"} />
        </Link>
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={`/${item.href}`}
              className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4", item.href === "#como-funciona" ? "bg-white text-[var(--brand-navy)] shadow-sm hover:bg-slate-100" : scrolled ? "text-[var(--brand-navy)] hover:text-[var(--brand-blue)]" : "text-white hover:text-white/80")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="relative z-10 ml-auto shrink-0" onKeyDown={(event) => { if (event.key === "Escape") event.currentTarget.open = false; }}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[var(--brand-navy)] shadow-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4"><span className="hidden sm:inline">Ya tengo cuenta</span><span className="sm:hidden">Entrar</span></summary>
          <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--brand-navy)] shadow-lg">
            <Link href="/login?next=%2Fdashboard" className="block rounded-lg px-3 py-3 font-semibold hover:bg-[var(--sky-surface)]">Soy usuario<span className="mt-1 block text-xs font-normal">Mi perfil y mi proceso</span></Link>
            <Link href="/login?next=%2Fdashboard%2Fprofessional" className="block rounded-lg px-3 py-3 font-semibold hover:bg-[var(--sky-surface)]">Soy profesional<span className="mt-1 block text-xs font-normal">Mi perfil y servicios</span></Link>
          </div>
        </details>

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
                <Link href={`/${item.href}`} onClick={() => setMenuOpen(false)} className="block py-3 text-xl font-semibold text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/10 pt-6">
            <Link href="/login?next=%2Fdashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-lg font-semibold text-white">Entrar como usuario</Link>
            <Link href="/login?next=%2Fdashboard%2Fprofessional" onClick={() => setMenuOpen(false)} className="block py-2 text-lg font-semibold text-white">Entrar como profesional</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
