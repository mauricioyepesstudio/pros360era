import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateContent, generateWeekSchedule } from "@/lib/growth-automation/content-generator";

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

    const body = await request.json();
    const { type, niche, platform, topic, tone = "professional" } = body;

    if (type === "generate") {
      const content = await generateContent({
        niche,
        tone: tone || "professional",
        platform,
        topic,
        includeHashtags: true,
        includeEmojis: true,
      });

      return NextResponse.json(content);
    }

    if (type === "week") {
      const schedule = await generateWeekSchedule(niche, platform);

      // Generate content for each day
      const contentItems = await Promise.all(
        schedule.map((req) => generateContent(req))
      );

      return NextResponse.json({
        schedule: schedule.map((s, idx) => ({
          ...s,
          ...contentItems[idx],
        })),
      });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error) {
    console.error("Content generation API error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
