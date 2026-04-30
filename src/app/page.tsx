"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, Feather } from "lucide-react";

/* ── Scene components ── */

const STAR_DATA = [
  { top: "6%",  left: "8%",  size: 18, color: "#a8d8a0", dur: "2.8s", delay: "0s"    },
  { top: "12%", left: "22%", size: 12, color: "#c4a8d8", dur: "3.4s", delay: "0.6s"  },
  { top: "5%",  left: "40%", size: 20, color: "#e8b870", dur: "2.5s", delay: "1.1s"  },
  { top: "18%", left: "55%", size: 10, color: "#89b4e8", dur: "4.0s", delay: "0.3s"  },
  { top: "9%",  left: "70%", size: 14, color: "#f0d060", dur: "3.1s", delay: "1.8s"  },
  { top: "22%", left: "82%", size: 16, color: "#a8d8a0", dur: "2.9s", delay: "0.9s"  },
  { top: "30%", left: "12%", size: 10, color: "#e8b870", dur: "3.7s", delay: "1.4s"  },
  { top: "35%", left: "30%", size: 8,  color: "#c4a8d8", dur: "2.6s", delay: "2.1s"  },
  { top: "28%", left: "65%", size: 12, color: "#f0a8a8", dur: "3.3s", delay: "0.5s"  },
  { top: "42%", left: "88%", size: 9,  color: "#89b4e8", dur: "4.2s", delay: "1.7s"  },
  { top: "48%", left: "5%",  size: 11, color: "#f0d060", dur: "3.0s", delay: "0.2s"  },
  { top: "15%", left: "92%", size: 15, color: "#a8e8d0", dur: "2.7s", delay: "1.3s"  },
];

function Stars() {
  return (
    <>
      {STAR_DATA.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-twinkle"
          style={{ top: s.top, left: s.left, "--dur": s.dur, animationDelay: s.delay } as React.CSSProperties}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill={s.color}>
            <polygon points="12,2 14.5,9 22,9 16,14 18.5,21 12,17 5.5,21 8,14 2,9 9.5,9" />
          </svg>
        </div>
      ))}
    </>
  );
}

function Moon() {
  return (
    <div className="absolute top-6 right-10 md:right-20 animate-moon-glow pointer-events-none">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="mg" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fffaaa" />
            <stop offset="100%" stopColor="#f5e042" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#mg)" />
        {/* Crescent cutout */}
        <circle cx="76" cy="34" r="34" fill="#0d1535" />
      </svg>
    </div>
  );
}

