import { authCallbackUrl } from "../auth/email-link.ts";

export const googleLinkReturnPath = "/panel-profesional/perfil#mi-acceso";
type AuthError = { code?: string } | null;
type LinkClient = {
  getUser(): Promise<{ data: { user: { id: string } | null }; error: AuthError }>;
  linkIdentity(input: { provider: "google"; options: { redirectTo: string; queryParams: { prompt: string }; skipBrowserRedirect: boolean } }): Promise<{ data: { url: string | null }; error: AuthError }>;
};
export type GoogleLinkResult = { ok: true; url: string } | { ok: false; message: string };

export function googleLinkError(code: string | undefined): string {
  if (code === "manual_linking_disabled") return "La vinculación de cuentas Google aún no está habilitada. El administrador debe activar esta opción antes de continuar.";
  if (code === "provider_disabled" || code === "validation_failed") return "No pudimos iniciar la vinculación con Google. Revisa la configuración de acceso con el administrador.";
  return "No pudimos vincular ese Google. Vuelve a entrar con tu cuenta actual e inténtalo de nuevo.";
}

/** Existing-session linking only: never sign up, switch user, update email or unlink. */
export async function beginGoogleAccountLink(client: LinkClient, expectedUserId: string, origin: string): Promise<GoogleLinkResult> {
  try {
    const current = await client.getUser();
    if (current.error || !current.data.user || current.data.user.id !== expectedUserId) {
      return { ok: false, message: "Tu sesión cambió. Recarga el perfil y verifica tu cuenta antes de vincular Google." };
    }
    const callback = new URL(authCallbackUrl(origin, googleLinkReturnPath));
    callback.searchParams.set("intent", "link_google");
    const result = await client.linkIdentity({
      provider: "google",
      options: { redirectTo: callback.toString(), queryParams: { prompt: "select_account" }, skipBrowserRedirect: true },
    });
    if (result.error) return { ok: false, message: googleLinkError(result.error.code) };
    // The authenticated Auth endpoint returns Google's consent URL. Do not
    // redirect to an arbitrary URL or render OAuth state as page content.
    const url = new URL(result.data.url ?? "");
    if (url.protocol !== "https:" || url.hostname !== "accounts.google.com" || url.username || url.password) {
      return { ok: false, message: "Google no devolvió un destino válido para vincular tu cuenta." };
    }
    const recheck = await client.getUser();
    if (recheck.error || recheck.data.user?.id !== expectedUserId) {
      return { ok: false, message: "Tu sesión cambió. Recarga el perfil antes de continuar." };
    }
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, message: "No pudimos conectar con el servicio de cuentas. Inténtalo de nuevo." };
  }
}


type GoogleLinkCallbackClient = {
  getUser(): Promise<{ data: { user: { id: string } | null }; error: AuthError }>;
  exchangeCodeForSession(code: string): Promise<{ data: { user: { id: string } | null }; error: AuthError }>;
  signOut(options: { scope: "local" }): Promise<{ error: AuthError }>;
};

/** The existing signed Auth cookie anchors the account BEFORE the PKCE exchange. */
export async function completeGoogleAccountLink(client: GoogleLinkCallbackClient, code: string): Promise<boolean> {
  try {
    const before = await client.getUser();
    if (before.error || !before.data.user) return false;
    const expectedId = before.data.user.id;
    const result = await client.exchangeCodeForSession(code);
    if (result.data.user && result.data.user.id !== expectedId) {
      await client.signOut({ scope: "local" });
      return false;
    }
    return !result.error && result.data.user?.id === expectedId;
  } catch { return false; }
}
