import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No authenticated user" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, category, consultationMode, city, phone } = body;

    // Create professional profile
    const { data, error } = await supabase
      .from("professional_profiles")
      .insert({
        user_id: user.id,
        display_name: displayName || "Professional",
        slug: displayName?.toLowerCase().replace(/\s+/g, "-") || "professional",
        category: category || "BUSINESS_MARKETING",
        consultation_mode: consultationMode || "BOTH",
        bio: `${displayName} - Immigration Professional`,
        languages: ["Spanish", "English"],
        city: city || "",
        phone: phone || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating professional profile:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create growth automation profile
    const { error: automationError } = await supabase
      .from("growth_automation_profiles")
      .insert({
        user_id: user.id,
        professional_id: data.id,
        automation_enabled: false,
        content_frequency: "DAILY",
        posting_time: "10:00",
      });

    if (automationError) {
      console.error("Error creating automation profile:", automationError);
      return NextResponse.json(
        { error: automationError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      professionalProfile: data,
    });
  } catch (error) {
    console.error("Error in create-profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
