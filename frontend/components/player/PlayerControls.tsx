"use client";

import { cx } from "@/lib/cx";

import { SPEEDS, type usePlayer } from "./usePlayer";

const CHIP = "min-h-[44px] rounded-pill border px-4 text-[11px] uppercase tracking-wide transition duration-[--dur] ease-ease disabled:opacity-40";
const ON = "border-gold bg-gold/20 text-gold";
const OFF = "border-hairline-strong text-on-velvet-2 hover:border-gold";

export function PlayerControls({
  player,
  enabled,
  mirrorOpen,
  onToggleMirror,
}: {
  player: ReturnType<typeof usePlayer>;
  enabled: boolean;
  mirrorOpen: boolean;
  onToggleMirror: () => void;
}) {
  const { speed, setSpeed, mirrored, setMirrored, captionsOn, toggleCaptions, loop, toggleLoop } =
    player;

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => player.setDone(!player.completed)}
        className={cx(
          "min-h-[52px] rounded-card border px-5 text-sm font-semibold transition duration-[--dur] ease-ease",
          player.completed
            ? "border-jade bg-jade/20 text-jade-on"
            : "border-hairline-strong bg-glass text-on-velvet hover:border-jade",
        )}
      >
        {player.completed ? "✓ Completed" : "Mark complete"}
      </button>

      <div>
        <div className="mb-3 flex justify-between text-[11px] uppercase tracking-wide text-on-velvet-2">
          <span>Speed</span>
          <span className="text-gold">{speed}%</span>
        </div>
        <div className="flex gap-1.5 rounded-input border border-hairline-strong bg-glass p-1.5">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              disabled={!enabled}
              aria-pressed={speed === value}
              className={cx(
                "min-h-[44px] flex-1 rounded-[9px] text-[13px] font-semibold transition duration-[--dur] ease-ease disabled:opacity-40",
                speed === value ? "bg-gold text-moss" : "text-on-velvet-2 hover:bg-glass-hover",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 text-[11px] uppercase tracking-wide text-on-velvet-2">
          Frame&#8209;by&#8209;frame
        </div>
        <div className="flex overflow-hidden rounded-input border border-hairline-strong bg-glass">
          <button
            type="button"
            onClick={() => player.nudge(-player.frameStep)}
            disabled={!enabled}
            aria-label="Step back one frame"
            className="min-h-[44px] flex-1 border-r border-hairline-strong text-base text-on-velvet transition duration-[--dur] ease-ease hover:bg-glass-hover disabled:opacity-40"
          >
            &#9198;
          </button>
          <button
            type="button"
            onClick={() => player.nudge(player.frameStep)}
            disabled={!enabled}
            aria-label="Step forward one frame"
            className="min-h-[44px] flex-1 text-base text-on-velvet transition duration-[--dur] ease-ease hover:bg-glass-hover disabled:opacity-40"
          >
            &#9197;
          </button>
        </div>
        <div className="mt-2 flex gap-4 text-[11px] text-on-velvet-faint">
          <span>, back</span>
          <span>. forward</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMirrored(!mirrored)}
          aria-pressed={mirrored}
          className={cx(CHIP, mirrored ? ON : OFF)}
        >
          {mirrored ? "Back view" : "Mirrored"}
        </button>
        <button
          type="button"
          onClick={toggleLoop}
          disabled={!enabled}
          aria-pressed={!!loop}
          className={cx(CHIP, loop ? ON : OFF)}
        >
          &#8635; A/B loop
        </button>
        <button
          type="button"
          onClick={toggleCaptions}
          disabled={!enabled}
          aria-pressed={captionsOn}
          className={cx(CHIP, captionsOn ? ON : OFF)}
        >
          CC {captionsOn ? "EN" : "off"}
        </button>
        <button
          type="button"
          onClick={onToggleMirror}
          aria-pressed={mirrorOpen}
          className={cx(CHIP, mirrorOpen ? ON : OFF)}
        >
          &#9634; Dance in the mirror
        </button>
      </div>
    </div>
  );
}
