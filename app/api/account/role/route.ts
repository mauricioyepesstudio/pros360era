import { NextResponse } from "next/server";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import { getAuthReadiness } from "@/lib/auth/config";

/**
 * Tells the public home which kind of account is signed in, so it can say
 * "Cuenta de usuario" / "Cuenta de profesional" in that role's color. Only
 * the caller's own role (read through their session, RLS applies); never
 * anyone else's. Without Supabase (preview) nobody is signed in.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!getAuthReadiness().configured) return NextResponse.json({ signedIn: false }, { headers });
  const identity = await getCurrentAccountIdentity();
  if (identity.status !== "ready") return NextResponse.json({ signedIn: identity.status !== "signed_out" }, { headers });
  return NextResponse.json({ signedIn: true, role: identity.role }, { headers });
}
