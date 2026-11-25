"use server";

import { revalidatePath } from "next/cache";
import { decideIdentityVerification, submitMyIdentityEvidence } from "@/lib/professional/identity-verification-server";
import type { IdentityDecision } from "@/lib/professional/identity-verification";

/** La sesión del llamador decide todo: las RPC re-validan dueño y rol ADMIN. */
export async function submitIdentityEvidenceAction(path: string) {
  const result = await submitMyIdentityEvidence(path);
  revalidatePath("/panel-profesional/perfil");
  return result;
}

export async function decideIdentityVerificationAction(profileId: string, decision: IdentityDecision, notes: string) {
  const result = await decideIdentityVerification(profileId, decision, notes);
  if (result.saved) {
    revalidatePath("/admin");
    revalidatePath("/panel-profesional/perfil");
    revalidatePath("/profesionales", "layout");
    revalidatePath("/conexiones");
  }
  return result;
}
