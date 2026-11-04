"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

const navigation = [
  { label: "Inicio", href: "/#home" },
  { label: "Cómo funciona", href: "/#journey" },
  { label: "Videos", href: "/#video" },
  { label: "Profesionales", href: "/para-profesionales" },
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
  // Always the solid white bar with the primary logo (mockup v6, 3-nov):
  // the hero photo starts below the header instead of behind it.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  // Signed in → one "Mi panel" button (/dashboard routes by role);
  // signed out → one "Ingresar" (the login page asks usuario/profesional).
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!getSupabaseEnv()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  const accountHref = signedIn ? "/dashboard" : "/login?next=%2Fdashboard";
  const accountLabel = signedIn ? "Mi panel" : "Ingresar";

  // Layout effect so the scroll lock is released in the same commit that
  // removes the mobile menu: a passive effect's cleanup can run after the
  // menu is already gone, leaving <html> at overflow:hidden for a moment.
  useLayoutEffect(() => {
    if (!menuOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    };

    root.style.overflow = "hidden";
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        !menuOpen ? "border-b border-slate-200/70 bg-white/95 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex min-h-24 max-w-none items-center justify-between gap-2 sm:gap-4 xl:px-[clamp(2rem,4vw,5rem)]">
        <Link href="/#home" aria-label="EVOLUSA — Ir al inicio" className="relative z-10 shrink-0">
          <BrandMark size="lg" theme={!menuOpen ? "light" : "dark"} className="[&_img]:!h-auto [&_img]:!w-24 xl:[&_img]:!h-10 xl:[&_img]:!w-auto" />
        </Link>
        <nav className="hidden items-center gap-5 xl:flex 2xl:gap-9" aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4", "text-[var(--brand-navy)] hover:text-[var(--brand-red-strong)]")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link aria-label="¿Cómo funciona?" href="/?tour=start" data-tour="hero-como-funciona" onClick={(event) => { if (window.location.pathname === "/") { event.preventDefault(); setMenuOpen(false); window.dispatchEvent(new Event("evolusa:start-tour")); } }} className="relative z-10 ml-auto hidden min-h-11 shrink-0 items-center justify-center rounded-full px-3 text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-red-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 sm:inline-flex"><span className="sm:hidden">Cómo funciona</span><span className="hidden sm:inline">¿Cómo funciona?</span></Link>
        {!signedIn && <Link href={accountHref} className="relative z-10 hidden min-h-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-navy)] px-5 text-sm font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 sm:inline-flex">{accountLabel}</Link>}
        <Link href={signedIn ? "/dashboard" : "/para-profesionales"} data-tour="hero-pro" className="relative z-10 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red-strong)] px-5 text-sm font-bold text-white hover:bg-[#a90016] focus-visible:outline-2 focus-visible:outline-offset-4 max-sm:ml-auto">{signedIn ? "Ir a mi panel" : "Soy profesional"}</Link>

        <button
          ref={menuToggleRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={menuOpen}
          className={cn(
            "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full xl:hidden",
            menuOpen ? "text-white" : "border border-slate-300/80 bg-white/70 text-[var(--brand-navy)]",
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
            {signedIn ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[var(--brand-navy)]">Mi panel</Link>
            ) : (
              <>
                <Link href="/login?next=%2Fdashboard" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-center rounded-full bg-[var(--role-member)] text-lg font-bold text-white">Ingresar como usuario</Link>
                <Link href="/login?next=%2Fdashboard%2Fprofessional" onClick={() => setMenuOpen(false)} className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-[var(--role-pro)] text-lg font-bold text-white">Ingresar como profesional</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
