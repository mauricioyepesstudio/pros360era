"use server";
import { revalidatePath } from "next/cache";
import { proposeBrandKitFromAccounts, saveMyBrandKit } from "@/lib/cerebro/persistence";

export async function saveBrandKitAction(value: unknown) {
  const result = await saveMyBrandKit(value);
  if (result.saved) for (const route of ["/panel-profesional/marca", "/panel-profesional/planner"]) revalidatePath(route);
  return result;
}

/** Lee la web y el Instagram enlazados y devuelve un borrador. No guarda nada. */
export async function proposeBrandKitAction(input: { websiteUrl?: unknown }) {
  return proposeBrandKitFromAccounts({ websiteUrl: input?.websiteUrl });
}
