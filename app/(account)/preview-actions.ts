"use server";

import { cookies } from "next/headers";
import { getAuthReadiness } from "@/lib/auth/config";
import { PREVIEW_ROLE_COOKIE } from "@/lib/account/persistence";

/** Vista preliminar only: does nothing once Supabase is configured. */
export async function setPreviewRoleAction(role: "MEMBER" | "PROFESSIONAL") {
  if (getAuthReadiness().configured) return;
  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_ROLE_COOKIE, role === "PROFESSIONAL" ? "PROFESSIONAL" : "MEMBER", { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });
}
