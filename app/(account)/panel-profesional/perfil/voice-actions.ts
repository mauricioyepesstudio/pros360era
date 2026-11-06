"use server";
import { revalidatePath } from "next/cache";
import { draftWithMyVoice, saveMyVoiceProfile } from "@/lib/cerebro/persistence";
export async function saveVoiceProfileAction(value: unknown) {
  const result = await saveMyVoiceProfile(value);
  if (result.saved) revalidatePath("/panel-profesional/perfil");
  return result;
}
export async function draftWithVoiceAction(input: { platform: unknown; topic: unknown }) {
  return draftWithMyVoice(input);
}
