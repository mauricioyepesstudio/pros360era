import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPreparedKit, type PreparedKit } from "@/data/professional/prepared-kits";

/**
 * The signed-in professional's prepared kit, if the admin attached one when
 * creating the account. Read from app_metadata, which users cannot write.
 */
export async function getMyPreparedKit(): Promise<PreparedKit | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return getPreparedKit(user?.app_metadata?.prepared_kit);
}
