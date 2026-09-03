import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Service-role Supabase client — bypasses RLS and every table/function
 * grant entirely. Used ONLY by the Stripe webhook route, which has no user
 * session to authenticate as and has already independently verified the
 * event came from Stripe (signature check) before this client is ever
 * touched. Never import this into a Server Action or Server Component —
 * those must always use createSupabaseServerClient (lib/supabase/server.ts)
 * so authorization stays derived from the real caller's session.
 */
export function createSupabaseServiceRoleClient() {
  const env = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !serviceRoleKey) return null;

  return createClient(env.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
