import { createSupabaseServerClient } from "@/lib/supabase/server";
import { initialCallId } from "./identity";
import { initialCallVersion, parseInitialCallInput, parseStoredInitialCall } from "./validation";
export async function getMyInitialCall() {
  const db = await createSupabaseServerClient();
  if (!db) return { request: null, available: false };
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (!user || authError) return { request: null, available: false };
  const { data, error } = await db.from("onboarding_responses").select("answers").eq("id", initialCallId(user.id)).eq("user_id",user.id).eq("roadmap_version", initialCallVersion).maybeSingle();
  return { request: parseStoredInitialCall(data?.answers), available: !error };
}
export async function saveMyInitialCall(value: unknown) {
  const input = parseInitialCallInput(value);
  if (!input) return { saved: false, message: "Revisa el tema, la disponibilidad, tu zona horaria y la autorización de contacto." };
  const db = await createSupabaseServerClient();
  if (!db) return { saved: false, message: "El servicio de cuentas no está disponible." };
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (!user || authError || !user.email || !user.email_confirmed_at) return { saved: false, message: "Inicia sesión con un correo confirmado para enviar la solicitud." };
  const answers = { ...input, status: "REQUESTED" as const };
  const { data, error } = await db.from("onboarding_responses").upsert({ id: initialCallId(user.id), user_id: user.id, answers, selected_needs: [], roadmap_version: initialCallVersion }, { onConflict: "id" }).select("answers").single();
  return error || !parseStoredInitialCall(data?.answers) ? { saved: false, message: "No pudimos guardar tu solicitud. Reintenta; tus opciones siguen en el formulario." } : { saved: true, message: "Solicitud recibida. Todavía no hay hora ni enlace de videollamada." };
}
export async function cancelMyInitialCall() {
  const db = await createSupabaseServerClient();
  if (!db) return { saved: false, message: "El servicio de cuentas no está disponible." };
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (!user || authError) return { saved: false, message: "Inicia sesión para cancelar." };
  const id = initialCallId(user.id);
  const { data: existing, error: readError } = await db.from("onboarding_responses").select("answers").eq("id", id).eq("user_id", user.id).eq("roadmap_version", initialCallVersion).maybeSingle();
  const current = parseStoredInitialCall(existing?.answers);
  if (readError || !current) return { saved: false, message: "No encontramos una solicitud que puedas cancelar." };
  const { data, error } = await db.from("onboarding_responses").update({ answers: { ...current, consent: false, status: "CANCELED" } }).eq("id", id).eq("user_id", user.id).eq("roadmap_version", initialCallVersion).select("id").maybeSingle();
  return error || !data ? { saved: false, message: "No pudimos cancelar. Inténtalo de nuevo." } : { saved: true, message: "Solicitud cancelada. Retiraste la autorización para coordinar esta llamada." };
}
