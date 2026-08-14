import { cx } from "@/lib/cx";

export function ProgressBar({
  percent,
  size = "md",
  className,
  label,
}: {
  percent: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx(
        "overflow-hidden rounded-pill bg-hairline-strong",
        size === "sm" ? "h-1" : "h-1.5",
        className,
      )}
    >
      <div
        className={cx(
          "h-full rounded-pill transition-[width] duration-500 ease-ease",
          value === 100 ? "bg-gold" : "bg-jade",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function StatTile({
  value,
  label,
  tone = "glass",
  className,
}: {
  value: React.ReactNode;
  label: string;
  tone?: "glass" | "cream";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-card px-5 py-6 text-center",
        tone === "glass"
          ? "border border-hairline bg-glass"
          : "border border-ink-hairline bg-cream-surface",
        className,
      )}
    >
      <div className={cx("font-display text-[30px]", tone === "glass" ? "text-gold" : "text-moss")}>
        {value}
      </div>
      <div
        className={cx(
          "mt-1 text-[12px] uppercase tracking-wide",
          tone === "glass" ? "text-on-velvet-2" : "text-ink-faint",
        )}
      >
        {label}
      </div>
    </div>
  );
}

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "border-2 border-gold bg-glass font-display text-gold",
        className,
      )}
    >
      {initial}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-card border border-hairline bg-glass px-6 py-10 text-center",
        className,
      )}
    >
      <p className="font-display text-lg text-on-velvet">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm text-on-velvet-2">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/** Glass skeleton block, per the "no spinners" loading rule. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("skeleton rounded-card", className)} />;
}
