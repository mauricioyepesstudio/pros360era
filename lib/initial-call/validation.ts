export const initialCallVersion = "initial-call-v1";
export const callTopics = { CONOCER_EVOLUSA: "Conocer EVOLUSA", RECORRIDO_PERSONAL: "Entender mi recorrido", ESPACIO_PROFESIONAL: "Preparar mi espacio profesional", NEGOCIO_Y_MARKETING: "Negocio y marketing" } as const;
export const callWindows = { WEEKDAY_MORNING: "Entre semana · mañana", WEEKDAY_AFTERNOON: "Entre semana · tarde", WEEKDAY_EVENING: "Entre semana · noche", WEEKEND: "Fin de semana" } as const;
export type InitialCallInput = { preferredName: string; topic: keyof typeof callTopics; availability: keyof typeof callWindows; timeZone: string; consent: true };
export type InitialCallRequest = Omit<InitialCallInput, "consent"> & ({status: "REQUESTED"; consent: true} | {status: "CANCELED"; consent: false});
export function parseInitialCallInput(value: unknown): InitialCallInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(k => !["preferredName", "topic", "availability", "timeZone", "consent"].includes(k))) return null;
  const preferredName = typeof v.preferredName === "string" ? v.preferredName.trim().replace(/\s+/g, " ") : "";
  if (preferredName.length < 2 || preferredName.length > 100) return null;
  if (typeof v.topic !== "string" || !Object.hasOwn(callTopics, v.topic) || typeof v.availability !== "string" || !Object.hasOwn(callWindows, v.availability) || v.consent !== true || typeof v.timeZone !== "string" || v.timeZone.length > 80) return null;
  try { new Intl.DateTimeFormat("es", { timeZone: v.timeZone }); } catch { return null; }
  return { preferredName, topic: v.topic as InitialCallInput["topic"], availability: v.availability as InitialCallInput["availability"], timeZone: v.timeZone, consent: true };
}
export function parseStoredInitialCall(value: unknown): InitialCallRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { status, ...input } = value as Record<string, unknown>;
  if (status === "CANCELED" && input.consent === false) {
    const parsed = parseInitialCallInput({...input, consent: true});
    return parsed ? {...parsed, consent: false, status: "CANCELED"} : null;
  }
  const parsed = parseInitialCallInput(input);
  return parsed && status === "REQUESTED" ? {...parsed, status: "REQUESTED"} : null;
}
