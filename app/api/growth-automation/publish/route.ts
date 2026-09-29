import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    // Get post
    const { data: post } = await supabase
      .from("automated_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Verify ownership
    const { data: profile } = await supabase
      .from("growth_automation_profiles")
      .select("id")
      .eq("id", post.profile_id)
      .eq("user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Get Instagram account
    const { data: account } = await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("id", post.account_id)
      .single();

    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Publish to Instagram (Graph API v18.0)
    const igResponse = await fetch(
      `https://graph.instagram.com/v18.0/${account.account_id}/media`,
      {
        method: "POST",
        body: JSON.stringify({
          image_url: post.image_url,
          caption: post.content_text,
          access_token: account.access_token,
        }),
      }
    );

    const igData = await igResponse.json();

    if (igData.error) {
      await supabase.from("automated_posts").update({ status: "failed" }).eq("id", postId);
      throw new Error(igData.error.message);
    }

    // Mark as published
    await supabase
      .from("automated_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", postId);

    return NextResponse.json({ success: true, igPostId: igData.id });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
