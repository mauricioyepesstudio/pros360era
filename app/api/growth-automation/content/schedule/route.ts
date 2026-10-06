import { isGrowthAutomationReady, growthUnavailableMessage } from "@/lib/growth-automation/readiness";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isGrowthAutomationReady()) {
    return NextResponse.json({ error: growthUnavailableMessage }, { status: 503 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, accountId, contentText, imageUrl, scheduledFor } = body;

    if (!profileId || !accountId || !contentText || !scheduledFor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify profile ownership
    const { data: profile } = await supabase
      .from("growth_automation_profiles")
      .select("id")
      .eq("id", profileId)
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Create scheduled post
    const { data: post, error } = await supabase
      .from("automated_posts")
      .insert({
        profile_id: profileId,
        account_id: accountId,
        content_text: contentText,
        image_url: imageUrl,
        status: "scheduled",
        scheduled_for: scheduledFor,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      post,
      message: `Post scheduled for ${new Date(scheduledFor).toLocaleString()}`,
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to schedule post" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isGrowthAutomationReady()) {
    return NextResponse.json({ error: growthUnavailableMessage }, { status: 503 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("growth_automation_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 });
    }

    // Get scheduled posts
    const { data: posts } = await supabase
      .from("automated_posts")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("status", "scheduled")
      .gte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true });

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error("Fetch schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
