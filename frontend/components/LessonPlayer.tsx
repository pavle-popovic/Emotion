"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";

import { setLessonProgress } from "@/lib/actions";

// ~250kB of player. Keep it out of the shared bundle so the page shell and the
// practice controls paint before the video code arrives.
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-cream/[0.06]" />,
});

const SPEEDS = [0.5, 0.75, 1] as const;

type Props = {
  lessonId: number;
  title: string;
  playbackId: string | null;
  isCompleted: boolean;
};

/**
 * Practice controls, not just playback. Mirroring and slowing down are how people
 * actually learn choreography, so they are first-class here rather than buried in
 * a settings menu.
 */
export function LessonPlayer({ lessonId, title, playbackId, isCompleted }: Props) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  // playbackRate has to be reapplied to the media element; it is not a prop.
  useEffect(() => {
    if (playerRef.current) playerRef.current.playbackRate = speed;
  }, [speed]);

  function markComplete() {
    if (completed) return;
    setCompleted(true);
    startTransition(() => {
      void setLessonProgress(lessonId, true);
    });
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-moss-900">
        {playbackId ? (
          <MuxPlayer
            ref={playerRef as never}
            playbackId={playbackId}
            metadata={{ video_title: title }}
            streamType="on-demand"
            loop={loop}
            onEnded={markComplete}
            accentColor="#B08D57"
            style={{
              height: "100%",
              width: "100%",
              transform: mirrored ? "scaleX(-1)" : undefined,
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 border border-cream/10 px-6 text-center">
            <span className="font-display text-lg text-cream/70">Video coming soon</span>
            <span className="text-xs text-cream/40">
              This lesson has no Mux asset attached yet.
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMirrored((v) => !v)}
          aria-pressed={mirrored}
          className={`rounded-pill border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition ${
            mirrored
              ? "border-gold text-gold"
              : "border-cream/35 text-cream/75 hover:border-cream/60"
          }`}
        >
          Mirrored
        </button>

        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSpeed(value)}
            aria-pressed={speed === value}
            disabled={!playbackId}
            className={`rounded-pill border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition disabled:opacity-40 ${
              speed === value
                ? "border-gold text-gold"
                : "border-cream/35 text-cream/75 hover:border-cream/60"
            }`}
          >
            {value}&times;
          </button>
        ))}

        <button
          type="button"
          onClick={() => setLoop((v) => !v)}
          aria-pressed={loop}
          disabled={!playbackId}
          className={`rounded-pill border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition disabled:opacity-40 ${
            loop ? "border-gold text-gold" : "border-cream/35 text-cream/75 hover:border-cream/60"
          }`}
        >
          Loop
        </button>

        <button
          type="button"
          onClick={markComplete}
          disabled={completed}
          className={`ml-auto rounded-pill px-4 py-1.5 text-[11px] uppercase tracking-[0.1em] transition ${
            completed
              ? "bg-jade/20 text-jade"
              : "bg-cream-cta text-moss hover:bg-cream"
          }`}
        >
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}
