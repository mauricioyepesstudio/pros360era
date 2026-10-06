import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/account/persistence";
import { MEMBER_HOME, PROFESSIONAL_HOME, type AccountRole } from "@/lib/account/navigation";

/**
 * Page-level role gates for the two account panels. A UX boundary, not the
 * security one: every query behind these pages is already scoped to
 * auth.uid() by RLS, so a wrong-role visitor would only see empty data.
 * These just keep each role inside its own panel.
 */
export async function requireMemberArea(): Promise<AccountRole> {
  const role = await getCurrentRole();
  if (role === "PROFESSIONAL") redirect(PROFESSIONAL_HOME);
  return role;
}

export async function requireProfessionalArea(): Promise<AccountRole> {
  const role = await getCurrentRole();
  if (role === "MEMBER") redirect(MEMBER_HOME);
  return role;
}
