import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfessionalApplicationInput = {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  categoryOfInterest: string;
  credentialInfo?: string;
  bio?: string;
  notes?: string;
};

export type SubmitApplicationResult =
  | { saved: true }
  | { saved: false; reason: "SUPABASE_NOT_CONFIGURED" | "MISSING_REQUIRED_FIELD" | "SUBMIT_FAILED" };

/**
 * No auth required by design — an invited professional should never hit a
 * signup wall before deciding to join. Writes only to
 * professional_applications (migration 0014), never professional_profiles
 * — this is a lead, never a shortcut past the existing operator-run
 * verification runbook.
 */
export async function submitProfessionalApplication(input: ProfessionalApplicationInput): Promise<SubmitApplicationResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  if (!fullName || !email || !input.categoryOfInterest) {
    return { saved: false, reason: "MISSING_REQUIRED_FIELD" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, reason: "SUPABASE_NOT_CONFIGURED" };

  const { error } = await supabase.from("professional_applications").insert({
    full_name: fullName,
    email,
    phone: input.phone?.trim() || null,
    city: input.city?.trim() || null,
    category_of_interest: input.categoryOfInterest,
    credential_info: input.credentialInfo?.trim() || null,
    bio: input.bio?.trim() || null,
    notes: input.notes?.trim() || null,
  });

  if (error) return { saved: false, reason: "SUBMIT_FAILED" };
  return { saved: true };
}
