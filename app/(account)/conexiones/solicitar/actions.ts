"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pilotEnabled, profileInquiryInput, type ProfileInquiryInput } from "@/lib/inquiries/validation";

export type InquiryResult =
  | { saved: true; receiptId: string }
  | { saved: false; reason: "DISABLED" | "INVALID" | "AUTH_REQUIRED" | "UNAVAILABLE" | "RATE_LIMITED" | "SERVER_ERROR" };

/**
 * Authenticated M1 pilot only. The database alone chooses the professional
 * owner and creates the CRM lead; this action never accepts owner/user ID.
 * No outbound messages or paid charges.
 */
export async function submitProfileInquiryAction(input: ProfileInquiryInput): Promise<InquiryResult> {
  if (!pilotEnabled()) return { saved: false, reason: "DISABLED" };
  const validated = profileInquiryInput.safeParse(input);
  if (!validated.success) return { saved: false, reason: "INVALID" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, reason: "SERVER_ERROR" };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.is_anonymous) return { saved: false, reason: "AUTH_REQUIRED" };

  const { data, error } = await supabase.rpc("submit_professional_inquiry", {
    p_professional_slug: validated.data.slug,
    p_idempotency_key: validated.data.idempotencyKey,
    p_name: validated.data.name,
    p_email: validated.data.email,
    p_phone: validated.data.phone || null,
    p_service: validated.data.service,
    p_summary: validated.data.summary,
    p_consent: validated.data.consent,
  });

  if (error) {
    // No raw SQL messages or PII to the browser/logs.
    const code = String(error.message ?? "");
    if (code.includes("PILOT_DISABLED")) return { saved: false, reason: "DISABLED" };
    if (code.includes("RATE_LIMITED")) return { saved: false, reason: "RATE_LIMITED" };
    if (code.includes("PROFESSIONAL_UNAVAILABLE") || code.includes("MEMBER_REQUIRED")) return { saved: false, reason: "UNAVAILABLE" };
    return { saved: false, reason: "SERVER_ERROR" };
  }
  return typeof data === "string"
    ? { saved: true, receiptId: data }
    : { saved: false, reason: "SERVER_ERROR" };
}
