'use server';
import { revalidatePath } from 'next/cache';
import { getMyProfessionalDraft, saveMyProfessionalDraft } from '@/lib/professional-drafts/persistence';
export async function saveProfessionalDraftAction(input: unknown) {
  const result = await saveMyProfessionalDraft(input);
  if (result.saved) revalidatePath('/dashboard/professional');
  return result;
}

// Never overwrite an existing private draft when returning from signup/login.
export async function initializeProfessionalDraftAction(input: unknown) {
  if (await getMyProfessionalDraft()) return { saved: true };
  return saveProfessionalDraftAction(input);
}
