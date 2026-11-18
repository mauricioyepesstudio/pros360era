import { NextResponse } from "next/server";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import { getAdminView } from "@/lib/account/role-gate";
import { getAuthReadiness } from "@/lib/auth/config";

/**
 * Tells the public pages which kind of account is signed in, so they can say
 * "Cuenta de usuario" / "Cuenta de profesional" in that role's color and show
 * only that side of the site. Only the caller's own role (read through their
 * session, RLS applies); never anyone else's. For the ADMIN it also says
 * which panel the owner chose. Without Supabase (preview) nobody is signed in.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!getAuthReadiness().configured) return NextResponse.json({ signedIn: false }, { headers });
  const identity = await getCurrentAccountIdentity();
  if (identity.status !== "ready") return NextResponse.json({ signedIn: identity.status !== "signed_out" }, { headers });
  const view = identity.role === "ADMIN" ? await getAdminView() : undefined;
  return NextResponse.json({ signedIn: true, role: identity.role, view }, { headers });
}