function TreeWithOwl() {
  return (
    <div className="absolute bottom-0 right-4 md:right-12 pointer-events-none" style={{ width: 160, height: 320 }}>
      <svg width="160" height="320" viewBox="0 0 160 320" fill="none">
        {/* Trunk */}
        <path d="M55 320 L55 90 Q55 68 80 68 Q105 68 105 90 L105 320" fill="#2a1005" />
        {/* Texture lines on trunk */}
        <path d="M65 200 Q75 190 85 200" stroke="#1a0a03" strokeWidth="2" fill="none" />
        <path d="M70 240 Q80 230 90 240" stroke="#1a0a03" strokeWidth="2" fill="none" />
        {/* Tree hollow */}
        <ellipse cx="80" cy="175" rx="26" ry="30" fill="#0f0602" />
        {/* Branch left */}
        <path d="M55 130 Q25 110 5 118" stroke="#2a1005" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M55 150 Q30 140 12 148" stroke="#2a1005" strokeWidth="9" strokeLinecap="round" fill="none" />
        {/* Branch right */}
        <path d="M105 110 Q135 92 155 100" stroke="#2a1005" strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* ── Owl body (peeking) ── */}
        {/* Fluffy body */}
        <ellipse cx="80" cy="184" rx="22" ry="20" fill="#7a9ab8" />
        {/* Belly */}
        <ellipse cx="80" cy="188" rx="14" ry="14" fill="#c8dcea" />
        {/* Left eye */}
        <circle cx="71" cy="175" r="9" fill="#f0d060" />
        <circle className="animate-owl-blink" cx="71" cy="175" r="6" fill="#18182a" style={{ transformOrigin: "71px 175px" }} />
        <circle cx="73" cy="173" r="2" fill="white" />
        {/* Right eye */}
        <circle cx="89" cy="175" r="9" fill="#f0d060" />
        <circle className="animate-owl-blink" cx="89" cy="175" r="6" fill="#18182a" style={{ transformOrigin: "89px 175px", animationDelay: "0.08s" }} />
        <circle cx="91" cy="173" r="2" fill="white" />
        {/* Beak */}
        <polygon points="80,180 76,186 84,186" fill="#d08030" />
        {/* Ear tufts */}
        <polygon points="68,162 65,150 74,160" fill="#7a9ab8" />
        <polygon points="92,162 95,150 86,160" fill="#7a9ab8" />
        {/* Spots */}
        <circle cx="72" cy="192" r="2.5" fill="white" opacity="0.65" />
        <circle cx="80" cy="196" r="2"   fill="white" opacity="0.65" />
        <circle cx="88" cy="192" r="2.5" fill="white" opacity="0.65" />
        {/* Feet gripping hollow edge */}
        <path d="M68 200 Q65 208 60 210 M68 200 Q66 210 63 214 M68 200 Q70 210 68 215" stroke="#b87030" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M92 200 Q95 208 100 210 M92 200 Q94 210 97 214 M92 200 Q90 210 92 215" stroke="#b87030" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function Foliage() {
  return (
    <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full" style={{ display: "block" }}>
      {/* Back layer */}
      <ellipse cx="80"   cy="140" rx="90"  ry="50" fill="#06091a" />
      <ellipse cx="220"  cy="148" rx="110" ry="44" fill="#070b1e" />
      <ellipse cx="400"  cy="145" rx="85"  ry="42" fill="#06091a" />
      <ellipse cx="600"  cy="150" rx="130" ry="48" fill="#080d20" />
      <ellipse cx="800"  cy="144" rx="100" ry="46" fill="#06091a" />
      <ellipse cx="1000" cy="148" rx="120" ry="50" fill="#070b1e" />
      <ellipse cx="1200" cy="145" rx="95"  ry="44" fill="#06091a" />
      <ellipse cx="1380" cy="142" rx="80"  ry="46" fill="#070b1e" />
      {/* Front layer (slightly lighter) */}
      <ellipse cx="30"   cy="155" rx="60"  ry="36" fill="#0a1028" />
      <ellipse cx="160"  cy="158" rx="75"  ry="32" fill="#0b1230" />
      <ellipse cx="340"  cy="156" rx="65"  ry="34" fill="#0a1028" />
      <ellipse cx="520"  cy="160" rx="90"  ry="38" fill="#0b1230" />
      <ellipse cx="720"  cy="155" rx="70"  ry="36" fill="#0a1028" />
      <ellipse cx="920"  cy="158" rx="85"  ry="34" fill="#0b1230" />
      <ellipse cx="1100" cy="154" rx="75"  ry="36" fill="#0a1028" />
      <ellipse cx="1300" cy="157" rx="80"  ry="38" fill="#0b1230" />
      <ellipse cx="1430" cy="155" rx="50"  ry="32" fill="#0a1028" />
      {/* Ground fill */}
      <rect x="0" y="148" width="1440" height="12" fill="#060818" />
    </svg>
  );
}

