import { cx } from "@/lib/cx";

/**
 * Card — the repeating small surface.
 * `glass` sits on velvet; `cream` is the light variant used inside panels.
 */
export function Card({
  variant = "glass",
  interactive = false,
  className,
  children,
}: {
  variant?: "glass" | "cream";
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-card",
        variant === "glass"
          ? "border border-hairline bg-glass"
          : "bg-cream-surface text-ink shadow-raised",
        interactive && "transition duration-[--dur] ease-ease hover:bg-glass-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Panel — the large cream slab (course list, pricing, auth form side). */
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-panel bg-cream-surface px-6 py-10 text-ink shadow-panel sm:px-10 sm:py-14 lg:px-16 lg:py-18",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EyebrowLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cx("text-[13px] uppercase tracking-eyebrow text-gold", className)}>{children}</p>
  );
}

/** Eyebrow + heading + optional lede, with consistent rhythm between them. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "velvet",
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  tone?: "velvet" | "cream";
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={cx(align === "center" && "text-center", className)}>
      {eyebrow && <EyebrowLabel className="mb-4">{eyebrow}</EyebrowLabel>}
      <h2
        className={cx(
          "font-display text-[clamp(28px,3.4vw,42px)] leading-tight",
          tone === "velvet" ? "text-on-velvet" : "text-moss",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cx(
            "mt-5 max-w-[560px] text-[17px] leading-relaxed",
            align === "center" && "mx-auto",
            tone === "velvet" ? "text-on-velvet-2" : "text-ink-muted",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
