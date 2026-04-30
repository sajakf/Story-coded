"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Home, Star, Volume2, VolumeX } from "lucide-react";

interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  imagePrompt?: string;
}

interface Story {
  title: string;
  pages: StoryPage[];
}

function Corner({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M4 4 Q4 36 36 36" stroke="#c9a96e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M4 4 L4 16 M4 4 L16 4" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="4" cy="4" r="2.5" fill="#c9a96e"/>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2 px-8 py-2">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,#c9a96e)" }} />
      <span style={{ color: "#c9a96e", fontSize: 18 }}>✦</span>
      <span style={{ color: "#c9a96e", fontSize: 12 }}>❧</span>
      <span style={{ color: "#c9a96e", fontSize: 18 }}>✦</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,transparent,#c9a96e)" }} />
    </div>
  );
}

function SoundWave({ playing }: { playing: boolean }) {
  const bars = [0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7];
  return (
    <div className="flex items-center gap-0.5" style={{ height: 20 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full"
          style={{
            height: playing ? `${h * 100}%` : "25%",
            background: "#f5e060",
            opacity: playing ? 0.9 : 0.4,
            transition: "height 0.15s ease",
            animation: playing ? `soundwave ${0.6 + i * 0.08}s ease-in-out infinite alternate` : "none",
            animationDelay: playing ? `${i * 0.07}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}

const PAGE_BG = ["#e8f4fd", "#f0fdf4", "#fffbeb", "#fff1f2"];
const PAGE_EMOJI = ["🌟", "🌿", "🎈", "🌈"];

/* ── Per-page image fetcher ── */
function usePageImage(prompt: string | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const cache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!prompt) return;
    if (cache.current[prompt]) {
      setImageUrl(cache.current[prompt]);
      return;
    }

    setImageUrl(null);
    setLoading(true);
    setFailed(false);

    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.imageUrl) {
          cache.current[prompt] = d.imageUrl;
          setImageUrl(d.imageUrl);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [prompt]);

  return { imageUrl, loading, failed };
}

/* ── TTS hook ── */
function usePageAudio(
  text: string | undefined,
  onEnd: () => void,
  enabled: boolean
) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPlaying(false);
    setBlocked(false);
  }, []);

  const tryPlay = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => { setPlaying(true); setBlocked(false); })
      .catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    stop();
    if (!text || !enabled) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("TTS failed");
        return r.arrayBuffer();
      })
      .then((buf) => {
        if (cancelled) return;
        const blob = new Blob([buf], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setPlaying(false);
          setTimeout(() => onEndRef.current(), 800);
        };
        audio.onerror = () => { setPlaying(false); setBlocked(false); };

        audio.play()
          .then(() => { setPlaying(true); setBlocked(false); })
          .catch(() => setBlocked(true));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled]);

  return { playing, loading, blocked, stop, tryPlay };
}

/* ── Main page ── */
export default function StoryPage() {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("story");
    if (!raw) { router.push("/"); return; }
    try { setStory(JSON.parse(raw)); } catch { router.push("/"); }
  }, [router]);

  const page = story?.pages[current];
  const total = story?.pages.length ?? 0;
  const isFirst = current === 0;
  const isLast = current === total - 1;

  const { imageUrl, loading: imgLoading, failed: imgFailed } = usePageImage(page?.imagePrompt);

  const goTo = useCallback((idx: number, dir: "forward" | "back") => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setCurrent(idx);
  }, []);

  const handleAudioEnd = useCallback(() => {
    if (!isLast) {
      goTo(current + 1, "forward");
    }
  }, [isLast, current, goTo]);

  const { playing: audioPlaying, loading: audioLoading, blocked: audioBlocked, stop: stopAudio, tryPlay } = usePageAudio(
    page?.content,
    handleAudioEnd,
    audioEnabled
  );

  const navigate = (idx: number, dir: "forward" | "back") => {
    stopAudio();
    goTo(idx, dir);
  };

  if (!story || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg,#b8e4f9 0%,#5ab0d8 100%)" }}>
        <p className="text-white text-2xl font-black animate-pulse">Opening your book…</p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(180deg,#05091a 0%,#0a1535 35%,#0d1e4a 70%,#0f2255 100%)" }}
    >
      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-4 md:px-8 pt-5 pb-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all text-sm"
          style={{ background: "rgba(245,224,96,0.1)", border: "1px solid rgba(245,224,96,0.25)", color: "#f5e060" }}
        >
          <Home size={15} /> New Story
        </button>
        <p className="font-bold text-sm drop-shadow hidden md:block truncate max-w-xs" style={{ color: "rgba(240,232,208,0.8)" }}>
          {story.title}
        </p>
        {/* Audio toggle */}
        <button
          onClick={() => { stopAudio(); setAudioEnabled((v) => !v); }}
          className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all text-sm"
          style={{ background: "rgba(245,224,96,0.1)", border: "1px solid rgba(245,224,96,0.25)", color: "#f5e060" }}
          title={audioEnabled ? "Mute narration" : "Enable narration"}
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span className="hidden md:inline">{audioEnabled ? "Sound On" : "Sound Off"}</span>
        </button>
      </div>

      {/* Tap-to-play banner (shown when browser blocks autoplay) */}
      {audioEnabled && audioBlocked && (
        <div className="w-full flex justify-center px-4 pb-2">
          <button
            onClick={tryPlay}
            className="flex items-center gap-2 font-bold px-5 py-2 rounded-xl animate-bounce-soft text-sm"
            style={{ background: "rgba(245,224,96,0.15)", border: "1px solid rgba(245,224,96,0.5)", color: "#f5e060" }}
          >
            <Volume2 size={16} /> Tap to hear the story narrated
          </button>
        </div>
      )}

      {/* Book */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-6">
        <div className="w-full max-w-lg">

          {/* Page stack + spine wrapper */}
          <div className="relative">
            <div className="absolute inset-y-2 -right-1.5 w-2.5 rounded-r-md"
              style={{ background: "linear-gradient(to right,#e8d5b0,#f5e6c8)", boxShadow: "2px 1px 4px rgba(0,0,0,0.25)" }} />
            <div className="absolute inset-y-3 -right-3 w-2.5 rounded-r-md"
              style={{ background: "#f0d898", boxShadow: "2px 1px 3px rgba(0,0,0,0.18)" }} />

            {/* Animated page */}
            <div
              key={animKey}
              className={`relative rounded-2xl overflow-hidden ${direction === "forward" ? "animate-page-in" : "animate-page-back"}`}
              style={{
                background: "#FDF6E3",
                boxShadow: "-10px 4px 30px rgba(0,0,0,0.45), 0 20px 60px rgba(0,0,0,0.35), inset 2px 0 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Spine shadow */}
              <div className="absolute left-0 inset-y-0 w-8 pointer-events-none z-10"
                style={{ background: "linear-gradient(to right,rgba(0,0,0,0.22),transparent)" }} />

              {/* ── Illustration ── */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: "clamp(240px,44vw,380px)", background: PAGE_BG[current % 4] }}
              >
                {imgLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-pulse"
                    style={{ background: PAGE_BG[current % 4] }}>
                    <span className="text-5xl opacity-30">🎨</span>
                    <span className="text-sm font-bold opacity-50" style={{ color: "#92400e" }}>
                      Painting your illustration…
                    </span>
                    <div className="flex gap-1.5 mt-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {imageUrl && !imgLoading && (
                  <Image
                    src={imageUrl}
                    alt={`Illustration for ${page.title}`}
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                  />
                )}

                {imgFailed && !imgLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ background: PAGE_BG[current % 4] }}>
                    <span className="text-7xl">{PAGE_EMOJI[current % 4]}</span>
                    <span className="text-xs font-semibold opacity-40" style={{ color: "#92400e" }}>
                      Illustration unavailable
                    </span>
                  </div>
                )}

                {/* Fade edge into parchment */}
                <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom,transparent,#FDF6E3)" }} />
              </div>

              {/* ── Story content ── */}
              <div className="relative px-6 md:px-10 pb-2">
                <div className="absolute top-2 left-4"><Corner /></div>
                <div className="absolute top-2 right-4"><Corner flip /></div>

                <div className="flex items-center justify-center gap-3 pt-6 pb-1">
                  <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: "#a07040" }}>
                    Chapter {current + 1}
                  </span>
                  {/* Audio indicator */}
                  {audioEnabled && (
                    <div className="flex items-center gap-1.5">
                      {audioLoading && (
                        <span className="text-xs font-semibold" style={{ color: "#c9a96e", opacity: 0.6 }}>loading…</span>
                      )}
                      {(audioPlaying || audioLoading) && <SoundWave playing={audioPlaying} />}
                    </div>
                  )}
                </div>

                <Divider />

                <h2 className="text-center font-black text-xl md:text-2xl leading-snug mb-3 px-4"
                  style={{ color: "#4a2c10" }}>
                  {page.title}
                </h2>

                <p className="text-center leading-8 md:leading-9 text-base md:text-lg px-2 pb-4"
                  style={{ color: "#5c3d1e", fontStyle: "italic", fontWeight: 600 }}>
                  &ldquo;{page.content}&rdquo;
                </p>

                <Divider />

                {/* Dots + page number */}
                <div className="flex items-center justify-center gap-3 py-3">
                  <div className="w-8 h-px" style={{ background: "#c9a96e" }} />
                  {story.pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(i, i > current ? "forward" : "back")}
                      className="rounded-full transition-all"
                      style={{
                        width: i === current ? "24px" : "10px",
                        height: "10px",
                        background: i === current ? "#c9a96e" : "#e8d0a0",
                      }}
                    />
                  ))}
                  <div className="w-8 h-px" style={{ background: "#c9a96e" }} />
                </div>

                <p className="text-center text-xs font-bold pb-4" style={{ color: "#b08040", letterSpacing: "0.1em" }}>
                  — {current + 1} —
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5 px-1">
            <button
              onClick={() => navigate(current - 1, "back")}
              disabled={isFirst}
              className="flex items-center gap-2 font-bold px-5 py-3 rounded-2xl transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: "rgba(245,224,96,0.1)", color: "#f5e060", border: "1px solid rgba(245,224,96,0.25)" }}
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {isLast ? (
              <button
                onClick={() => { sessionStorage.removeItem("story"); router.push("/"); }}
                className="flex items-center gap-2 text-white font-black px-5 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 btn-shimmer"
              >
                <Star size={18} /> The End! 🎉
              </button>
            ) : (
              <button
                onClick={() => navigate(current + 1, "forward")}
                className="flex items-center gap-2 font-bold px-5 py-3 rounded-2xl transition-all hover:scale-105 shadow-lg"
                style={{ background: "linear-gradient(135deg,#f5e060,#c9900a)", color: "#1a0e00" }}
              >
                Next Page <ChevronRight size={20} />
              </button>
            )}
          </div>

          {isLast && (
            <p className="text-center text-white font-black text-lg mt-4 drop-shadow animate-bounce-soft">
              🎊 The End! What a wonderful adventure!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
