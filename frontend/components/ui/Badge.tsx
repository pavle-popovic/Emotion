import { cx } from "@/lib/cx";

export type BadgeTone = "live" | "draft" | "trial" | "paid" | "failed" | "completed" | "neutral";

const TONES: Record<BadgeTone, string> = {
  live: "border-jade/60 bg-jade/15 text-jade-on",
  completed: "border-jade/60 bg-jade/15 text-jade-on",
  paid: "border-jade/60 bg-jade/15 text-jade-on",
  trial: "border-gold/60 bg-gold/20 text-gold",
  draft: "border-hairline-strong bg-glass text-on-velvet-faint",
  neutral: "border-hairline-strong bg-glass text-on-velvet-2",
  // The one warning colour in the system, used only for dunning states.
  failed: "border-warn/70 bg-warn/20 text-warn-on",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-pill border px-3 py-1",
        "text-[11px] uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Style tag on cream panels, where the velvet tones would disappear. */
export function StyleTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-pill bg-moss px-3.5 py-1.5",
        "text-[11px] uppercase tracking-wide text-cream-surface",
        className,
      )}
    >
      {children}
    </span>
  );
}
