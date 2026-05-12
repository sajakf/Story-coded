import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "✅ set" : "❌ missing",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? "✅ set" : "❌ missing",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "❌ missing",
  });
}
