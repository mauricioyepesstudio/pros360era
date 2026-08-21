import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/dashboard", "/roadmap", "/assistant", "/profile"];

/**
 * Refreshes the Supabase session cookie on every request and gates the
 * protected account routes. This is the real authorization boundary — a
 * page-level redirect alone is not sufficient.
 *
 * When EVOLUSA's Supabase project isn't configured yet, this proxy is a
 * no-op: it must not break the existing preview/demo account pages, and it
 * must not fabricate a signed-in or signed-out gate before real auth exists.
 */
export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  if (!isProtected) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/roadmap/:path*", "/assistant/:path*", "/profile/:path*"],
};
