"use client";

import { useState } from "react";

import { MirrorCam } from "./MirrorCam";
import { PlayerControls } from "./PlayerControls";
import { PlayerStage } from "./PlayerStage";
import { usePlayer } from "./usePlayer";

/**
 * Owns player state and lays out stage + controls.
 *
 * Above `xl` the controls sit in their own rail. Below that they become a
 * scrollable sheet under the video rather than squeezing the stage — the lesson
 * rail already takes a column at that width.
 */
export function PlayerShell({
  lessonId,
  title,
  playbackId,
  isCompleted,
  durationHint,
  startAt,
}: {
  lessonId: number;
  title: string;
  playbackId: string | null;
  isCompleted: boolean;
  durationHint: number;
  startAt: number;
}) {
  const player = usePlayer({ lessonId, isCompleted, durationHint, startAt });
  const [mirrorOpen, setMirrorOpen] = useState(false);

  return (
    <div className="grid min-h-0 gap-5 xl:grid-cols-[1fr_300px]">
      <div className="flex min-h-0 flex-col gap-4">
        <div className="aspect-video min-h-0">
          <PlayerStage player={player} title={title} playbackId={playbackId} />
        </div>
        {mirrorOpen && <MirrorCam onClose={() => setMirrorOpen(false)} />}
      </div>

      <aside className="min-h-0 overflow-y-auto xl:max-h-[calc(100vh-160px)]">
        <PlayerControls
          player={player}
          enabled={Boolean(playbackId)}
          mirrorOpen={mirrorOpen}
          onToggleMirror={() => setMirrorOpen((v) => !v)}
        />
      </aside>
    </div>
  );
}
