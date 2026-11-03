"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Briefcase, CalendarDays, Handshake, IdCard, LayoutDashboard, LogOut, Map, Rocket, ShieldCheck, UserRound, Users, type LucideIcon } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import { cn } from "@/lib/cn";
import { getAuthReadiness } from "@/lib/auth/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import OnboardingSync from "@/components/account/OnboardingSync";
import PreviewRoleSwitch from "@/components/account/PreviewRoleSwitch";
import { accountContextFor, buildAccountNav, isAccountNavActive, type AccountNavIcon, type AccountRole } from "@/lib/account/navigation";

const navIcons: Record<AccountNavIcon, LucideIcon> = {
  home: LayoutDashboard,
  map: Map,
  handshake: Handshake,
  bot: Bot,
  user: UserRound,
  briefcase: Briefcase,
  "id-card": IdCard,
  users: Users,
  rocket: Rocket,
  calendar: CalendarDays,
  shield: ShieldCheck,
};

export default function AccountShell({ children, role, email }: { children: React.ReactNode; role: AccountRole; email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const configured = getAuthReadiness().configured;
  const context = accountContextFor(role, pathname);
  const nav = buildAccountNav(role, context).map((item) => ({ ...item, icon: navIcons[item.icon] }));
  const isProfessional = context === "professional";
  const isApplicant = context === "applicant";
  const sectionTitle = isApplicant ? "Espacio profesional" : isProfessional ? "Panel profesional" : "Tu cuenta";
  const sectionDescription = isApplicant ? "Prepara tu presentación" : isProfessional ? "Tu negocio en EVOLUSA" : "Tu camino en Estados Unidos";
  const accountBadge = role === "ADMIN" ? "Administrador · Profesional" : isApplicant ? "Borrador privado" : isProfessional ? "Profesional" : "Miembro";
  const navigationLabel = isApplicant ? "Espacio profesional EVOLUSA" : isProfessional ? "Panel profesional EVOLUSA" : "Cuenta EVOLUSA";

  async function handleLogout() {
    if (!configured) return;
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Color por rol: azul = miembro, dorado = profesional (y su espacio de preparación).
  // Toda la cáscara (barra lateral, encabezado, barra inferior móvil) lo usa,
  // para que la persona sepa de un vistazo en qué panel está.
  const pro = isProfessional || isApplicant;
  const roleStyle = (pro
    ? { "--role-accent": "var(--role-pro-strong)", "--role-fill": "var(--role-pro)", "--role-soft": "var(--role-pro-soft)" }
    : { "--role-accent": "var(--role-member)", "--role-fill": "var(--role-member)", "--role-soft": "var(--role-member-soft)" }) as React.CSSProperties;

  return <div style={roleStyle} className="min-h-screen bg-[var(--warm-canvas)] lg:grid lg:grid-cols-[16.5rem_1fr]">
    {context === "member" ? <OnboardingSync /> : null}
    <aside className={cn("hidden px-5 py-7 lg:flex lg:flex-col", pro ? "bg-[var(--brand-navy)] text-white" : "border-r border-[var(--border)] bg-white")}>
      <Link href="/" aria-label="EVOLUSA, volver al sitio" className={pro ? "rounded-[var(--radius-md)] bg-white px-3 py-2" : ""}><BrandMark size="md" /></Link>
      <p className={cn("mt-8 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]", pro ? "bg-[var(--role-pro)] text-[var(--brand-navy)]" : "bg-[var(--role-member)] text-white")}>{sectionTitle}</p>
      <nav className="mt-4 space-y-1" aria-label={navigationLabel}>{nav.map(({href,label,icon:Icon}) => { const active = isAccountNavActive(pathname, href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-semibold", active ? (pro ? "bg-[var(--role-pro)] text-[var(--brand-navy)]" : "bg-[var(--role-member)] text-white") : (pro ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-[var(--muted)] hover:bg-[var(--role-member-soft)] hover:text-[var(--brand-navy)]"))}><Icon aria-hidden size={19}/>{label}</Link>; })}</nav>
      {configured ? <button type="button" onClick={handleLogout} className={cn("mt-auto flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-semibold", pro ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-[var(--muted)] hover:bg-[var(--sky-surface)] hover:text-[var(--brand-navy)]")}><LogOut aria-hidden size={19}/>Cerrar sesión</button> : <div className="mt-auto rounded-[var(--radius-lg)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]"><strong className="block text-[var(--brand-navy)]">Vista preliminar</strong>La cuenta se conectará a Supabase Auth cuando la configuración esté disponible.<PreviewRoleSwitch role={role} /></div>}
    </aside>
    <div className="min-w-0"><header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-2 border-b border-t-4 border-b-[var(--border)] border-t-[var(--role-fill)] bg-white/95 px-5 backdrop-blur lg:px-8"><Link href="/" className="lg:hidden" aria-label="EVOLUSA, volver al sitio"><BrandMark size="sm" /></Link><p className="hidden text-sm font-semibold text-[var(--muted)] lg:block">{sectionDescription}</p>{configured ? null : <div className="lg:hidden"><PreviewRoleSwitch role={role} compact /></div>}{email ? <p className="hidden max-w-[45%] break-all px-2 text-xs text-[var(--muted)] sm:block">Sesión: {email}</p> : null}<span className={cn("rounded-full px-3 py-1.5 text-xs font-bold", pro ? "bg-[var(--role-pro)] text-[var(--brand-navy)]" : "bg-[var(--role-member)] text-white", configured ? "" : "hidden lg:inline")}>{accountBadge}</span></header><main className="mx-auto w-full max-w-7xl px-5 pb-28 pt-8 sm:px-8 lg:pb-12 lg:pt-10">{children}</main></div>
    <nav className={cn("fixed inset-x-0 bottom-0 z-50 grid border-t-4 border-t-[var(--role-fill)] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden", pro ? "bg-[var(--brand-navy)]/95" : "bg-white/95", nav.length === 2 ? "grid-cols-2" : nav.length === 6 ? "grid-cols-6" : nav.length === 7 ? "grid-cols-7" : "grid-cols-5")} aria-label={`${navigationLabel} móvil`}>{nav.map(({href,label,icon:Icon}) => { const active = isAccountNavActive(pathname, href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold", active ? (pro ? "bg-[var(--role-pro)] text-[var(--brand-navy)]" : "bg-[var(--role-member)] text-white") : (pro ? "text-white/75" : "text-[var(--muted)]"))}><Icon aria-hidden size={19}/>{label}</Link>; })}</nav>
  </div>;
}
