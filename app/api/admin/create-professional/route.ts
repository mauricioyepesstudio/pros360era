import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase no está configurado en el servidor" },
        { status: 500 }
      );
    }

    // Same source of truth as getCurrentRole() (lib/account/persistence.ts):
    // profiles.role read under the caller's own session.
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();
    if (callerProfile?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { email, password, fullName, profession, location, instagram, website } = await request.json();

    // Admin verified above. From here on the service-role client (server
    // only, never serialized to the browser) creates the user without
    // touching the admin's own session cookies.
    const admin = createSupabaseServiceRoleClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase no está configurado en el servidor" },
        { status: 500 }
      );
    }

    // 1. Crear usuario con Supabase Auth (no inicia sesión como el nuevo usuario)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        profession,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID returned" }, { status: 400 });
    }

    // 2. Crear perfil PROFESSIONAL (el trigger handle_new_user ya creó la fila)
    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      role: "PROFESSIONAL",
      bio: profession,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // 3. Crear professional_profile
    const { error: profError } = await admin.from("professional_profiles").insert({
      user_id: userId,
      business_name: fullName,
      niche: profession,
      location,
      instagram,
      website,
    });

    if (profError) {
      console.error("Professional profile error:", profError);
    }

    // 4. Asignar servicio Growth Automation
    const { error: serviceError } = await admin.from("user_services").insert({
      user_id: userId,
      service_id: "growth-automation",
      status: "active",
    });

    if (serviceError) {
      console.error("Service error:", serviceError);
    }

    return NextResponse.json(
      {
        message: "✅ Cuenta creada exitosamente",
        userId,
        email,
        profession,
        loginUrl: "/",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
