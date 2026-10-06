/**
 * Which account screens each role sees. A MEMBER (persona que busca
 * asesoría) and a PROFESSIONAL live in two separate panels: the member one
 * is the journey (Roadmap, Conexiones, Asistente); the professional one is
 * the business side (Oportunidades, perfil profesional, Clientes/CRM,
 * Crecimiento). No tab is shared between the two, so a member never sees
 * CRM or Crecimiento and a professional never lands on a member Roadmap.
 *
 * ADMIN (the owner) keeps the member panel plus Admin.
 *
 * Pure data, no React or Supabase imports, so it can be unit-tested.
 */
export type AccountRole = "MEMBER" | "PROFESSIONAL" | "ADMIN";

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
  | "shield";

export type AccountNavItem = { href: string; label: string; icon: AccountNavIcon };

export const MEMBER_HOME = "/dashboard";
export const PROFESSIONAL_HOME = "/panel-profesional";

const memberNav: readonly AccountNavItem[] = [
  { href: MEMBER_HOME, label: "Inicio", icon: "home" },
  { href: "/roadmap", label: "Roadmap", icon: "map" },
  { href: "/conexiones", label: "Conexiones", icon: "handshake" },
  { href: "/assistant", label: "Asistente", icon: "bot" },
  { href: "/profile", label: "Perfil", icon: "user" },
];

const professionalNav: readonly AccountNavItem[] = [
  { href: PROFESSIONAL_HOME, label: "Panel", icon: "home" },
  { href: "/panel-profesional/oportunidades", label: "Oportunidades", icon: "briefcase" },
  { href: "/panel-profesional/perfil", label: "Mi perfil", icon: "id-card" },
  { href: "/crm", label: "Clientes", icon: "users" },
  { href: "/growth-automation", label: "Crecimiento", icon: "rocket" },
];

export function homeForRole(role: AccountRole): string {
  return role === "PROFESSIONAL" ? PROFESSIONAL_HOME : MEMBER_HOME;
}

export function buildAccountNav(role: AccountRole): readonly AccountNavItem[] {
  if (role === "PROFESSIONAL") return professionalNav;
  if (role === "ADMIN") return [...memberNav, { href: "/admin", label: "Admin", icon: "shield" }];
  return memberNav;
}

/** Screens only a professional (or the admin) may open. */
export function isProfessionalArea(pathname: string): boolean {
  return ["/panel-profesional", "/crm", "/growth-automation"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
