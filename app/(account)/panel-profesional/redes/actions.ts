"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { disconnectMySocial } from "@/lib/social/connections";
import { SOCIAL_PAGE } from "@/lib/social/instagram";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export async function disconnectFacebookAction() {
  const ok = await disconnectMySocial("facebook");
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=facebook" : "error=desconectar"}`);
}

export async function disconnectThreadsAction() {
  const ok = await disconnectMySocial("threads");
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=threads" : "error=desconectar"}`);
}

/** RLS lets the owner delete only their own row; the encrypted token and the sync log go with it. Contacts already in GoHighLevel stay there. */
export async function disconnectGoHighLevelAction() {
  let ok = false;
  const db = await createSupabaseServerClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (db && user) ok = !(await db.from("crm_ghl_connections").delete().eq("user_id", user.id)).error;
  revalidatePath(SOCIAL_PAGE);
  redirect(`${SOCIAL_PAGE}?${ok ? "desconectado=gohighlevel" : "error=desconectar"}#gohighlevel`);
}
