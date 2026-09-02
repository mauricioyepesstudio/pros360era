"use server";

import { submitProfessionalApplication, type ProfessionalApplicationInput } from "@/lib/professional-applications/persistence";

export async function submitProfessionalApplicationAction(input: ProfessionalApplicationInput) {
  return submitProfessionalApplication(input);
}
