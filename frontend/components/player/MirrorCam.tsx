"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Dance in the mirror" — the viewer's own camera beside the lesson.
 *
 * Opt-in and local only: the stream is attached straight to a <video> element
 * and never leaves the device. Denial is a normal outcome, not an error state,
 * so it just closes the panel and says so.
 */
export function MirrorCam({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError("Camera unavailable. Check your browser's permissions."));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-video">
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-on-velvet-2">{error}</p>
          <button type="button" onClick={onClose} className="min-h-[44px] text-sm text-gold">
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Mirrored so it reads like a studio mirror, not a video call. */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 min-h-[44px] rounded-pill border border-hairline-strong bg-video/70 px-4 text-[11px] uppercase tracking-wide text-on-velvet"
          >
            Close mirror
          </button>
        </>
      )}
    </div>
  );
}
