import { isGrowthAutomationReady, growthUnavailableMessage } from "@/lib/growth-automation/readiness";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

    // Get user's growth automation profile
    const { data: profile } = await supabase
      .from("growth_automation_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "No growth automation profile found" },
        { status: 404 }
      );
    }

    // Get connected accounts
    const { data: accounts } = await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("profile_id", profile.id);

    // Get recent posts stats
    const { data: posts } = await supabase
      .from("automated_posts")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });

    // Get leads stats
    const { data: leads } = await supabase
      .from("qualified_leads")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate metrics
    const totalFollowers = accounts?.reduce((sum, acc) => sum + (acc.followers_count || 0), 0) || 0;
    const totalPosts = posts?.length || 0;
    const totalEngagement = posts?.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) || 0;
    const averageEngagement = totalPosts > 0 ? (totalEngagement / totalPosts).toFixed(2) : "0";
    const totalLeads = leads?.length || 0;
    const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.actual_revenue || 0), 0) || 0;

    return NextResponse.json({
      profile,
      accounts: accounts || [],
      stats: {
        totalFollowers,
        totalPosts,
        averageEngagement: parseFloat(averageEngagement as string),
        totalLeads,
        totalRevenue,
        estimatedMonthlyRevenue: profile.platform_commission_percentage
          ? totalRevenue * (1 - profile.platform_commission_percentage / 100)
          : 0,
      },
      posts: posts || [],
      leads: leads || [],
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
