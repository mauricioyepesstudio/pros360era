"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { disconnectMySocial } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";

export async function disconnectInstagramAction() {
  const ok = await disconnectMySocial("instagram");
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=instagram" : "error=desconectar"}`);
}

export async function disconnectLinkedInAction() {
  const ok = await disconnectMySocial("linkedin");
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=linkedin" : "error=desconectar"}`);
}
