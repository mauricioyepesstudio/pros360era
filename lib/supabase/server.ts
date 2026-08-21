import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Server Supabase client for Server Components, route handlers, and server
 * actions. Reads/writes the session via Next's cookie store — this is the
 * client that authorization decisions must be based on, never a client-
 * supplied user id. Returns null (instead of throwing) when EVOLUSA's
 * Supabase project isn't configured yet, so callers can fall back to the
 * existing preview/demo behavior rather than crash.
 */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't set cookies; the
          // middleware below is responsible for refreshing the session.
        }
      },
    },
  });
}

/** Convenience helper: the current session's user, or null if signed out or unconfigured. */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
