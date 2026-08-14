"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { saveLessonPosition, setLessonProgress } from "@/lib/actions";

export const SPEEDS = [70, 80, 90, 100, 110] as const;

/** Most dance footage is 25-30fps; 1/30s is a close enough nudge for study. */
const FRAME_STEP = 1 / 30;
const SAVE_EVERY_SECONDS = 10;
const RESUME_FLOOR_SECONDS = 5;
const RESUME_TAIL_SECONDS = 15;

export type MediaEl = HTMLVideoElement & { textTracks?: TextTrackList };

export function usePlayer({
  lessonId,
  isCompleted,
  durationHint,
  startAt,
}: {
  lessonId: number;
  isCompleted: boolean;
  durationHint: number;
  startAt: number;
}) {
  const ref = useRef<MediaEl | null>(null);
  const lastSaved = useRef(startAt);

  const [speed, setSpeed] = useState(100);
  const [mirrored, setMirrored] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [completed, setCompleted] = useState(isCompleted);
  const [current, setCurrent] = useState(startAt);
  const [duration, setDuration] = useState(durationHint);
  const [loop, setLoop] = useState<{ a: number; b: number } | null>(null);

  useEffect(() => setCompleted(isCompleted), [isCompleted]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed / 100;
  }, [speed]);

  const persist = useCallback((seconds: number) => {
    lastSaved.current = seconds;
    void saveLessonPosition(lessonId, seconds);
  }, [lessonId]);

  const setDone = useCallback((next: boolean) => {
    setCompleted(next);
    void setLessonProgress(lessonId, next);
  }, [lessonId]);

  const nudge = useCallback((seconds: number) => {
    const el = ref.current;
    if (!el) return;
    el.pause();
    el.currentTime = Math.max(0, el.currentTime + seconds);
  }, []);

  // Save on the way out, so closing the tab mid-lesson still resumes.
  useEffect(() => {
    const flush = () => {
      const el = ref.current;
      if (el && Math.abs(el.currentTime - lastSaved.current) > 1) persist(el.currentTime);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persist]);

  // , and . step a frame, as the design labels them.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (event.key === ",") {
        event.preventDefault();
        nudge(-FRAME_STEP);
      } else if (event.key === ".") {
        event.preventDefault();
        nudge(FRAME_STEP);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudge]);

  const onTimeUpdate = () => {
    const el = ref.current;
    if (!el) return;
    setCurrent(el.currentTime);
    if (loop && el.currentTime >= loop.b) el.currentTime = loop.a;
    if (Math.abs(el.currentTime - lastSaved.current) >= SAVE_EVERY_SECONDS) persist(el.currentTime);
  };

  const onLoadedMetadata = () => {
    const el = ref.current;
    if (!el) return;
    const total = el.duration || durationHint;
    setDuration(total);
    if (startAt > RESUME_FLOOR_SECONDS && (!total || startAt < total - RESUME_TAIL_SECONDS)) {
      el.currentTime = startAt;
    }
  };

  const toggleCaptions = () => {
    const next = !captionsOn;
    setCaptionsOn(next);
    const tracks = ref.current?.textTracks;
    for (let i = 0; i < (tracks?.length ?? 0); i += 1) {
      const track = tracks![i];
      if (track.kind === "subtitles" || track.kind === "captions") {
        track.mode = next ? "showing" : "disabled";
      }
    }
  };

  const toggleLoop = () => {
    if (loop) return setLoop(null);
    // Loop the 10s around where they are: the passage they are stuck on is the
    // one they just watched.
    const at = ref.current?.currentTime ?? 0;
    const total = ref.current?.duration || duration || at + 10;
    const a = Math.max(0, at - 2);
    setLoop({ a, b: Math.min(total, a + 10) });
  };

  return {
    ref,
    speed, setSpeed,
    mirrored, setMirrored,
    captionsOn, toggleCaptions,
    completed, setDone,
    current, duration,
    loop, toggleLoop,
    nudge, onTimeUpdate, onLoadedMetadata, persist,
    frameStep: FRAME_STEP,
  };
}
