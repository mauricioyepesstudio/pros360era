import { createHash } from "node:crypto";
/** Id estable del perfil de voz dentro de onboarding_responses (mismo patrón que el contexto del negocio). */
export function voiceProfileId(userId: string) {
  const hash = createHash("sha256").update("evolusa:" + "voice-profile-v1:" + userId).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-8${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
