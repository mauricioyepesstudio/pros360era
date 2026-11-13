"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { AccountRole } from "@/lib/account/navigation";

export type HomeAccount = { signedIn: boolean; role: AccountRole | null };

/**
 * Who is signed in, for the public pages (home header and role bar). The
 * role comes from the server (/api/account/role reads profiles.role with the
 * user's own session); the browser never decides it.
 */
export function useAccountRole(): HomeAccount {
  const [account, setAccount] = useState<HomeAccount>({ signedIn: false, role: null });
  useEffect(() => {
    if (!getSupabaseEnv()) return;
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch("/api/account/role", { cache: "no-store" });
        const data = (await response.json()) as { signedIn?: boolean; role?: AccountRole };
        if (!cancelled) setAccount({ signedIn: Boolean(data.signedIn), role: data.role ?? null });
      } catch { /* Keep "signed in" without a role: the header still links to /dashboard. */ }
    }
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) { setAccount({ signedIn: true, role: null }); void refresh(); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setAccount({ signedIn: false, role: null });
      else void refresh();
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);
  return account;
}
