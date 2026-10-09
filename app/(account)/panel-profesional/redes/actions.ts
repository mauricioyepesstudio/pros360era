"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { disconnectMyInstagram } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";

export async function disconnectInstagramAction() {
  const ok = await disconnectMyInstagram();
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=instagram" : "error=desconectar"}`);
}
