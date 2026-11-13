import { unstable_rethrow } from "next/navigation";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import { getAdminView } from "@/lib/account/role-gate";
import { getAuthReadiness } from "@/lib/auth/config";
import type { AccountRole, AdminView } from "@/lib/account/navigation";

export type PublicAccount = { signedIn: boolean; role: AccountRole | null; view?: AdminView };

/**
 * Who is signed in, read on the server for the public pages, so the header,
 * role bar and buttons render right on the first paint (no flash of the
 * visitor menu). Only the caller's own role, through their session (RLS).
 * Preview without Supabase, or any read problem: a signed-out visitor.
 */
export async function getPublicAccount(): Promise<PublicAccount> {
  if (!getAuthReadiness().configured) return { signedIn: false, role: null };
  let identity: Awaited<ReturnType<typeof getCurrentAccountIdentity>>;
  try { identity = await getCurrentAccountIdentity(); } catch (error) { unstable_rethrow(error); return { signedIn: false, role: null }; }
  if (identity.status === "signed_out") return { signedIn: false, role: null };
  if (identity.status !== "ready") return { signedIn: true, role: null };
  return { signedIn: true, role: identity.role, view: identity.role === "ADMIN" ? await getAdminView() : undefined };
}
