"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Browser Supabase client for client components (auth form submission, live
 * subscriptions). Only ever uses the public URL/anon key — never a
 * service-role key. Throws only when actually called, so importing this
 * module doesn't break pages while EVOLUSA's Supabase project isn't
 * configured yet (see lib/auth/config.ts).
 */
export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase no está configurado. Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(env.url, env.anonKey);
}
