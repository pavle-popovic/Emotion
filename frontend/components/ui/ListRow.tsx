import Link from "next/link";

import { cx } from "@/lib/cx";

/**
 * The numbered course row. One component for the landing panel, the course
 * index and the profile list.
 *
 * Below `sm` it becomes two lines instead of squeezing five columns: number and
 * title on the first, meta on the second.
 */
export function ListRow({
  href,
  index,
  title,
  subtitle,
  tag,
  meta,
  trailing,
  tone = "cream",
  className,
}: {
  href: string;
  index?: number;
  title: string;
  subtitle?: string;
  tag?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  tone?: "cream" | "velvet";
  className?: string;
}) {
  const cream = tone === "cream";

  return (
    <Link
      href={href}
      className={cx(
        "group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 px-2 py-6",
        "border-t transition duration-[--dur] ease-ease",
        cream
          ? "border-ink-hairline hover:bg-gold/[0.06]"
          : "border-hairline-strong hover:bg-gold/[0.06]",
        "sm:grid-cols-[56px_1fr_auto_auto_24px]",
        className,
      )}
    >
      {index !== undefined ? (
        <span className={cx("font-display text-[15px] text-gold")}>
          {String(index).padStart(2, "0")}
        </span>
      ) : (
        <span className="hidden sm:block" />
      )}

      <span className="min-w-0">
        <span
          className={cx(
            "block font-display text-[19px] leading-snug sm:text-[21px]",
            cream ? "text-moss" : "text-on-velvet",
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={cx(
              "mt-1 block text-sm",
              cream ? "text-ink-faint" : "text-on-velvet-faint",
            )}
          >
            {subtitle}
          </span>
        )}
      </span>

      {/* Meta wraps under the title on phones, sits in its own columns above sm. */}
      <span className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:contents">
        {tag && <span className="sm:justify-self-start">{tag}</span>}
        {meta && (
          <span className={cx("text-sm", cream ? "text-ink-muted" : "text-on-velvet-2")}>
            {meta}
          </span>
        )}
        {trailing ?? (
          <span
            aria-hidden
            className="hidden text-xl text-gold transition duration-[--dur] ease-ease group-hover:translate-x-1 sm:block sm:justify-self-end"
          >
            &rarr;
          </span>
        )}
      </span>
    </Link>
  );
}
