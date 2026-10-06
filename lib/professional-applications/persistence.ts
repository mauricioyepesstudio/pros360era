import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isDuplicateApplicationError,
  parseProfessionalApplicationInput,
  type ProfessionalApplicationInput,
} from "./validation";

export type { ProfessionalApplicationInput } from "./validation";

export type SubmitApplicationResult =
  | { saved: true }
  | {
      saved: false;
      reason: "SUPABASE_NOT_CONFIGURED" | "MISSING_REQUIRED_FIELD" | "INVALID_EMAIL" | "INVALID_CATEGORY" | "TOO_LONG" | "SUBMIT_FAILED";
    };

/**
 * No auth required by design — an invited professional should never hit a
 * signup wall before deciding to join. Writes only to
 * professional_applications (migration 0014), never professional_profiles
 * — this is a lead, never a shortcut past the existing operator-run
 * verification runbook. Uses the caller's (usually anon) session: the
 * column-level INSERT grant from 0014 / 20261006 is the only write path.
 */
export async function submitProfessionalApplication(input: ProfessionalApplicationInput): Promise<SubmitApplicationResult> {
  const parsed = parseProfessionalApplicationInput(input);
  if (!parsed.ok) {
    // A filled honeypot gets the same "saved" answer a person would, so bots learn nothing.
    if (parsed.reason === "SPAM") return { saved: true };
    return { saved: false, reason: parsed.reason };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, reason: "SUPABASE_NOT_CONFIGURED" };

  const { error } = await supabase.from("professional_applications").insert(parsed.row);

  // Same email + category already pending: the first submission is kept, so a
  // double click or a retry is not a lost lead and not a duplicate.
  if (isDuplicateApplicationError(error)) return { saved: true };
  if (error) {
    // Error code only: never log the applicant's data.
    console.error("professional_applications insert failed", { code: error.code });
    return { saved: false, reason: "SUBMIT_FAILED" };
  }
  return { saved: true };
}
