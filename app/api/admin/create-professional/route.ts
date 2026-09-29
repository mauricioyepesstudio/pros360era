import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { email, password, fullName, profession, location, instagram, website } = await request.json();

    // 1. Crear usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          profession,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID returned" }, { status: 400 });
    }

    // 2. Crear perfil PROFESSIONAL
    const { error: profileError } = await supabase.from("profiles").insert({
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
    const { error: profError } = await supabase.from("professional_profiles").insert({
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
    const { error: serviceError } = await supabase.from("user_services").insert({
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
