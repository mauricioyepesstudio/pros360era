"use server";

import { revalidatePath } from "next/cache";
import { updateMyProfessionalProfile } from "@/lib/professional/persistence";
import type { ProfessionalProfileEditableFields } from "@/data/professional/types";

/**
 * Professional-only actions, kept in their own file (mirroring the
 * panel-profesional/oportunidades route grouping) rather than added to the
 * shared app/(account)/actions.ts — this file's only caller is
 * ProfessionalProfileForm, and nothing here is reused by a member-facing
 * surface. updateMyProfessionalProfile (lib/professional/persistence.ts) is
 * the actual authorization boundary via RLS; this action is a thin
 * revalidate-on-success wrapper, same shape as every action in
 * app/(account)/actions.ts.
 */
export async function updateProfessionalProfileAction(fields: ProfessionalProfileEditableFields) {
  const result = await updateMyProfessionalProfile(fields);
  if (result.saved) {
    revalidatePath("/panel-profesional/perfil");
  }
  return result;
}
