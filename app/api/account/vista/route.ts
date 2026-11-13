import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import { ADMIN_VIEW_COOKIE, adminViewHome, homeForRole, parseAdminView } from "@/lib/account/navigation";

/**
 * The owner's switch between the member panel and the professional panel
 * (?panel=member|professional). Only the ADMIN gets the cookie; anyone else
 * is simply sent to their own panel. A display preference, not a
 * permission: RLS still scopes every query to the signed-in user.
 */
export async function GET(request: NextRequest) {
  const identity = await getCurrentAccountIdentity();
  if (identity.status === "signed_out") return NextResponse.redirect(new URL("/login", request.url));
  if (identity.status !== "ready") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (identity.role !== "ADMIN") return NextResponse.redirect(new URL(homeForRole(identity.role), request.url));
  const view = parseAdminView(request.nextUrl.searchParams.get("panel"));
  const response = NextResponse.redirect(new URL(adminViewHome(view), request.url));
  response.cookies.set(ADMIN_VIEW_COOKIE, view, { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax", httpOnly: true, secure: true });
  return response;
}
