import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[professional-signup] Starting signup flow");

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      console.error("[professional-signup] No supabase client");
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 401 }
      );
    }

    console.log("[professional-signup] Creating user:", email);

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("[professional-signup] Auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Error al crear cuenta" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("[professional-signup] No user created");
      return NextResponse.json(
        { error: "No se pudo crear la cuenta" },
        { status: 400 }
      );
    }

    console.log("[professional-signup] User created:", authData.user.id);

    // Create profile with PROFESSIONAL role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        name: email.split("@")[0],
        role: "PROFESSIONAL",
      })
      .select()
      .single();

    if (profileError) {
      console.error("[professional-signup] Profile error:", profileError);
      // Don't fail - continue anyway
    } else {
      console.log("[professional-signup] Profile created:", profileData?.id);
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      redirectTo: "/onboarding/professional-setup",
    });
  } catch (error) {
    console.error("[professional-signup] Unexpected error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
