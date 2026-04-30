"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, Star, Feather } from "lucide-react";

/* ── Inline SVG scene components ── */

function HotAirBalloon() {
  return (
    <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Balloon panels */}
      <ellipse cx="45" cy="52" rx="38" ry="44" fill="#E53E3E" />
      <path d="M7 52 Q45 8 83 52" fill="#F6C90E" opacity="0.9"/>
      <path d="M7 52 Q45 96 83 52" fill="#E53E3E" opacity="0.85"/>
      <path d="M24 12 Q45 4 66 12 L66 92 Q45 100 24 92 Z" fill="#3B82F6" opacity="0.25"/>
      {/* Seams */}
      <line x1="45" y1="8" x2="45" y2="96" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
      <line x1="7" y1="52" x2="83" y2="52" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
      {/* Star on balloon */}
      <polygon points="45,28 47.5,35 55,35 49,39.5 51.5,47 45,42.5 38.5,47 41,39.5 35,35 42.5,35"
        fill="white" opacity="0.9"/>
      {/* Ropes */}
      <line x1="32" y1="92" x2="28" y2="106" stroke="#92400E" strokeWidth="1.5"/>
      <line x1="45" y1="95" x2="45" y2="106" stroke="#92400E" strokeWidth="1.5"/>
      <line x1="58" y1="92" x2="62" y2="106" stroke="#92400E" strokeWidth="1.5"/>
      {/* Basket */}
      <rect x="26" y="106" width="38" height="14" rx="4" fill="#92400E"/>
      <rect x="28" y="108" width="34" height="10" rx="3" fill="#B45309"/>
      <line x1="35" y1="106" x2="35" y2="120" stroke="#78350F" strokeWidth="1.5"/>
      <line x1="55" y1="106" x2="55" y2="120" stroke="#78350F" strokeWidth="1.5"/>
    </svg>
  );
}

function Cloud({ width = 120, opacity = 1 }: { width?: number; opacity?: number }) {
  const h = Math.round(width * 0.5);
  return (
    <svg width={width} height={h} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
      <ellipse cx="60" cy="40" rx="54" ry="20" fill="white"/>
      <ellipse cx="40" cy="34" rx="28" ry="22" fill="white"/>
      <ellipse cx="72" cy="30" rx="30" ry="24" fill="white"/>
      <ellipse cx="52" cy="24" rx="22" ry="18" fill="white"/>
    </svg>
  );
}

function Hills() {
  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full" xmlns="http://www.w3.org/2000/svg">
      {/* Back hills */}
      <path d="M0 180 Q180 60 360 140 Q540 220 720 100 Q900 0 1080 120 Q1260 200 1440 140 L1440 220 L0 220Z"
        fill="#4A9B2F" opacity="0.6"/>
      {/* Mid hills */}
      <path d="M0 200 Q200 100 400 160 Q600 220 800 130 Q1000 60 1200 160 Q1350 220 1440 180 L1440 220 L0 220Z"
        fill="#5DB340" opacity="0.8"/>
      {/* Front grass */}
      <path d="M0 210 Q300 170 600 200 Q900 230 1200 190 Q1350 175 1440 205 L1440 220 L0 220Z"
        fill="#6ABF4B"/>
      {/* Tree left */}
      <rect x="120" y="148" width="10" height="36" fill="#6B3F1A"/>
      <ellipse cx="125" cy="138" rx="24" ry="22" fill="#3D8B27"/>
      <ellipse cx="125" cy="132" rx="18" ry="16" fill="#4AA830"/>
      {/* Tree right */}
      <rect x="1300" y="155" width="10" height="30" fill="#6B3F1A"/>
      <ellipse cx="1305" cy="146" rx="20" ry="18" fill="#3D8B27"/>
      <ellipse cx="1305" cy="141" rx="14" ry="13" fill="#4AA830"/>
      {/* Path */}
      <path d="M700 220 Q680 190 660 180 Q640 172 640 220Z" fill="#D4B896" opacity="0.7"/>
    </svg>
  );
}

