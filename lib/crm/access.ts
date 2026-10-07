import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { crmRoleAllowed } from "@/lib/crm/validation";

export async function getCRMAccess() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { response: NextResponse.json({ error: "CRM no disponible." }, { status: 503 }) };
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 }) };
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError) return { response: NextResponse.json({ error: "CRM no disponible." }, { status: 503 }) };
  if (!crmRoleAllowed(profile?.role)) return { response: NextResponse.json({ error: "Este espacio está disponible para profesionales." }, { status: 403 }) };
  return { supabase, user };
}
