"use server";
import { revalidatePath } from "next/cache";
import { saveMyProfessionalPlanner } from "@/lib/professional-planner/persistence";
export async function savePlannerAction(value: unknown) {
  const result = await saveMyProfessionalPlanner(value);
  if (result.saved) revalidatePath("/panel-profesional/planner");
  return result;
}
