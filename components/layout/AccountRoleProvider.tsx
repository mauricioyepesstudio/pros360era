"use client";

import { createContext, type ReactNode } from "react";
import type { HomeAccount } from "@/components/layout/useAccountRole";

/** The account the server already read for this page (see getPublicAccount). */
export const AccountRoleContext = createContext<HomeAccount | null>(null);

export default function AccountRoleProvider({ account, children }: { account: HomeAccount; children: ReactNode }) {
  return <AccountRoleContext.Provider value={account}>{children}</AccountRoleContext.Provider>;
}
