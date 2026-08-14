"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { setLessonProgress } from "@/lib/actions";
import { clock } from "@/lib/format";

// ~250kB of player. Kept out of the shared bundle so the shell and the practice
// controls paint before the video code arrives.
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-cream/[0.06]" />,
});

/** Percentages, matching the design, rather than 0.75x-style multipliers. */
const SPEEDS = [70, 80, 90, 100, 110] as const;

/** Most dance footage is 25-30fps; 1/30s is a close enough nudge for study. */
const FRAME_STEP = 1 / 30;

type MediaEl = HTMLVideoElement & { textTracks?: TextTrackList };

type Props = {
  lessonId: number;
  title: string;
  playbackId: string | null;
  isCompleted: boolean;
  durationHint: number;
};

export function LessonPlayer({
  lessonId,
  title,
  playbackId,
  isCompleted,
  durationHint,
}: Props) {
  const ref = useRef<MediaEl | null>(null);
  const [speed, setSpeed] = useState(100);
  const [mirrored, setMirrored] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [completed, setCompleted] = useState(isCompleted);
  const [, startTransition] = useTransition();

  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [loop, setLoop] = useState<{ a: number; b: number } | null>(null);

  useEffect(() => setCompleted(isCompleted), [isCompleted]);

  // playbackRate is a media-element property, not a React prop.
  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed / 100;
  }, [speed, playbackId]);

  const markComplete = useCallback(() => {
    setCompleted((already) => {
      if (already) return already;
      startTransition(() => void setLessonProgress(lessonId, true));
      return true;
    });
  }, [lessonId]);

  const nudge = useCallback((seconds: number) => {
    const el = ref.current;
    if (!el) return;
    el.pause();
    el.currentTime = Math.max(0, el.currentTime + seconds);
  }, []);

  // , and . step a frame, as labelled in the design.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === ",") {
        event.preventDefault();
        nudge(-FRAME_STEP);
      } else if (event.key === ".") {
        event.preventDefault();
        nudge(FRAME_STEP);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudge]);

  function onTimeUpdate() {
    const el = ref.current;
    if (!el) return;
    setCurrent(el.currentTime);
    if (loop && el.currentTime >= loop.b) el.currentTime = loop.a;
  }

  function toggleCaptions() {
    const el = ref.current;
    const next = !captionsOn;
    setCaptionsOn(next);
    const tracks = el?.textTracks;
    if (!tracks) return;
    for (let i = 0; i < tracks.length; i += 1) {
      if (tracks[i].kind === "subtitles" || tracks[i].kind === "captions") {
        tracks[i].mode = next ? "showing" : "disabled";
      }
    }
  }

  function toggleLoop() {
    const el = ref.current;
    if (loop) {
      setLoop(null);
      return;
    }
    // Loop the 10 seconds around where they are now: the passage they are
    // stuck on is the one they just watched.
    const at = el?.currentTime ?? 0;
    const total = el?.duration || duration || at + 10;
    const a = Math.max(0, at - 2);
    setLoop({ a, b: Math.min(total, a + 10) });
  }

  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;
  const loopLeft = duration && loop ? (loop.a / duration) * 100 : 0;
  const loopWidth = duration && loop ? ((loop.b - loop.a) / duration) * 100 : 0;

  const chip =
    "rounded-pill border px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] transition disabled:opacity-40";
  const chipOff = "border-cream/25 text-cream/80 hover:border-cream/60";
  const chipOn = "border-gold bg-gold/20 text-gold";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {/* Stage */}
      <div className="relative overflow-hidden rounded-2xl bg-[#061F19]">
        <div className="aspect-video">
          {playbackId ? (
            <MuxPlayer
              ref={ref as never}
              playbackId={playbackId}
              metadata={{ video_title: title }}
              streamType="on-demand"
              accentColor="#B08D57"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={() => setDuration(ref.current?.duration ?? durationHint)}
              onEnded={markComplete}
              style={{
                height: "100%",
                width: "100%",
                transform: mirrored ? "scaleX(-1)" : undefined,
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 border border-cream/10 px-6 text-center">
              <span className="font-display text-lg text-cream/70">No video yet</span>
              <span className="text-xs text-cream/40">
                Upload one from the admin dashboard and it appears here.
              </span>
            </div>
          )}
        </div>

        {/* View badge, as in the design */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-between p-4">
          <span className="rounded-pill border border-cream/30 bg-[#061F19]/60 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-cream">
            {mirrored ? "Mirrored view" : "Back view"}
          </span>
        </div>

        {/* Scrubber with the A/B region */}
        {playbackId && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#061F19]/90 to-transparent px-5 pb-4 pt-10">
            <div className="flex items-center gap-4">
              <span className="text-xs tabular-nums text-cream/80">{clock(current)}</span>
              <div className="relative h-[5px] flex-1 rounded-pill bg-cream/25">
                <div
                  className="h-full rounded-pill bg-gold"
                  style={{ width: `${pct}%` }}
                />
                {loop && (
                  <div
                    className="absolute -top-1 h-[13px] rounded border border-cream-cta bg-cream-cta/20"
                    style={{ left: `${loopLeft}%`, width: `${loopWidth}%` }}
                  />
                )}
              </div>
              <span className="text-xs tabular-nums text-cream/55">{clock(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control rail */}
      <aside className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            const next = !completed;
            setCompleted(next);
            startTransition(() => void setLessonProgress(lessonId, next));
          }}
          className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
            completed
              ? "border-jade bg-jade/20 text-[#9FE3C6]"
              : "border-cream/20 bg-cream/[0.07] text-cream hover:border-jade"
          }`}
        >
          {completed ? "✓ Completed" : "Mark complete"}
        </button>

        <div>
          <div className="mb-2.5 flex justify-between text-[11px] uppercase tracking-[0.16em] text-cream/65">
            <span>Speed</span>
            <span className="text-gold">{speed}%</span>
          </div>
          <div className="flex gap-1.5 rounded-xl border border-cream/[0.15] bg-cream/[0.07] p-1.5">
            {SPEEDS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                disabled={!playbackId}
                aria-pressed={speed === value}
                className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition disabled:opacity-40 ${
                  speed === value ? "bg-gold text-moss" : "text-cream/80 hover:bg-cream/10"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[11px] uppercase tracking-[0.16em] text-cream/65">
            Frame&#8209;by&#8209;frame
          </div>
          <div className="flex overflow-hidden rounded-xl border border-cream/[0.15] bg-cream/[0.07]">
            <button
              type="button"
              onClick={() => nudge(-FRAME_STEP)}
              disabled={!playbackId}
              aria-label="Step back one frame"
              className="flex-1 border-r border-cream/[0.15] py-3 text-base transition hover:bg-cream/10 disabled:opacity-40"
            >
              &#9198;
            </button>
            <button
              type="button"
              onClick={() => nudge(FRAME_STEP)}
              disabled={!playbackId}
              aria-label="Step forward one frame"
              className="flex-1 py-3 text-base transition hover:bg-cream/10 disabled:opacity-40"
            >
              &#9197;
            </button>
          </div>
          <div className="mt-2 flex gap-4 px-0.5 text-[11px] text-cream/50">
            <span>, back</span>
            <span>. forward</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLoop}
          disabled={!playbackId}
          aria-pressed={!!loop}
          className={`rounded-2xl border px-4 py-3.5 text-[13px] uppercase tracking-[0.1em] transition disabled:opacity-40 ${
            loop ? "border-gold bg-gold/25 text-gold" : "border-cream/20 bg-cream/[0.07] text-cream/85"
          }`}
        >
          &#8635; {loop ? "A/B loop on" : "Enable A/B loop"}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMirrored((v) => !v)}
            aria-pressed={mirrored}
            className={`${chip} ${mirrored ? chipOn : chipOff}`}
          >
            {mirrored ? "Back view" : "Mirrored"}
          </button>
          <button
            type="button"
            onClick={toggleCaptions}
            disabled={!playbackId}
            aria-pressed={captionsOn}
            className={`${chip} ${captionsOn ? chipOn : chipOff}`}
          >
            CC {captionsOn ? "EN" : "off"}
          </button>
        </div>
      </aside>
    </div>
  );
}
