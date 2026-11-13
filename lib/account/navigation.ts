/**
 * Which account screens each role sees. A MEMBER (persona que busca
 * asesoría) and a PROFESSIONAL live in two separate panels: the member one
 * is the journey (Roadmap, Conexiones, Asistente); the professional one is
 * the business side (Oportunidades, perfil profesional, Clientes/CRM,
 * Crecimiento). The member panel also links the applicant "Espacio
 * profesional" (private draft), but never CRM or Crecimiento. No tab is shared between the two, so a member never sees
 * CRM or Crecimiento and a professional never lands on a member Roadmap.
 *
 * ADMIN (the owner) keeps the member panel plus Admin.
 *
 * Pure data, no React or Supabase imports, so it can be unit-tested.
 */
export type AccountRole = "MEMBER" | "PROFESSIONAL" | "ADMIN";
export type AccountContext = "member" | "applicant" | "professional";

export type AccountNavIcon =
  | "home"
  | "map"
  | "handshake"
  | "bot"
  | "user"
  | "briefcase"
  | "id-card"
  | "users"
  | "rocket"
  | "calendar"
  | "shield";

export type AccountNavItem = { href: string; label: string; icon: AccountNavIcon };

export const MEMBER_HOME = "/dashboard";
export const PROFESSIONAL_HOME = "/panel-profesional";

const memberNav: readonly AccountNavItem[] = [
  { href: MEMBER_HOME, label: "Inicio", icon: "home" },
  { href: "/roadmap", label: "Plan", icon: "map" },
  { href: "/conexiones", label: "Conexiones", icon: "handshake" },
  { href: "/assistant", label: "Asistente", icon: "bot" },
  { href: "/profile", label: "Perfil", icon: "user" },
  // Applicants keep the MEMBER role until their profile is approved; this is
  // where they save their private draft (docs/EVOLUSA-PROFESSIONAL-WORKSPACE.md).
  { href: "/dashboard/professional", label: "Preparación profesional", icon: "briefcase" },
];

const professionalNav: readonly AccountNavItem[] = [
  { href: PROFESSIONAL_HOME, label: "Panel", icon: "home" },
  { href: "/panel-profesional/oportunidades", label: "Oportunidades", icon: "briefcase" },
  { href: "/panel-profesional/perfil", label: "Mi perfil", icon: "id-card" },
  { href: "/crm", label: "Clientes", icon: "users" },
  { href: "/panel-profesional/planner", label: "Planner", icon: "calendar" },
  { href: "/growth-automation", label: "Crecimiento", icon: "rocket" },
];

const applicantNav: readonly AccountNavItem[] = [
  { href: "/dashboard/professional", label: "Presentación", icon: "briefcase" },
  { href: MEMBER_HOME, label: "Cuenta personal", icon: "user" },
];

export function homeForRole(role: AccountRole): string {
  return role === "PROFESSIONAL" || role === "ADMIN" ? PROFESSIONAL_HOME : MEMBER_HOME;
}

/**
 * Which panel the ADMIN (owner) is looking at. The owner is the only account
 * that can open both panels, so the choice is remembered in a cookie and a
 * visible switch flips it. Only a preference: every query stays scoped to
 * the signed-in user by RLS, and MEMBER/PROFESSIONAL ignore it entirely.
 */
export type AdminView = "member" | "professional";
export const ADMIN_VIEW_COOKIE = "evolusa_admin_view";

export function parseAdminView(value: string | null | undefined): AdminView {
  return value === "member" ? "member" : "professional";
}

export function adminViewHome(view: AdminView): string {
  return view === "member" ? MEMBER_HOME : PROFESSIONAL_HOME;
}

/** Plain words shown on the home and in the panel so nobody has to guess. */
export function roleLabels(role: AccountRole): { account: string; panel: string; short: string } {
  if (role === "PROFESSIONAL") return { account: "Cuenta de profesional", panel: "Ir a mi panel profesional", short: "Profesional" };
  if (role === "ADMIN") return { account: "Cuenta de administrador", panel: "Ir a mi panel", short: "Administrador" };
  return { account: "Cuenta de usuario", panel: "Ir a mi panel de usuario", short: "Usuario" };
}

export function accountContextFor(role: AccountRole, pathname: string): AccountContext {
  if (role === "PROFESSIONAL" || (role === "ADMIN" && isProfessionalArea(pathname))) return "professional";
  if (
    role === "MEMBER" &&
    (pathname === "/dashboard/professional" || pathname.startsWith("/dashboard/professional/"))
  ) return "applicant";
  return "member";
}

export function buildAccountNav(
  role: AccountRole,
  context: AccountContext = role === "PROFESSIONAL" ? "professional" : "member",
): readonly AccountNavItem[] {
  if (context === "applicant") return applicantNav;
  if (role === "PROFESSIONAL") return professionalNav;
  if (role === "ADMIN" && context === "professional") return [...professionalNav, { href: "/admin", label: "Admin", icon: "shield" }];
  if (role === "ADMIN") return [...memberNav, { href: "/admin", label: "Admin", icon: "shield" }];
  return memberNav;
}

export function isAccountNavActive(pathname: string, href: string): boolean {
  if (href === MEMBER_HOME || href === PROFESSIONAL_HOME) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Screens only a professional (or the admin) may open. */
export function isProfessionalArea(pathname: string): boolean {
  return ["/panel-profesional", "/crm", "/growth-automation"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * The public site (home, /para-profesionales) also splits by account
 * (owner, 13-nov): a signed-in usuario sees only the usuario side (journey,
 * etapas, videos) and a signed-in profesional sees only the professional
 * side. Signed out, a visitor sees both and chooses. The ADMIN follows the
 * panel chosen in the switch (cookie), professional by default.
 */
export type PublicSide = "member" | "professional";
export const PROFESSIONAL_PUBLIC_HOME = "/para-profesionales";

export function publicSideFor(role: AccountRole | null | undefined, adminView: AdminView = "professional"): PublicSide | null {
  if (!role) return null;
  if (role === "PROFESSIONAL") return "professional";
  if (role === "ADMIN") return adminView;
  return "member";
}

export type PublicNavItem = { label: string; href: string };

const visitorPublicNav: readonly PublicNavItem[] = [
  { label: "Inicio", href: "/#home" },
  { label: "Beneficios", href: "/#beneficios" },
  { label: "Etapas", href: "/#journey" },
  { label: "Video", href: "/#video" },
  { label: "Profesionales", href: PROFESSIONAL_PUBLIC_HOME },
];

const memberPublicNav: readonly PublicNavItem[] = visitorPublicNav.slice(0, 4);

const professionalPublicNav: readonly PublicNavItem[] = [
  { label: "Inicio", href: PROFESSIONAL_PUBLIC_HOME },
  { label: "Lo que recibes", href: `${PROFESSIONAL_PUBLIC_HOME}#lo-que-recibes` },
  { label: "Video", href: `${PROFESSIONAL_PUBLIC_HOME}#video` },
  { label: "Growth Engine", href: "/growth-engine" },
];

export function publicNavFor(side: PublicSide | null): readonly PublicNavItem[] {
  if (side === "professional") return professionalPublicNav;
  if (side === "member") return memberPublicNav;
  return visitorPublicNav;
}
