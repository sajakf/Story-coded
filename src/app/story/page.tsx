"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, BookOpen, Star } from "lucide-react";

interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
}

interface Story {
  title: string;
  pages: StoryPage[];
}

/* ── Page decorations ── */

const pageIcons = ["🌟", "🌿", "🎈", "🌈"];
const pageBgColors = [
  "from-sky-50 to-blue-50",
  "from-green-50 to-emerald-50",
  "from-amber-50 to-yellow-50",
  "from-rose-50 to-pink-50",
];
const pageAccentColors = [
  "text-sky-600 border-sky-200 bg-sky-100",
  "text-green-700 border-green-200 bg-green-100",
  "text-amber-700 border-amber-200 bg-amber-100",
  "text-rose-600 border-rose-200 bg-rose-100",
];
const pageButtonColors = [
  "bg-sky-500 hover:bg-sky-600",
  "bg-green-600 hover:bg-green-700",
  "bg-amber-500 hover:bg-amber-600",
  "bg-rose-500 hover:bg-rose-600",
];

function SceneDecoration({ pageIdx }: { pageIdx: number }) {
  const scenes = [
    /* page 1 — sky scene */
    <svg key="p1" width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
      <rect width="180" height="90" rx="12" fill="#e0f2fe"/>
      <ellipse cx="90" cy="90" rx="100" ry="40" fill="#86efac" opacity="0.5"/>
      <ellipse cx="30" cy="35" rx="28" ry="18" fill="white"/>
      <ellipse cx="20" cy="30" rx="18" ry="14" fill="white"/>
      <ellipse cx="42" cy="28" rx="20" ry="15" fill="white"/>
      <ellipse cx="130" cy="25" rx="24" ry="15" fill="white"/>
      <ellipse cx="120" cy="22" rx="16" ry="12" fill="white"/>
      {/* balloon */}
      <ellipse cx="90" cy="30" rx="14" ry="16" fill="#f87171"/>
      <ellipse cx="90" cy="22" rx="14" ry="10" fill="#fbbf24" opacity="0.85"/>
      <rect x="85" y="44" width="10" height="6" rx="2" fill="#92400e"/>
      <Star size={8} x="84" y="24" fill="#fff" stroke="none"/>
    </svg>,

    /* page 2 — forest */
    <svg key="p2" width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
      <rect width="180" height="90" rx="12" fill="#d1fae5"/>
      <rect x="0" y="60" width="180" height="30" rx="0" fill="#6ee7b7" opacity="0.5"/>
      {[20,50,80,110,140,160].map((x,i) => (
        <g key={i}>
          <rect x={x+4} y={45+(i%2)*8} width={5} height={20} fill="#78350f"/>
          <ellipse cx={x+6} cy={40+(i%2)*8} rx={12} ry={14} fill="#16a34a" opacity={0.8}/>
          <ellipse cx={x+6} cy={35+(i%2)*8} rx={9} ry={10} fill="#22c55e"/>
        </g>
      ))}
      <path d="M60 90 Q90 65 120 90" fill="#d4b896" opacity="0.6"/>
    </svg>,

    /* page 3 — sunset bridge */
    <svg key="p3" width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
      <rect width="180" height="90" rx="12" fill="#fef3c7"/>
      <ellipse cx="90" cy="55" rx="120" ry="50" fill="#fb923c" opacity="0.2"/>
      <circle cx="90" cy="45" r="22" fill="#fbbf24" opacity="0.8"/>
      <ellipse cx="90" cy="75" rx="100" ry="25" fill="#2d7ab5" opacity="0.5"/>
      {/* bridge planks */}
      {[15,35,55,75,95,115,135,155].map((x,i) => (
        <rect key={i} x={x} y={66} width={14} height={5} rx="1" fill="#92400e" opacity="0.7"/>
      ))}
      <line x1="10" y1="60" x2="170" y2="60" stroke="#92400e" strokeWidth="2" opacity="0.6"/>
      <line x1="10" y1="72" x2="170" y2="72" stroke="#92400e" strokeWidth="2" opacity="0.6"/>
    </svg>,

    /* page 4 — stars/celebration */
    <svg key="p4" width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
      <rect width="180" height="90" rx="12" fill="#fce7f3"/>
      <ellipse cx="90" cy="90" rx="100" ry="40" fill="#fbcfe8" opacity="0.5"/>
      {[[30,20],[60,12],[90,18],[120,10],[150,22],[45,40],[135,35],[75,48]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="14" textAnchor="middle">⭐</text>
      ))}
      <text x="90" y="68" fontSize="32" textAnchor="middle">🌈</text>
    </svg>,
  ];
  return scenes[pageIdx] ?? null;
}

