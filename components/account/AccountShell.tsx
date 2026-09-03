"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Briefcase, Handshake, LayoutDashboard, LogOut, Map, ShieldCheck, UserRound } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import { cn } from "@/lib/cn";
import { getAuthReadiness } from "@/lib/auth/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import OnboardingSync from "@/components/account/OnboardingSync";

/**
 * Milestone 04C: the professional-facing "Oportunidades" tab replaces the
 * member-facing "Conexiones" tab for a PROFESSIONAL-role account, rather
 * than both appearing together — the two surfaces are mutually exclusive
 * per this project's account model (profiles.role), and a professional
 * account has no personal need/roadmap journey of its own to connect. Every
 * other tab is shared, unchanged, additive-only.
 */
function buildNav(role: "MEMBER" | "PROFESSIONAL" | "ADMIN") {
  return [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    role === "PROFESSIONAL"
      ? { href: "/panel-profesional/oportunidades", label: "Oportunidades", icon: Briefcase }
      : { href: "/conexiones", label: "Conexiones", icon: Handshake },
    { href: "/roadmap", label: "Roadmap", icon: Map },
    { href: "/assistant", label: "Asistente", icon: Bot },
    { href: "/profile", label: "Perfil", icon: UserRound },
    ...(role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] as const : []),
  ] as const;
}

export default function AccountShell({ children, role }: { children: React.ReactNode; role: "MEMBER" | "PROFESSIONAL" | "ADMIN" }) {
  const pathname = usePathname();
  const router = useRouter();
  const configured = getAuthReadiness().configured;
  const nav = buildNav(role);

  async function handleLogout() {
    if (!configured) return;
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <div className="min-h-screen bg-[var(--warm-canvas)] lg:grid lg:grid-cols-[16.5rem_1fr]">
    <OnboardingSync />
    <aside className="hidden border-r border-[var(--border)] bg-white px-5 py-7 lg:flex lg:flex-col"><Link href="/" aria-label="EVOLUSA, volver al sitio"><BrandMark size="md" /></Link><p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-blue)]">Tu cuenta</p><nav className="mt-4 space-y-1" aria-label="Cuenta EVOLUSA">{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-semibold", pathname===href ? "bg-[var(--brand-navy)] text-white" : "text-[var(--muted)] hover:bg-[var(--sky-surface)] hover:text-[var(--brand-navy)]")}><Icon aria-hidden size={19}/>{label}</Link>)}</nav>{configured ? <button type="button" onClick={handleLogout} className="mt-auto flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-semibold text-[var(--muted)] hover:bg-[var(--sky-surface)] hover:text-[var(--brand-navy)]"><LogOut aria-hidden size={19}/>Cerrar sesión</button> : <div className="mt-auto rounded-[var(--radius-lg)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]"><strong className="block text-[var(--brand-navy)]">Vista preliminar</strong>La cuenta se conectará a Supabase Auth cuando la configuración esté disponible.</div>}</aside>
    <div className="min-w-0"><header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-white/90 px-5 backdrop-blur lg:px-8"><Link href="/" className="lg:hidden" aria-label="EVOLUSA, volver al sitio"><BrandMark size="sm" /></Link><p className="hidden text-sm font-semibold text-[var(--muted)] lg:block">Tu camino en Estados Unidos</p><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--brand-blue)]">Fase 1</span></header><main className="mx-auto w-full max-w-7xl px-5 pb-28 pt-8 sm:px-8 lg:pb-12 lg:pt-10">{children}</main></div>
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[var(--border)] bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Cuenta EVOLUSA móvil">{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold",pathname===href?"bg-[var(--sky-surface)] text-[var(--brand-blue)]":"text-[var(--muted)]")}><Icon aria-hidden size={19}/>{label}</Link>)}</nav>
  </div>;
}
