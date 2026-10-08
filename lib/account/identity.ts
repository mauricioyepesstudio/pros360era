import type { AccountRole } from "./navigation.ts";

export type AccountIdentity =
  | { status: "ready"; role: AccountRole; email: string | null }
  | { status: "signed_out"; email: null }
  | { status: "role_unavailable"; email: string | null };

/** Only the authenticated user's authoritative profile can determine a role. */
export async function resolveAccountIdentity(
  user: { id: string; email?: string } | null,
  lookup: (id: string) => Promise<{ role: unknown; error: boolean }>,
): Promise<AccountIdentity> {
  if (!user) return { status: "signed_out", email: null };
  const email = user.email ?? null;
  try {
    const result = await lookup(user.id);
    if (!result.error && (result.role === "MEMBER" || result.role === "PROFESSIONAL" || result.role === "ADMIN")) {
      return { status: "ready", role: result.role, email };
    }
  } catch { /* Do not invent a member role when identity lookup fails. */ }
  return { status: "role_unavailable", email };
}

export function isMissingSession(error: { name?: string; code?: string } | null): boolean {
  return error?.name === "AuthSessionMissingError" || error?.code === "session_not_found";
}

export async function resolveSessionAccountIdentity(
  getUser: () => Promise<{ user: { id: string; email?: string } | null; error: { name?: string; code?: string } | null }>,
  lookup: (id: string) => Promise<{ role: unknown; error: boolean }>,
): Promise<AccountIdentity> {
  try {
    const { user, error } = await getUser();
    if (!user && isMissingSession(error)) return { status: "signed_out", email: null };
    if (error) return { status: "role_unavailable", email: user?.email ?? null };
    return await resolveAccountIdentity(user, lookup);
  } catch { return { status: "role_unavailable", email: null }; }
}
