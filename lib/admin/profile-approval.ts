export const approvalLabels = {
  APPROVABLE: "Perfil pendiente de aprobación",
  APPROVED: "Perfil aprobado",
  NO_ACCOUNT: "La solicitud todavía no tiene una cuenta registrada",
  AMBIGUOUS_ACCOUNT: "La cuenta vinculada requiere revisión",
  UNCONFIRMED_EMAIL: "La cuenta debe confirmar su correo",
  NO_PROFILE: "La cuenta todavía no tiene un perfil profesional",
  INELIGIBLE_ROLE: "La cuenta no tiene un rol profesional",
  CATEGORY_MISMATCH: "La categoría de la solicitud no coincide con la del perfil",
  CATEGORY_NOT_ENABLED: "Esta categoría requiere un proceso de aprobación específico",
  VERIFICATION_REQUIRED: "Falta verificar la comisión de Notary Public antes de aprobar",
  APPLICATION_NOT_FOUND: "No se encontró la solicitud",
  UPDATE_NOT_CONFIRMED: "No se confirmó la aprobación. Actualiza e inténtalo de nuevo",
  UNAVAILABLE: "No se pudo consultar la aprobación. Actualiza la página",
  PROFILE_NOT_FOUND: "No se encontró el perfil",
  REASON_REQUIRED: "Escribe un motivo de 12 a 500 caracteres",
} as const;
export type ApplicationApprovalState = keyof typeof approvalLabels;
export function applicationApprovalState(value: unknown): ApplicationApprovalState {
  return typeof value === "string" && Object.hasOwn(approvalLabels, value)
    ? value as ApplicationApprovalState : "UNAVAILABLE";
}
type ApprovalClient = { rpc: (name: string, args: {p_application_id: string}) =>
  PromiseLike<{data: unknown; error: unknown}> };
export async function requestProfileApproval(client: ApprovalClient, applicationId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId)) {
    return {saved: false, message: "La solicitud no es válida"};
  }
  try {
    const {data, error} = await client.rpc("admin_approve_application_profile", {p_application_id: applicationId});
    if (error) return {saved: false, message: "No se pudo aprobar el perfil. Comprueba tu sesión de administrador"};
    const state = applicationApprovalState(data);
    return {saved: state === "APPROVED", message: approvalLabels[state]};
  } catch {
    return {saved: false, message: "No se pudo confirmar la aprobación. Actualiza antes de intentarlo otra vez"};
  }
}

type ExistingApprovalClient = { rpc: (name: string, args: {p_profile_id: string; p_expected_category: string; p_reason: string}) => PromiseLike<{data: unknown; error: unknown}> };
export async function requestExistingProfileApproval(client: ExistingApprovalClient, profileId: string, expectedCategory: string, reason: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) return {saved: false, message: "El perfil no es válido"};
  if (reason.trim().length < 12 || reason.trim().length > 500) return {saved: false, message: approvalLabels.REASON_REQUIRED};
  try {
    const {data, error} = await client.rpc("admin_approve_existing_profile", {p_profile_id: profileId, p_expected_category: expectedCategory, p_reason: reason.trim()});
    if (error) return {saved: false, message: "No se pudo aprobar el perfil. Comprueba tu sesión de administrador"};
    const state = applicationApprovalState(data);
    return {saved: state === "APPROVED", message: approvalLabels[state]};
  } catch { return {saved: false, message: "No se pudo confirmar la aprobación. Actualiza antes de intentarlo otra vez"}; }
}
