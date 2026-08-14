"use client";

import dynamic from "next/dynamic";

import { clock } from "@/lib/format";
import { TOKEN_HEX } from "@/lib/tokens";

import type { usePlayer } from "./usePlayer";

// ~250kB of player, kept out of the shared bundle.
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

export function PlayerStage({
  player,
  title,
  playbackId,
}: {
  player: ReturnType<typeof usePlayer>;
  title: string;
  playbackId: string | null;
}) {
  const { current, duration, loop, mirrored } = player;
  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;
  const loopLeft = duration && loop ? (loop.a / duration) * 100 : 0;
  const loopWidth = duration && loop ? ((loop.b - loop.a) / duration) * 100 : 0;

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-card bg-video">
      <div className="h-full">
        {playbackId ? (
          <MuxPlayer
            ref={player.ref as never}
            playbackId={playbackId}
            metadata={{ video_title: title }}
            streamType="on-demand"
            accentColor={TOKEN_HEX.gold}
            onTimeUpdate={player.onTimeUpdate}
            onLoadedMetadata={player.onLoadedMetadata}
            onPause={() => player.ref.current && player.persist(player.ref.current.currentTime)}
            onEnded={() => player.setDone(true)}
            style={{
              height: "100%",
              width: "100%",
              transform: mirrored ? "scaleX(-1)" : undefined,
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 border border-hairline px-6 text-center">
            <p className="font-display text-lg text-on-velvet-2">No video yet</p>
            <p className="text-[13px] text-on-velvet-faint">
              Upload one from the admin dashboard and it appears here.
            </p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4">
        <span className="rounded-pill border border-hairline-strong bg-video/60 px-4 py-2 text-[11px] uppercase tracking-wide text-on-velvet">
          {mirrored ? "Mirrored view" : "Back view"}
        </span>
      </div>

      {playbackId && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-video/90 to-transparent px-5 pb-4 pt-10">
          <div className="flex items-center gap-4">
            <span className="text-[13px] tabular-nums text-on-velvet-2">{clock(current)}</span>
            <div className="relative h-1.5 flex-1 rounded-pill bg-hairline-strong">
              <div className="h-full rounded-pill bg-gold" style={{ width: `${pct}%` }} />
              {loop && (
                <div
                  className="absolute -top-1 h-[13px] rounded border border-cream-blush bg-cream-blush/20"
                  style={{ left: `${loopLeft}%`, width: `${loopWidth}%` }}
                />
              )}
            </div>
            <span className="text-[13px] tabular-nums text-on-velvet-faint">{clock(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
