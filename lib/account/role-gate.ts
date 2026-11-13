import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentRole } from "@/lib/account/persistence";
import { ADMIN_VIEW_COOKIE, MEMBER_HOME, PROFESSIONAL_HOME, parseAdminView, type AccountRole, type AdminView } from "@/lib/account/navigation";

/** The panel the owner chose last (see AdminViewSwitch). */
export async function getAdminView(): Promise<AdminView> {
  const cookieStore = await cookies();
  return parseAdminView(cookieStore.get(ADMIN_VIEW_COOKIE)?.value);
}

/**
 * Page-level role gates for the two account panels. A UX boundary, not the
 * security one: every query behind these pages is already scoped to
 * auth.uid() by RLS, so a wrong-role visitor would only see empty data.
 * These just keep each role inside its own panel.
 */
export async function requireMemberArea(): Promise<AccountRole> {
  const role = await getCurrentRole();
  if (role === "PROFESSIONAL") redirect(PROFESSIONAL_HOME);
  // The owner can look at the member panel after choosing "Panel de usuario".
  if (role === "ADMIN" && (await getAdminView()) !== "member") redirect(PROFESSIONAL_HOME);
  return role;
}

export async function requireProfessionalArea(): Promise<AccountRole> {
  const role = await getCurrentRole();
  if (role === "MEMBER") redirect(MEMBER_HOME);
  return role;
}
