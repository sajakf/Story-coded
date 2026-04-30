import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a warm, imaginative children's story writer.
Create engaging, age-appropriate stories for kids aged 4–10.
Your stories are gentle, positive, and always end happily.
Always respond with ONLY valid JSON — no markdown, no code blocks, no extra text.`;

const USER_PROMPT = (idea: string) => `Write a 4-page children's story based on this idea: "${idea}".

Return ONLY this exact JSON (no other text, no markdown):
{
  "title": "The Story Title",
  "pages": [
    { "pageNumber": 1, "title": "A Short Chapter Title", "content": "2-3 vivid, engaging sentences for the opening of the story." },
    { "pageNumber": 2, "title": "A Short Chapter Title", "content": "2-3 sentences continuing the adventure." },
    { "pageNumber": 3, "title": "A Short Chapter Title", "content": "2-3 sentences reaching the exciting moment." },
    { "pageNumber": 4, "title": "A Short Chapter Title", "content": "2-3 sentences of a warm happy ending." }
  ]
}`;

const MODELS = [
  "google/gemini-1.5-flash",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-haiku",
];

async function generateStoryText(idea: string, apiKey: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "StoryLand",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT(idea) },
          ],
          temperature: 0.85,
          max_tokens: 900,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Model ${model} error:`, err);
        if (process.env.OPENROUTER_MODEL) throw new Error(err);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (content) return content;
    } catch (err) {
      console.error(`Model ${model} failed:`, err);
      if (process.env.OPENROUTER_MODEL) throw err;
    }
  }
  throw new Error("All models failed");
}

function buildImagePrompt(storyTitle: string, pageTitle: string, content: string): string {
  return [
    "Create a children's picture book illustration.",
    "Style: soft watercolor painting, bright vibrant magical colors, whimsical adorable art.",
    "No text or words in the image.",
    `Story: "${storyTitle}".`,
    `Scene title: "${pageTitle}".`,
    `Scene: ${content}`,
    "Cute friendly characters, warm pastel tones, award-winning picture book quality.",
  ].join(" ");
}

export async function POST(req: Request) {
  const { idea } = await req.json();

  if (!idea?.trim()) {
    return NextResponse.json({ error: "Story idea is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
  }

  // Generate story text with auto-fallback across models
  let raw: string;
  try {
    raw = await generateStoryText(idea.trim(), apiKey);
  } catch {
    return NextResponse.json({ error: "Story generation failed. Please try again." }, { status: 502 });
  }

  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let story;
  try {
    story = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse story JSON:", cleaned);
    return NextResponse.json({ error: "Could not read the story. Please try again." }, { status: 500 });
  }

  if (!story.title || !Array.isArray(story.pages) || story.pages.length < 4) {
    return NextResponse.json({ error: "Story format was unexpected. Please try again." }, { status: 500 });
  }

  // Attach image prompts — images are fetched client-side per page via /api/generate-image
  story.pages = story.pages.map(
    (page: { pageNumber: number; title: string; content: string }) => ({
      ...page,
      imagePrompt: buildImagePrompt(story.title, page.title, page.content),
    })
  );

  return NextResponse.json(story);
}