function Bird() {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6 Q8 0 0 2" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M12 6 Q16 0 24 2" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Main page ── */

export default function Home() {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerate = async () => {
    if (!idea.trim() || isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate story");
      }

      const story = await res.json();
      sessionStorage.setItem("story", JSON.stringify(story));
      router.push("/story");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Oops! Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const suggestions = [
    "A brave little turtle who wants to fly",
    "A dragon who is scared of fire",
    "A tiny cloud that can't make rain",
    "A lost star trying to find home",
  ];

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #b8e4f9 0%, #7ec8e8 40%, #5ab0d8 70%, #4a9b2f 100%)" }}>

      {/* ── Sky layer ── */}

      {/* Clouds */}
      <div className="absolute top-6 left-[5%] animate-cloud-left pointer-events-none">
        <Cloud width={160} opacity={0.95} />
      </div>
      <div className="absolute top-16 right-[8%] animate-cloud-right pointer-events-none">
        <Cloud width={200} opacity={0.9} />
      </div>
      <div className="absolute top-28 left-[30%] animate-cloud-left pointer-events-none" style={{ animationDelay: "2s" }}>
        <Cloud width={130} opacity={0.8} />
      </div>
      <div className="absolute top-4 right-[35%] animate-cloud-right pointer-events-none" style={{ animationDelay: "3.5s" }}>
        <Cloud width={110} opacity={0.75} />
      </div>

      {/* Hot air balloon */}
      <div className="absolute top-10 right-[14%] animate-balloon pointer-events-none">
        <HotAirBalloon />
      </div>

      {/* Birds */}
      <div className="absolute top-24 left-[22%] animate-bird pointer-events-none opacity-60">
        <Bird />
      </div>
      <div className="absolute top-20 left-[25%] animate-bird pointer-events-none opacity-50" style={{ animationDelay: "0.5s" }}>
        <Bird />
      </div>

      {/* Sparkle stars in sky */}
      {[
        { top: "8%", left: "18%", delay: "0s" },
        { top: "15%", left: "60%", delay: "0.8s" },
        { top: "6%", left: "75%", delay: "1.4s" },
        { top: "22%", left: "42%", delay: "0.3s" },
      ].map((s, i) => (
        <div key={i} className="absolute animate-sparkle pointer-events-none" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          <Star size={10} className="text-yellow-200 fill-yellow-200" />
        </div>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-32 pt-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-bounce-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/30 backdrop-blur rounded-2xl p-3 shadow-lg">
              <BookOpen size={36} className="text-white drop-shadow" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg tracking-tight">
              Story<span className="text-yellow-300">Land</span>
            </h1>
          </div>
          <p className="text-white/90 text-lg font-semibold drop-shadow tracking-wide">
            ✨ Where every idea becomes an adventure!
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-xl">
          <div className="bg-white/92 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/60">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #f0a830, #e08820)" }}>
                <Feather size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-green-900">Create Your Story</h2>
                <p className="text-sm text-green-700/70 font-semibold">Tell us your idea, we&apos;ll write the magic!</p>
              </div>
            </div>

            {/* Textarea */}
            <div className="relative mb-4">
              <textarea
                className="w-full h-32 rounded-2xl border-2 border-green-200 bg-green-50/60 px-5 py-4 text-green-900 font-semibold text-base resize-none focus:outline-none focus:border-amber-400 focus:bg-amber-50/40 transition-all placeholder:text-green-400/70 placeholder:font-medium"
                placeholder="e.g. A brave little turtle who dreams of flying over the mountains…"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={300}
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-4 text-xs text-green-400 font-semibold">
                {idea.length}/300
              </div>
            </div>

            {/* Quick suggestions */}
            <div className="mb-5">
              <p className="text-xs font-bold text-green-600/80 uppercase tracking-wider mb-2">Try one of these ✨</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setIdea(s)}
                    disabled={isLoading}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 transition-all disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!idea.trim() || isLoading}
              className="w-full h-14 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Creating story &amp; illustrations…</span>
                </>
              ) : (
                <>
                  <Sparkles size={22} strokeWidth={2.5} />
                  <span>Generate My Story!</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-green-500/70 font-semibold mt-3">
              Press <kbd className="bg-green-100 px-1.5 py-0.5 rounded text-green-700">⌘ Enter</kbd> to generate
            </p>
          </div>

        </div>
      </div>

      {/* ── Hills at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <Hills />
      </div>
    </main>
  );
}
