"use client";

import { useFormStatus } from "react-dom";

import { chooseStyle } from "@/lib/actions";
import { cx } from "@/lib/cx";
import { STYLE_HINTS, STYLE_LABELS, STYLE_ORDER, type DanceStyle } from "@/lib/types";

const NUMERALS = ["I", "II", "III", "IV"];

function StyleCard({ style, numeral }: { style: DanceStyle; numeral: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cx(
        "h-full w-full rounded-card border border-hairline-strong bg-glass px-6 py-9 text-center",
        "transition duration-[--dur] ease-ease hover:border-gold hover:bg-glass-hover",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <span className="mb-3.5 block font-display text-[34px] text-gold">{numeral}</span>
      <span className="mb-2 block font-display text-xl text-cream-surface">
        {STYLE_LABELS[style]}
      </span>
      <span className="block text-[13px] leading-relaxed text-on-velvet-2">
        {STYLE_HINTS[style]}
      </span>
    </button>
  );
}

export function StyleStep() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STYLE_ORDER.map((style, index) => (
        <form key={style} action={chooseStyle.bind(null, style)} className="h-full">
          <StyleCard style={style} numeral={NUMERALS[index]} />
        </form>
      ))}
    </div>
  );
}
