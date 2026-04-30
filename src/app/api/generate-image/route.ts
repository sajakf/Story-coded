import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

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
        model: "google/gemini-2.5-flash-preview-05-20:thinking",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
      signal: AbortSignal.timeout(40000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter image error:", err);

      // Try fallback model
      const res2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "StoryLand",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
        signal: AbortSignal.timeout(40000),
      });

      if (!res2.ok) {
        console.error("Fallback image model failed:", await res2.text());
        return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
      }

      const data2 = await res2.json();
      const url2 = data2.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
      if (!url2) return NextResponse.json({ error: "No image in response" }, { status: 500 });
      return NextResponse.json({ imageUrl: url2 });
    }

    const data = await res.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: "No image in response" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Image generation exception:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
