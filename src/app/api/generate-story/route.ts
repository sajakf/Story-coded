import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a warm, imaginative children's story writer.
Create engaging, age-appropriate stories for kids aged 4–10.
Your stories are gentle, positive, and end happily.
Always respond with ONLY valid JSON — no markdown, no code blocks, no extra text.`;

const USER_PROMPT = (idea: string) => `Write a 4-page children's story based on this idea: "${idea}".

Return ONLY this JSON structure (no other text):
{
  "title": "The Story Title",
  "pages": [
    { "pageNumber": 1, "title": "A Short Chapter Title", "content": "2-3 sentences of vivid, engaging story text for kids." },
    { "pageNumber": 2, "title": "A Short Chapter Title", "content": "2-3 sentences continuing the adventure." },
    { "pageNumber": 3, "title": "A Short Chapter Title", "content": "2-3 sentences reaching the exciting moment." },
    { "pageNumber": 4, "title": "A Short Chapter Title", "content": "2-3 sentences of the happy ending." }
  ]
}`;

export async function POST(req: Request) {
  const { idea } = await req.json();

  if (!idea?.trim()) {
    return NextResponse.json({ error: "Story idea is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
  }

  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "StoryLand",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT(idea) },
      ],
      temperature: 0.85,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenRouter error:", err);
    return NextResponse.json({ error: "Story generation failed. Please try again." }, { status: 502 });
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  // Strip markdown code fences if the model wraps it
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let story;
  try {
    story = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse story JSON:", cleaned);
    return NextResponse.json({ error: "Could not parse the generated story. Please try again." }, { status: 500 });
  }

  // Validate shape
  if (!story.title || !Array.isArray(story.pages) || story.pages.length < 4) {
    return NextResponse.json({ error: "Story format was unexpected. Please try again." }, { status: 500 });
  }

  return NextResponse.json(story);
}
