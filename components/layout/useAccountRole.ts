"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { AccountRole, AdminView } from "@/lib/account/navigation";

export type HomeAccount = { signedIn: boolean; role: AccountRole | null; view?: AdminView };

/**
 * Who is signed in, for the public pages (home header and role bar). The
 * role comes from the server (/api/account/role reads profiles.role with the
 * user's own session); the browser never decides it.
 */
type RolePayload = { signedIn?: boolean; role?: AccountRole; view?: AdminView };
// One request per page load, shared by the header, role bar and footer.
let rolePromise: Promise<RolePayload> | null = null;
function fetchRole(): Promise<RolePayload> {
  rolePromise ??= fetch("/api/account/role", { cache: "no-store" })
    .then((response) => response.json() as Promise<RolePayload>)
    .catch((error: unknown) => { rolePromise = null; throw error; });
  return rolePromise;
}

export function useAccountRole(): HomeAccount {
  const [account, setAccount] = useState<HomeAccount>({ signedIn: false, role: null });
  useEffect(() => {
    if (!getSupabaseEnv()) return;
    let cancelled = false;
    async function refresh() {
      try {
        const data = await fetchRole();
        if (!cancelled) setAccount({ signedIn: Boolean(data.signedIn), role: data.role ?? null, view: data.view });
      } catch { /* Keep "signed in" without a role: the header still links to /dashboard. */ }
    }
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) { setAccount({ signedIn: true, role: null }); void refresh(); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      rolePromise = null;
      if (!session) setAccount({ signedIn: false, role: null });
      else void refresh();
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);
  return account;
}
