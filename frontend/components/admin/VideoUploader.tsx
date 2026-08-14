"use client";

import { useRef, useState } from "react";

import { removeVideo, startVideoUpload, syncVideo } from "@/lib/admin-actions";
import { PENDING_STATUSES, type AdminLesson } from "@/lib/admin-types";

const POLL_MS = 3000;
const MAX_POLLS = 200; // ~10 minutes; long enough for a big file to encode.

type Phase = "idle" | "uploading" | "encoding" | "ready" | "error";

export function VideoUploader({
  lesson,
  courseId,
}: {
  lesson: AdminLesson;
  courseId: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<Phase>(lesson.mux_playback_id ? "ready" : "idle");
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState(lesson.mux_status);
  const [playbackId, setPlaybackId] = useState(lesson.mux_playback_id);
  const [error, setError] = useState<string | null>(null);

  /** PUT straight to Mux's signed URL. XHR because fetch has no upload progress. */
  function put(url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setPercent(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
      xhr.send(file);
    });
  }

  async function pollUntilReady() {
    for (let i = 0; i < MAX_POLLS; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const updated = await syncVideo(lesson.id);
      setStatus(updated.mux_status);

      if (updated.mux_status === "ready") {
        setPlaybackId(updated.mux_playback_id);
        setPhase("ready");
        return;
      }
      if (!PENDING_STATUSES.has(updated.mux_status)) {
        setPhase("error");
        setError(`Mux reported status "${updated.mux_status}".`);
        return;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    setPhase("error");
    setError("Still encoding after 10 minutes. Check the Mux dashboard.");
  }

  async function onPick(file: File) {
    setError(null);
    setPercent(0);
    setPhase("uploading");
    try {
      const upload = await startVideoUpload(lesson.id);
      await put(upload.upload_url, file);
      setPhase("encoding");
      await pollUntilReady();
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function onRemove() {
    if (!window.confirm("Delete this video from Mux? This cannot be undone.")) return;
    await removeVideo(lesson.id, courseId);
    setPlaybackId(null);
    setStatus("none");
    setPhase("idle");
  }

  if (phase === "ready" && playbackId) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-pill border border-jade bg-jade/20 px-3 py-1 text-jade-on">
          ✓ Video ready
        </span>
        <code className="text-on-velvet-faint">{playbackId}</code>
        <button
          type="button"
          onClick={onRemove}
          className="min-h-[44px] text-on-velvet-faint underline-offset-2 transition duration-[--dur] ease-ease hover:text-warn-on hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  if (phase === "uploading" || phase === "encoding") {
    return (
      <div className="text-xs text-cream/70">
        <div className="mb-1.5">
          {phase === "uploading" ? `Uploading… ${percent}%` : `Encoding… (${status})`}
        </div>
        <div className="h-1 overflow-hidden rounded-pill bg-cream/15">
          <div
            className="h-full bg-gold transition-[width]"
            style={{ width: phase === "uploading" ? `${percent}%` : "100%" }}
          />
        </div>
        {phase === "encoding" && (
          <p className="mt-1.5 text-cream/40">
            Safe to leave this page. Reopen it and press Sync to pick the status back up.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onPick(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-pill border border-cream/25 px-3.5 py-1.5 transition hover:border-gold hover:text-gold"
      >
        Upload video
      </button>

      {lesson.mux_upload_id && (
        <button
          type="button"
          onClick={() => {
            setPhase("encoding");
            void pollUntilReady();
          }}
          className="text-cream/50 underline-offset-2 transition hover:text-gold hover:underline"
        >
          Sync in-flight upload
        </button>
      )}

      {error && <span className="text-red-300">{error}</span>}
    </div>
  );
}
