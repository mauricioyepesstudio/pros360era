/**
 * Identidad verificada con evidencia (migración 20261116190000, sin aplicar).
 * Funciones puras + llamadas a RPC con la sesión real del usuario: nunca
 * service role. El bucket `verification-evidence` es privado; solo el dueño
 * sube a su carpeta y solo un ADMIN lee o borra.
 */
export const evidenceBucket = "verification-evidence";
export const evidenceMaxBytes = 5 * 1024 * 1024;
const evidenceExtensions = { "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" } as const;

export const ownStatusLabels = {
  NONE: "Aún no has enviado tu documento.",
  PENDING: "Recibimos tu documento. El equipo de EVOLUSA lo está revisando.",
  VERIFIED: "Tu identidad está verificada. Tu perfil público ya muestra la insignia.",
  REJECTED: "No pudimos verificar tu identidad con el documento enviado. Puedes enviar otro.",
  REVOKED: "Tu verificación fue retirada. Puedes enviar un documento nuevo.",
} as const;
export type OwnIdentityStatus = keyof typeof ownStatusLabels;

export function ownIdentityStatus(value: unknown): OwnIdentityStatus {
  return typeof value === "string" && Object.hasOwn(ownStatusLabels, value) ? (value as OwnIdentityStatus) : "NONE";
}

/** Valida el archivo y arma la ruta `<userId>/<marca de tiempo>.<ext>`. */
export function evidencePathFor(userId: string, file: { type: string; size: number }, now = Date.now()) {
  const ext = evidenceExtensions[file.type as keyof typeof evidenceExtensions];
  if (!ext) return { ok: false as const, message: "Sube una foto (JPG o PNG) o un PDF." };
  if (file.size <= 0 || file.size > evidenceMaxBytes) return { ok: false as const, message: "El archivo debe pesar menos de 5 MB." };
  return { ok: true as const, path: `${userId}/${now}.${ext}` };
}

export const submitMessages: Record<string, string> = {
  SUBMITTED: ownStatusLabels.PENDING,
  NOT_APPROVED: "Primero tu perfil debe estar aprobado. Después podrás enviar tu documento.",
  NO_PROFILE: "Todavía no encontramos tu perfil profesional.",
  ALREADY_VERIFIED: ownStatusLabels.VERIFIED,
  INVALID_PATH: "No se pudo guardar el archivo. Inténtalo de nuevo.",
};

export const decisionMessages: Record<string, string> = {
  VERIFIED: "Identidad marcada como verificada.",
  REJECTED: "Verificación rechazada. El profesional puede enviar otro documento.",
  NOTES_REQUIRED: "Escribe una nota de 12 a 500 caracteres sobre lo que revisaste.",
  NO_PENDING_EVIDENCE: "Este perfil no tiene un documento pendiente de revisión.",
  INVALID_DECISION: "Decisión no válida.",
};

export type IdentityDecision = "VERIFIED" | "REJECTED";
export function validDecisionInput(profileId: string, decision: string, notes: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
    && (decision === "VERIFIED" || decision === "REJECTED")
    && notes.trim().length >= 12 && notes.trim().length <= 500;
}

export type AdminIdentityRow = {
  profileId: string; displayName: string; slug: string; category: string; email: string;
  status: OwnIdentityStatus; evidenceUrl: string | null; submittedAt: string | null;
};
