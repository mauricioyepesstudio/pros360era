import { NextRequest, NextResponse } from "next/server";

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/growth-automation/callback`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (!platform) {
    return NextResponse.json(
      { error: "Platform parameter required" },
      { status: 400 }
    );
  }

  if (platform === "instagram") {
    // Instagram OAuth flow - redirect to Instagram login
    const state = Buffer.from(JSON.stringify({ platform, timestamp: Date.now() })).toString("base64");

    const authUrl = new URL("https://api.instagram.com/oauth/authorize");
    authUrl.searchParams.append("app_id", INSTAGRAM_APP_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", "instagram_basic,instagram_graph_user_media");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);

    return NextResponse.redirect(authUrl.toString());
  }

  return NextResponse.json(
    { error: "Platform not supported yet" },
    { status: 400 }
  );
}
