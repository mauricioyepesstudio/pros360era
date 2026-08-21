"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, Map, UserRound } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import { cn } from "@/lib/cn";

const nav = [{ href: "/dashboard", label: "Inicio", icon: LayoutDashboard }, { href: "/roadmap", label: "Roadmap", icon: Map }, { href: "/assistant", label: "Asistente", icon: Bot }, { href: "/profile", label: "Perfil", icon: UserRound }] as const;

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-[var(--warm-canvas)] lg:grid lg:grid-cols-[16.5rem_1fr]">
    <aside className="hidden border-r border-[var(--border)] bg-white px-5 py-7 lg:flex lg:flex-col"><Link href="/" aria-label="EVOLUSA, volver al sitio"><BrandMark size="md" /></Link><p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-blue)]">Tu cuenta</p><nav className="mt-4 space-y-1" aria-label="Cuenta EVOLUSA">{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-semibold", pathname===href ? "bg-[var(--brand-navy)] text-white" : "text-[var(--muted)] hover:bg-[var(--sky-surface)] hover:text-[var(--brand-navy)]")}><Icon aria-hidden size={19}/>{label}</Link>)}</nav><div className="mt-auto rounded-[var(--radius-lg)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]"><strong className="block text-[var(--brand-navy)]">Vista preliminar</strong>La cuenta se conectará a Supabase Auth cuando la configuración esté disponible.</div></aside>
    <div className="min-w-0"><header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-white/90 px-5 backdrop-blur lg:px-8"><Link href="/" className="lg:hidden" aria-label="EVOLUSA, volver al sitio"><BrandMark size="sm" /></Link><p className="hidden text-sm font-semibold text-[var(--muted)] lg:block">Tu camino en Estados Unidos</p><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--brand-blue)]">Fase 1</span></header><main className="mx-auto w-full max-w-7xl px-5 pb-28 pt-8 sm:px-8 lg:pb-12 lg:pt-10">{children}</main></div>
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[var(--border)] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Cuenta EVOLUSA móvil">{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold",pathname===href?"bg-[var(--sky-surface)] text-[var(--brand-blue)]":"text-[var(--muted)]")}><Icon aria-hidden size={20}/>{label}</Link>)}</nav>
  </div>;
}
