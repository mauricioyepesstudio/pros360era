export type AuthReadiness = { configured: boolean; missing: string[] };
export function getAuthReadiness(): AuthReadiness {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
  const missing = required.filter((key) => !process.env[key]);
  return { configured: missing.length === 0, missing };
}
