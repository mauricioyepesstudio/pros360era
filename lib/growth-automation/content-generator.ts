import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ContentGenerationRequest {
  niche: string;
  tone: "professional" | "casual" | "friendly" | "expert";
  platform: "instagram" | "tiktok" | "youtube";
  topic?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  contentIdeas: string[];
}

export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const platformGuides = {
    instagram: {
      captionLength: "150-300 characters",
      hashtags: "15-30 hashtags",
      format: "Engaging caption with call-to-action",
    },
    tiktok: {
      captionLength: "50-150 characters",
      hashtags: "3-5 hashtags",
      format: "Hook-driven caption for video",
    },
    youtube: {
      captionLength: "500-1000 characters",
      hashtags: "5-10 hashtags",
      format: "Detailed description for shorts",
    },
  };

  const guide = platformGuides[request.platform];

  const prompt = `You are a social media content strategist for a ${request.niche} professional.

Generate engaging content for ${request.platform} with a ${request.tone} tone.

Platform Guidelines:
- Caption length: ${guide.captionLength}
- Hashtags: ${guide.hashtags}
- Format: ${guide.format}

${request.topic ? `Focus Topic: ${request.topic}` : "Create general niche-relevant content"}

${request.includeEmojis ? "Include relevant emojis for engagement." : "Do not use emojis."}

Response format (JSON):
{
  "caption": "The main post caption",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "contentIdeas": [
    "Content idea 1 for similar posts",
    "Content idea 2 for similar posts",
    "Content idea 3 for similar posts"
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content.text;
    const jsonMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr);

    return {
      caption: parsed.caption,
      hashtags: parsed.hashtags || [],
      contentIdeas: parsed.contentIdeas || [],
    };
  } catch (error) {
    console.error("Content generation error:", error);
    // Fallback content
    return {
      caption: `Check out my latest insights on ${request.niche}. What do you think? Let me know in the comments!`,
      hashtags: [request.niche, "professional", "insights"],
      contentIdeas: [
        "Quick tip for your business",
        "Industry insights discussion",
        "Value-driven how-to content",
      ],
    };
  }
}

export async function generateWeekSchedule(
  niche: string,
  platform: "instagram" | "tiktok" | "youtube"
): Promise<ContentGenerationRequest[]> {
  const schedule: ContentGenerationRequest[] = [
    {
      niche,
      tone: "professional",
      platform,
      topic: "Monday Motivation: Industry insights",
      includeHashtags: true,
      includeEmojis: true,
    },
    {
      niche,
      tone: "friendly",
      platform,
      topic: "Wednesday Tips: Quick business advice",
      includeHashtags: true,
      includeEmojis: true,
    },
    {
      niche,
      tone: "expert",
      platform,
      topic: "Friday Insights: Market trends",
      includeHashtags: true,
      includeEmojis: true,
    },
    {
      niche,
      tone: "casual",
      platform,
      topic: "Success story or case study",
      includeHashtags: true,
      includeEmojis: true,
    },
  ];

  return schedule;
}
