"use client";

import { useContext, useEffect, useState } from "react";
import { AccountRoleContext } from "@/components/layout/AccountRoleProvider";
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
  // Pages that read the account on the server pass it down, so the first
  // paint is already right; elsewhere it starts as a visitor and fills in.
  const initial = useContext(AccountRoleContext);
  const [account, setAccount] = useState<HomeAccount>(initial ?? { signedIn: false, role: null });
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
    // Signed in but the server could not read the role: ask again here.
    if (initial?.signedIn && !initial.role) void refresh();
    if (!initial) {
      void supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        if (data.session) { setAccount({ signedIn: true, role: null }); void refresh(); }
      });
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // The server already answered for the session this page loaded with.
      if (initial && event === "INITIAL_SESSION") return;
      rolePromise = null;
      if (!session) setAccount({ signedIn: false, role: null });
      else void refresh();
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, [initial]);
  return account;
}
