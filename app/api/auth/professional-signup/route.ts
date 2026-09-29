import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // Update user metadata to mark as professional
    await supabase.auth.admin?.updateUserById(data.user.id, {
      user_metadata: {
        role: "PROFESSIONAL",
      },
    });

    // Create profile with PROFESSIONAL role
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        name: email.split("@")[0],
        role: "PROFESSIONAL",
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Continue anyway, user can be set up manually
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      redirectTo: "/onboarding/professional-setup",
    });
  } catch (error) {
    console.error("Error in professional-signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
