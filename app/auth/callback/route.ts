import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/auth/return-path";
import { completeGoogleAccountLink, googleLinkReturnPath } from "@/lib/account/google-linking";
import { failedLinkDestination } from "@/lib/auth/email-link";

/**
 * PKCE return point for Google sign-in and for email links (signup
 * confirmation, password recovery). The code verifier lives in the browser's
 * cookies, so the exchange happens here, on the server, before any page loads.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");
  const next = safeReturnPath(rawNext);
  const failed = new URL(failedLinkDestination(rawNext), url.origin);
  if (!code || url.searchParams.has("error")) return NextResponse.redirect(failed);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?error=config", url.origin));
  if (url.searchParams.get("intent") === "link_google") {
    const linked = await completeGoogleAccountLink(supabase.auth, code);
    return NextResponse.redirect(linked ? new URL(googleLinkReturnPath, url.origin) : failed);
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(failed);
  return NextResponse.redirect(new URL(next, url.origin));
}
