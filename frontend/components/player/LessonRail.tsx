import Link from "next/link";

import { ProgressBar } from "@/components/ui";
import { cx } from "@/lib/cx";
import { duration } from "@/lib/format";
import type { CourseDetail, LessonSummary } from "@/lib/types";

/**
 * The lesson list beside the stage. `min-h-0` plus `overflow-y-auto` is what
 * stops a long course pushing the video off screen.
 */
export function LessonRail({
  course,
  lessons,
  currentId,
  courseSlug,
  courseTitle,
}: {
  course: CourseDetail | null;
  lessons: LessonSummary[];
  currentId: number;
  courseSlug: string;
  courseTitle: string;
}) {
  return (
    <aside className="flex max-h-[70vh] min-h-0 flex-col overflow-hidden rounded-card border border-hairline bg-glass lg:max-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <Link
          href={`/courses/${courseSlug}`}
          className="min-h-[44px] text-sm font-medium text-on-velvet transition duration-[--dur] ease-ease hover:text-gold"
        >
          &#8249; Back
        </Link>
        <Link href="/dashboard" className="text-[13px] text-on-velvet-faint hover:text-gold">
          My profile
        </Link>
      </div>

      <div className="border-b border-hairline px-5 py-5">
        <p className="mb-2.5 text-[11px] uppercase tracking-label text-gold">Current course</p>
        <p className="mb-4 font-display text-[22px] leading-tight text-on-velvet">{courseTitle}</p>
        {course && (
          <>
            <div className="mb-2 flex justify-between text-[13px]">
              <span className="text-on-velvet-2">Progress</span>
              <span className="font-semibold text-gold">{course.progress_percent}%</span>
            </div>
            <ProgressBar percent={course.progress_percent} label="Course progress" />
          </>
        )}
      </div>

      <ol className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3.5">
        {lessons.map((item, index) => {
          const isCurrent = item.id === currentId;
          const dot = item.is_completed
            ? "bg-jade text-moss-900 border-transparent"
            : isCurrent
              ? "bg-gold text-moss-900 border-transparent"
              : "border-hairline-strong text-on-velvet-faint";

          const row = (
            <>
              <span
                className={cx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold",
                  dot,
                )}
              >
                {item.is_completed ? "✓" : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cx("block text-sm leading-snug", isCurrent ? "text-on-velvet" : "text-on-velvet-2")}>
                  {item.title}
                </span>
                <span className={cx("mt-0.5 block text-[11px]", isCurrent ? "text-gold" : "text-on-velvet-faint")}>
                  {isCurrent
                    ? "Now playing"
                    : item.is_completed
                      ? `Completed · ${duration(item.duration_seconds)}`
                      : item.is_locked
                        ? "Members"
                        : duration(item.duration_seconds)}
                </span>
              </span>
            </>
          );

          const shell = cx(
            "flex min-h-[44px] items-center gap-3.5 rounded-[14px] border p-3.5",
            isCurrent ? "border-gold bg-gold/20" : "border-transparent",
          );

          return (
            <li key={item.id}>
              {item.is_locked ? (
                <div className={cx(shell, "opacity-50")}>{row}</div>
              ) : (
                <Link
                  href={`/courses/${courseSlug}/lessons/${item.id}`}
                  className={cx(shell, "transition duration-[--dur] ease-ease hover:bg-glass-hover")}
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
