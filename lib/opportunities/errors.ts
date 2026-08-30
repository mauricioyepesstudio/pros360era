export type OpportunityActionFailureReason = "SUPABASE_NOT_CONFIGURED" | "NOT_SIGNED_IN" | "DB_ERROR";

const opportunityFailureMessages: Record<OpportunityActionFailureReason, string> = {
  SUPABASE_NOT_CONFIGURED: "La conexión de EVOLUSA no está disponible en este momento. Intenta de nuevo más tarde.",
  NOT_SIGNED_IN: "Tu sesión terminó. Inicia sesión nuevamente para continuar.",
  DB_ERROR: "No pudimos procesar tu solicitud en este momento. Intenta de nuevo en unos minutos.",
};

/**
 * Maps the deliberately small server-action failure contract to safe copy.
 * Database/provider error objects never cross the Server Action boundary.
 */
export function getOpportunityFailureMessage(reason: OpportunityActionFailureReason): string {
  return opportunityFailureMessages[reason];
}
