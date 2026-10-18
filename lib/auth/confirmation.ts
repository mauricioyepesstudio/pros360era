import { professionalWorkspacePath, safeReturnPath } from "./return-path.ts";

export const confirmationCooldownSeconds = 60;
export const confirmationRequestMessage = "Si hay una cuenta pendiente de confirmación con este correo, recibirás un enlace. Revisa también spam. Si ya tienes cuenta, entra con tu contraseña.";

export function normalizeAuthEmail(email: string): string { return email.trim().toLowerCase(); }
export function isUnconfirmedEmail(error: { message: string; code?: string }): boolean { return error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message); }
export function isExistingSignup(error: { message: string; code?: string }): boolean { return error.code === "user_already_exists" || /user already registered/i.test(error.message); }
export function translateAuthError(error: string | { message: string; code?: string }): string {
  const message = typeof error === "string" ? error : error.message;
  const code = typeof error === "string" ? undefined : error.code;
  // Only allowlisted copy reaches the UI; provider messages can contain personal data.
  const byCode: Record<string, string> = {
    email_address_not_authorized: "El servicio de correo aún no permite enviar a esta dirección. El administrador debe revisar la configuración de correo.",
    signup_disabled: "El registro de cuentas está deshabilitado temporalmente. El administrador debe revisar la configuración de acceso.",
    weak_password: "La contraseña no cumple los requisitos de seguridad. Prueba una más larga que combine mayúsculas, minúsculas, números y símbolos.",
    email_address_invalid: "Ese correo no parece válido.",
    over_email_send_rate_limit: "Se alcanzó el límite temporal de envíos de correo. Intenta de nuevo en unos minutos.",
    over_request_rate_limit: "Se realizaron demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
    email_not_confirmed: "Confirma tu correo antes de entrar. Puedes solicitar otro enlace.",
    invalid_credentials: "Correo o contraseña incorrectos.",
  };
  if (code && Object.hasOwn(byCode, code)) return byCode[code];
  const known: [RegExp, string][] = [
    [/invalid login credentials/i, "Correo o contraseña incorrectos."],
    [/password should be at least/i, "La contraseña debe tener al menos 6 caracteres."],
    [/email not confirmed/i, "Confirma tu correo antes de entrar. Puedes solicitar otro enlace."],
    [/email address ".*" is invalid|unable to validate email/i, "Ese correo no parece válido."],
    [/email rate limit exceeded|over_email_send_rate_limit/i, "Se alcanzó el límite temporal de envíos de correo. Intenta de nuevo en unos minutos."],
    [/over_request_rate_limit|too many requests/i, "Se realizaron demasiados intentos. Espera unos minutos antes de volver a intentarlo."],
    [/error sending confirmation email|error sending recovery email/i, "No se pudo enviar el correo de acceso. El administrador debe revisar la configuración de correo."],
  ];
  return known.find(([pattern]) => pattern.test(message))?.[1] ?? "No pudimos completar la solicitud. Intenta de nuevo en unos minutos.";
}

interface ConfirmationClient {
  resend(credentials: { type: "signup"; email: string }): Promise<{ error: { message: string; code?: string } | null }>;
}
/** UX cooldown only; Supabase enforces its own server limits. Never assume email delivery. */
export async function requestConfirmation(client: ConfirmationClient, email: string, cooldown: number) {
  if (cooldown > 0) return { requested: false, message: "Espera antes de solicitar otro enlace." };
  const normalized = normalizeAuthEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { requested: false, message: "Revisa tu correo electrónico." };
  try {
    const { error } = await client.resend({ type: "signup", email: normalized });
    if (error) return { requested: false, message: translateAuthError(error) };
    return { requested: true, message: confirmationRequestMessage };
  } catch { return { requested: false, message: "No pudimos conectar con el servicio de cuentas. Intenta de nuevo." }; }
}

/** Navigation only; authorization and profile approval remain server-controlled. */
export function authEntryDestination(next: string, role: unknown): string {
  const safe = safeReturnPath(next);
  return safe === professionalWorkspacePath && (role === "PROFESSIONAL" || role === "ADMIN") ? "/panel-profesional" : safe;
}
