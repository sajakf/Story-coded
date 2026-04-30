"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Home, Star, ImageOff } from "lucide-react";

interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  imageUrl?: string | null;
}

interface Story {
  title: string;
  pages: StoryPage[];
}

const pageAccents = [
  { dot: "bg-sky-500",    btn: "bg-sky-500 hover:bg-sky-600",    ring: "ring-sky-300"   },
  { dot: "bg-green-600",  btn: "bg-green-600 hover:bg-green-700", ring: "ring-green-300" },
  { dot: "bg-amber-500",  btn: "bg-amber-500 hover:bg-amber-600", ring: "ring-amber-300" },
  { dot: "bg-rose-500",   btn: "bg-rose-500 hover:bg-rose-600",   ring: "ring-rose-300"  },
];

export default function StoryPage() {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("story");
    if (!raw) { router.push("/"); return; }
    try { setStory(JSON.parse(raw)); } catch { router.push("/"); }
  }, [router]);

  useEffect(() => { setImgLoaded(false); }, [currentPage]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(180deg,#b8e4f9 0%,#5ab0d8 100%)" }}>
        <div className="text-white text-2xl font-black animate-pulse">Loading your story…</div>
      </div>
    );
  }

  const page = story.pages[currentPage];
  const totalPages = story.pages.length;
  const accent = pageAccents[currentPage % 4];
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
      <div className="flex items-center justify-between px-4 pt-5 pb-2 md:px-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-white/80 hover:bg-white text-green-800 font-bold px-4 py-2 rounded-2xl shadow transition-all hover:scale-105 text-sm"
        >
          <Home size={15} /> New Story
        </button>
        <h1 className="font-black text-white text-base md:text-lg drop-shadow truncate max-w-[200px] md:max-w-sm text-center">
          {story.title}
        </h1>
        <div className="w-24 md:w-28" />
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-4 md:py-6">
        <div className="w-full max-w-2xl">

          <div
            key={animKey}
            className={`parchment page-border rounded-3xl shadow-2xl overflow-hidden ${direction === "forward" ? "animate-page-in" : "animate-page-back"}`}
          >
            {/* ── Large illustration ── */}
            <div className="relative w-full bg-gradient-to-b from-sky-100 to-blue-50"
              style={{ minHeight: "320px", height: "clamp(280px, 45vw, 480px)" }}>

              {page.imageUrl ? (
                <>
                  {/* Skeleton while loading */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-green-50 animate-pulse">
                      <div className="text-4xl opacity-40">🎨</div>
                    </div>
                  )}
                  <Image
                    src={page.imageUrl}
                    alt={page.title}
                    fill
                    className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImgLoaded(true)}
                    sizes="(max-width: 672px) 100vw, 672px"
                    priority
                  />
                </>
              ) : (
                /* No image fallback */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-100 via-blue-50 to-green-50">
                  <ImageOff size={40} className="text-blue-300" />
                  <span className="text-blue-400 text-sm font-semibold">Illustration unavailable</span>
                </div>
              )}

              {/* Page badge overlay */}
              <div className="absolute top-3 left-3">
                <span className="bg-white/85 backdrop-blur text-green-800 text-xs font-black px-3 py-1.5 rounded-full shadow">
                  Page {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>

            {/* ── Story text ── */}
            <div className="px-6 pt-5 pb-4 md:px-10 md:pt-6">
              <h2 className="text-xl md:text-2xl font-black text-green-900 mb-4 text-center">
                {page.title}
              </h2>
              <p className="text-green-900 text-base md:text-lg font-semibold leading-relaxed md:leading-8 text-center italic">
                &ldquo;{page.content}&rdquo;
              </p>
            </div>

            {/* Page dots */}
            <div className="flex justify-center gap-2 pb-5">
              {story.pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > currentPage ? "forward" : "back")}
                  className={`rounded-full transition-all ${i === currentPage
                    ? `w-6 h-3 ${accent.dot}`
                    : "w-3 h-3 bg-amber-200 hover:bg-amber-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-5 px-1">
            <button
              onClick={() => goTo(currentPage - 1, "back")}
              disabled={isFirst}
              className="flex items-center gap-2 bg-white/80 hover:bg-white text-green-800 font-bold px-5 py-3 rounded-2xl shadow transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft size={20} /> Previous
            </button>

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
                className={`flex items-center gap-2 text-white font-bold px-5 py-3 rounded-2xl shadow transition-all hover:scale-105 ${accent.btn}`}
              >
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>

          {isLast && (
            <div className="text-center mt-4 animate-bounce-soft">
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