/* ── Story page component ── */

export default function StoryPage() {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("story");
    if (!raw) { router.push("/"); return; }
    try { setStory(JSON.parse(raw)); } catch { router.push("/"); }
  }, [router]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#b8e4f9 0%,#5ab0d8 100%)" }}>
        <div className="text-white text-2xl font-black animate-pulse">Loading your story…</div>
      </div>
    );
  }

  const page = story.pages[currentPage];
  const totalPages = story.pages.length;
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const goTo = (idx: number, dir: "forward" | "back") => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setCurrentPage(idx);
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg,#b8e4f9 0%,#7ec8e8 35%,#5db340 100%)" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-white/80 hover:bg-white text-green-800 font-bold px-4 py-2 rounded-2xl shadow transition-all hover:scale-105 text-sm"
        >
          <Home size={16} /> New Story
        </button>
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-2xl shadow">
          <BookOpen size={16} className="text-green-700" />
          <span className="font-black text-green-800 text-sm truncate max-w-[180px]">{story.title}</span>
        </div>
        <div className="w-24" /> {/* spacer */}
      </div>

      {/* Story book */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl">

          {/* Book card */}
          <div
            key={animKey}
            className={`parchment page-border rounded-3xl shadow-2xl overflow-hidden ${direction === "forward" ? "animate-page-in" : "animate-page-back"}`}
          >
            {/* Page header */}
            <div className={`bg-gradient-to-r ${pageBgColors[currentPage % 4]} px-8 pt-8 pb-4 border-b border-amber-200/50`}>
              {/* Page badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${pageAccentColors[currentPage % 4]}`}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <span className="text-2xl">{pageIcons[currentPage % 4]}</span>
              </div>

              {/* Page title */}
              <h2 className="text-2xl md:text-3xl font-black text-green-900 leading-tight mb-1">
                {page.title}
              </h2>
            </div>

            {/* Scene illustration */}
            <div className="px-8 pt-6 flex justify-center">
              <SceneDecoration pageIdx={currentPage % 4} />
            </div>

            {/* Story text */}
            <div className="px-8 py-6">
              <p className="text-green-900 text-lg md:text-xl font-semibold leading-relaxed text-center italic">
                &ldquo;{page.content}&rdquo;
              </p>
            </div>

            {/* Page number dots */}
            <div className="flex justify-center gap-2 pb-4">
              {story.pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > currentPage ? "forward" : "back")}
                  className={`rounded-full transition-all ${i === currentPage ? "w-6 h-3 bg-amber-500" : "w-3 h-3 bg-amber-200 hover:bg-amber-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={() => goTo(currentPage - 1, "back")}
              disabled={isFirst}
              className="flex items-center gap-2 bg-white/80 hover:bg-white text-green-800 font-bold px-5 py-3 rounded-2xl shadow transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {/* Middle — page indicator */}
            <div className="text-white/90 font-black text-sm drop-shadow">
              {currentPage + 1} / {totalPages}
            </div>

            {isLast ? (
              <button
                onClick={() => { sessionStorage.removeItem("story"); router.push("/"); }}
                className="flex items-center gap-2 text-white font-black px-5 py-3 rounded-2xl shadow transition-all hover:scale-105 btn-shimmer"
              >
                <Star size={18} /> The End! 🎉
              </button>
            ) : (
              <button
                onClick={() => goTo(currentPage + 1, "forward")}
                className={`flex items-center gap-2 text-white font-bold px-5 py-3 rounded-2xl shadow transition-all hover:scale-105 ${pageButtonColors[(currentPage + 1) % 4]}`}
              >
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* End celebration */}
          {isLast && (
            <div className="text-center mt-6 animate-bounce-soft">
              <p className="text-white font-black text-lg drop-shadow">
                🎊 The End! What a wonderful adventure!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