function FogLayer() {
  return (
    <div className="absolute bottom-20 left-0 right-0 pointer-events-none overflow-hidden">
      <div className="animate-fog h-16 opacity-10"
        style={{ background: "linear-gradient(to right,transparent,#7090c0 30%,#7090c0 70%,transparent)" }} />
    </div>
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
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to generate story");
      }
      const story = await res.json();
      sessionStorage.setItem("story", JSON.stringify(story));
      router.push("/story");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Oops! Something went wrong.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const suggestions = [
    "A brave little owl who is afraid of the dark",
    "A star that fell from the sky",
    "A dragon who collects moonbeams",
    "A tiny wizard lost in the forest",
  ];

  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg,#05091a 0%,#0a1535 30%,#0d1e4a 60%,#0f2255 100%)" }}
    >
      {/* ── Sky elements ── */}
      <Stars />
      <Moon />

      {/* Subtle fog/mist */}
      <FogLayer />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pb-40 pt-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-float-slow">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-2xl p-3 shadow-lg"
              style={{ background: "rgba(245,224,96,0.12)", border: "1px solid rgba(245,224,96,0.3)" }}>
              <BookOpen size={36} className="drop-shadow" style={{ color: "#f5e060" }} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg"
              style={{ color: "#f0e8d0" }}>
              Story<span style={{ color: "#f5e060" }}>Land</span>
            </h1>
          </div>
          <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "rgba(200,180,120,0.7)" }}>
            ✦ Where dreams become adventures ✦
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-xl">
          <div className="night-card rounded-3xl p-8">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg,#f5e060,#c9900a)" }}>
                <Feather size={22} className="text-black" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: "#f0e8d0" }}>Create Your Story</h2>
                <p className="text-sm font-semibold" style={{ color: "rgba(200,180,120,0.65)" }}>
                  Tell us your idea, we&apos;ll write the magic!
                </p>
              </div>
            </div>

            {/* Textarea */}
            <div className="relative mb-4">
              <textarea
                className="w-full h-32 rounded-2xl px-5 py-4 text-base font-semibold resize-none focus:outline-none transition-all placeholder:font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(245,224,96,0.2)",
                  color: "#f0e8d0",
                  caretColor: "#f5e060",
                }}
                placeholder="e.g. A tiny owl who is afraid of the dark but discovers the magic of stars…"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={300}
                disabled={isLoading}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,224,96,0.55)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(245,224,96,0.2)")}
              />
              <div className="absolute bottom-3 right-4 text-xs font-semibold" style={{ color: "rgba(245,224,96,0.4)" }}>
                {idea.length}/300
              </div>
            </div>

            {/* Quick suggestions */}
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: "rgba(245,224,96,0.5)" }}>
                ✦ Try one of these
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setIdea(s)}
                    disabled={isLoading}
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(245,224,96,0.08)",
                      border: "1px solid rgba(245,224,96,0.2)",
                      color: "rgba(245,224,96,0.75)",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(245,224,96,0.18)";
                      (e.target as HTMLElement).style.borderColor = "rgba(245,224,96,0.5)";
                      (e.target as HTMLElement).style.color = "#f5e060";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(245,224,96,0.08)";
                      (e.target as HTMLElement).style.borderColor = "rgba(245,224,96,0.2)";
                      (e.target as HTMLElement).style.color = "rgba(245,224,96,0.75)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "rgba(220,60,60,0.15)", border: "1px solid rgba(220,60,60,0.4)", color: "#f08080" }}>
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!idea.trim() || isLoading}
              className="w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed btn-shimmer shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: "#1a0e00" }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Creating story &amp; illustrations…</span>
                </>
              ) : (
                <>
                  <Sparkles size={22} strokeWidth={2.5} />
                  <span>Generate My Story!</span>
                </>
              )}
            </button>

            <p className="text-center text-xs font-semibold mt-3" style={{ color: "rgba(245,224,96,0.35)" }}>
              Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(245,224,96,0.1)", color: "rgba(245,224,96,0.6)" }}>⌘ Enter</kbd> to generate
            </p>
          </div>
        </div>
      </div>

      {/* ── Tree + Owl ── */}
      <TreeWithOwl />

      {/* ── Dark foliage ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <Foliage />
      </div>
    </main>
  );
}
