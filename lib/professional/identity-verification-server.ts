import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  decisionMessages, evidenceBucket, ownIdentityStatus, submitMessages, validDecisionInput,
  type AdminIdentityRow, type IdentityDecision, type OwnIdentityStatus,
} from "./identity-verification";

/** Estado propio (NONE si la migración aún no está aplicada o no hay sesión). */
export async function getMyIdentityStatus(): Promise<OwnIdentityStatus> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "NONE";
  const { data, error } = await supabase.rpc("get_own_identity_verification_status");
  return error ? "NONE" : ownIdentityStatus(data);
}

/** Registra la evidencia que el navegador ya subió a `<uid>/...` y borra la anterior. */
export async function submitMyIdentityEvidence(path: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, message: "No se pudo conectar con tu cuenta." };
  const { data, error } = await supabase.rpc("submit_own_identity_evidence", { p_evidence_path: path });
  const row = Array.isArray(data) ? (data[0] as { submit_state?: string; replaced_path?: string | null }) : undefined;
  if (error || !row?.submit_state) {
    await supabase.storage.from(evidenceBucket).remove([path]);
    return { saved: false, message: "No se pudo enviar tu documento. Inténtalo de nuevo." };
  }
  const saved = row.submit_state === "SUBMITTED";
  const toRemove = saved ? row.replaced_path : path;
  if (toRemove) await supabase.storage.from(evidenceBucket).remove([toRemove]);
  return { saved, message: submitMessages[row.submit_state] ?? submitMessages.INVALID_PATH };
}

/** ADMIN: cola con enlace firmado de 10 minutos al documento pendiente. */
export async function getIdentityVerificationQueue(): Promise<AdminIdentityRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_list_identity_verifications");
  if (error || !Array.isArray(data)) return [];
  return Promise.all(data.map(async (row: Record<string, unknown>) => {
    const path = (row.evidence_path as string | null) ?? null;
    const signed = path ? await supabase.storage.from(evidenceBucket).createSignedUrl(path, 600) : null;
    return {
      profileId: String(row.profile_id), displayName: String(row.display_name), slug: String(row.slug),
      category: String(row.category), email: String(row.email), status: ownIdentityStatus(row.status),
      evidenceUrl: signed?.data?.signedUrl ?? null, submittedAt: (row.evidence_submitted_at as string | null) ?? null,
    };
  }));
}

/** ADMIN: decide y borra el documento revisado. */
export async function decideIdentityVerification(profileId: string, decision: IdentityDecision, notes: string) {
  if (!validDecisionInput(profileId, decision, notes)) return { saved: false, message: decisionMessages.NOTES_REQUIRED };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, message: "No se pudo conectar con la cuenta." };
  const { data, error } = await supabase.rpc("admin_decide_identity_verification", {
    p_profile_id: profileId, p_decision: decision, p_notes: notes.trim(),
  });
  const row = Array.isArray(data) ? (data[0] as { decision_state?: string; removed_path?: string | null }) : undefined;
  if (error || !row?.decision_state) return { saved: false, message: "No se pudo guardar. Comprueba tu sesión de administrador." };
  if (row.removed_path) await supabase.storage.from(evidenceBucket).remove([row.removed_path]);
  return { saved: row.decision_state === decision, message: decisionMessages[row.decision_state] ?? "Respuesta inesperada." };
}
