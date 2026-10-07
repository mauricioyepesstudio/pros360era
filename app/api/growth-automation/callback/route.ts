import { isGrowthAutomationReady, growthUnavailableMessage } from "@/lib/growth-automation/readiness";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/growth-automation/callback`;

export async function GET(request: NextRequest) {
  if (!isGrowthAutomationReady()) {
    return NextResponse.json({ error: growthUnavailableMessage }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors from Instagram
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/growth-automation/connect?error=${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/growth-automation/connect?error=invalid_state`
    );
  }

  try {
    // Parse state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const platform = stateData.platform;

    if (platform !== "instagram") {
      throw new Error("Unknown platform");
    }

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.instagram.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.append("app_id", INSTAGRAM_APP_ID);
    tokenUrl.searchParams.append("app_secret", INSTAGRAM_APP_SECRET);
    tokenUrl.searchParams.append("grant_type", "authorization_code");
    tokenUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    tokenUrl.searchParams.append("code", code);

    const tokenResponse = await fetch(tokenUrl.toString(), { method: "POST" });
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`Instagram API error: ${tokenData.error.message}`);
    }

    const { access_token, user_id } = tokenData;

    // Get user info from Instagram
    const userUrl = new URL(`https://graph.instagram.com/v18.0/${user_id}`);
    userUrl.searchParams.append("fields", "id,username,name,profile_picture_url,followers_count,media_count");
    userUrl.searchParams.append("access_token", access_token);

    const userResponse = await fetch(userUrl.toString());
    const userData = await userResponse.json();

    if (userData.error) {
      throw new Error(`Instagram API error: ${userData.error.message}`);
    }

    // Save to database
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`
      );
    }

    // Save connected account (placeholder - DB schema comes in next step)
    // TODO: Save to growth_automation_profiles and social_media_accounts tables

    console.log("Connected Instagram account:", {
      userId: user.id,
      instagramUserId: userData.id,
      username: userData.username,
      followers: userData.followers_count,
    });

    // Redirect back to growth-automation dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/growth-automation?connected=instagram`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/growth-automation/connect?error=auth_failed`
    );
  }
}
