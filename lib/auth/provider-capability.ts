type PublicAuthEnvironment = { url: string; anonKey: string };

/** Availability hint only. Supabase still authorizes every OAuth request. */
export async function canUseGoogleOAuth(
  env: PublicAuthEnvironment | null,
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<boolean> {
  if (!env || signal.aborted) return false;
  try {
    const response = await request(`${env.url}/auth/v1/settings`, {
      headers: { apikey: env.anonKey }, signal,
    });
    if (!response.ok || signal.aborted) return false;
    const settings: unknown = await response.json();
    return !signal.aborted && typeof settings === "object" && settings !== null &&
      "external" in settings && typeof settings.external === "object" &&
      settings.external !== null && "google" in settings.external &&
      settings.external.google === true;
  } catch {
    return false;
  }
}
