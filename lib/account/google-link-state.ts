import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOwnGoogleLinkState() {
  try {
    const client = await createSupabaseServerClient();
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      googleEmails: (data.user.identities ?? [])
        .filter(identity => identity.provider === "google")
        .map(identity => typeof identity.identity_data?.email === "string" ? identity.identity_data.email : "Cuenta Google vinculada"),
    };
  } catch { return null; }
}
