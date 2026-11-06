import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailLinkDestination, failedLinkDestination, parseEmailLinkType } from "@/lib/auth/email-link";

/**
 * Token-hash return point for email templates that link here
 * (`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`).
 * Unlike the PKCE callback it works when the email is opened on another
 * device or browser, because it needs no code verifier.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = parseEmailLinkType(url.searchParams.get("type"));
  const next = url.searchParams.get("next");
  const failedNext = type === "recovery" ? "/reset-password" : next;
  if (!tokenHash || !type) return NextResponse.redirect(new URL(failedLinkDestination(failedNext), url.origin));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?error=config", url.origin));
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) return NextResponse.redirect(new URL(failedLinkDestination(failedNext), url.origin));
  return NextResponse.redirect(new URL(emailLinkDestination(type, next), url.origin));
}
