import type { ConsentDataCategory, DeclineReason, EffectiveOpportunityStatus, IntentReadiness } from "./types";
import type { ConsultationMode } from "@/data/professional/types";

/**
 * Milestone 04C: user-facing Spanish copy per effective status, for both
 * the member's long-form state view and any compact status label. Pure
 * data — no JSX, no fetching — so it can be unit-tested directly and reused
 * by any component that needs it. CREATED is intentionally absent: a
 * member's own opportunity list only ever surfaces ROUTED-or-later rows
 * (see lib/opportunities/persistence.ts#getMyOpportunities), matching the
 * same status filter get_my_routed_opportunities() already applies.
 */
export type MemberStateCopy = { headline: string; supporting: string };

export const memberStateCopy: Record<Exclude<EffectiveOpportunityStatus, "CREATED">, MemberStateCopy> = {
  ROUTED: {
    headline: "Encontramos una opción compatible.",
    supporting:
      "Compartiste únicamente la información que autorizaste. Ahora estamos esperando que el profesional inicie el contacto.",
  },
  CONTACTED: {
    headline: "Tu conexión ya está en marcha.",
    supporting: "El profesional indicó que inició el contacto contigo.",
  },
  COMPLETED: {
    headline: "Paso completado.",
    supporting: "Tu confirmación ayuda a EVOLUSA a mejorar futuras conexiones.",
  },
  DECLINED: {
    headline: "Esta conexión no continuará.",
    supporting: "Podemos ayudarte a encontrar el siguiente paso.",
  },
  EXPIRED: {
    headline: "Esta conexión necesita un nuevo paso.",
    supporting: "No se confirmó contacto dentro del periodo esperado.",
  },
};

/** Compact label for badges/timelines — never the sole indicator of state (always paired with an icon). */
export const statusLabels: Record<Exclude<EffectiveOpportunityStatus, "CREATED">, string> = {
  ROUTED: "Compatible encontrado",
  CONTACTED: "Contacto iniciado",
  COMPLETED: "Completado",
  DECLINED: "Declinado",
  EXPIRED: "Expirado",
};

/**
 * OTHER is shared by both actors on purpose (see
 * data/opportunities/types.ts#declineReasonsByActor) — one label covers
 * both, since the RPC/DB already scope which reasons are legal for which
 * actor. This map never grows a freeform-text entry.
 */
/** Shown to both sides: the member sees what they authorized, the professional sees what's actually visible to them — same labels, same source of truth. */
export const consentDataCategoryLabels: Record<ConsentDataCategory, string> = {
  NAME: "Nombre",
  CONTACT_EMAIL: "Correo de contacto",
  CITY: "Ciudad",
  STATE: "Estado",
  NEED_SUMMARY: "Resumen de tu necesidad",
};

export const declineReasonLabels: Record<DeclineReason, string> = {
  AT_CAPACITY: "No tengo disponibilidad ahora",
  OUTSIDE_SCOPE: "Está fuera de mi área de servicio",
  UNREACHABLE: "No pude establecer contacto",
  FOUND_HELP_ELSEWHERE: "Encontré ayuda por otro medio",
  NO_LONGER_NEEDED: "Ya no necesito esta ayuda",
  NOT_A_FIT: "No era la opción adecuada",
  OTHER: "Otra razón",
};

/**
 * Milestone 04D — options for the new "start an opportunity" form
 * (components/opportunities/NewOpportunityFlow.tsx). Same pattern as every
 * other label map in this file: pure data, no JSX, reusable by both the
 * form and any future summary view.
 */
export const consultationModeOptions: readonly { value: ConsultationMode; label: string; description?: string }[] = [
  { value: "VIRTUAL", label: "Virtual", description: "Videollamada o llamada telefónica." },
  { value: "IN_PERSON", label: "Presencial", description: "Prefieres reunirte en persona." },
  { value: "BOTH", label: "Cualquiera de las dos", description: "Virtual o presencial, lo que sea más conveniente." },
];

export const intentReadinessOptions: readonly { value: IntentReadiness; label: string; description?: string }[] = [
  { value: "EXPLORING", label: "Explorando opciones", description: "Todavía estás conociendo qué existe." },
  { value: "CONSIDERING", label: "Considerándolo en serio", description: "Ya tienes claro lo que necesitas." },
  { value: "READY_TO_ACT", label: "Listo/a para actuar", description: "Quieres avanzar lo antes posible." },
];
