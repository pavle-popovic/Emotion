import Link from "next/link";

import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser, listCourses } from "@/lib/api";
import { STYLE_LABELS, STYLE_ORDER, type DanceStyle } from "@/lib/types";

export const dynamic = "force-dynamic";

function isStyle(value: string | undefined): value is DanceStyle {
  return !!value && (STYLE_ORDER as string[]).includes(value);
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { style?: string };
}) {
  const style = isStyle(searchParams.style) ? searchParams.style : undefined;
  const [user, courses] = await Promise.all([getCurrentUser(), listCourses(style)]);

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <h1 className="mb-1.5 font-display text-3xl font-normal">Courses</h1>
        <p className="mb-7 text-sm text-cream/60">
          Four styles, plus the musicality work that makes all of them land.
        </p>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/courses"
            className={`rounded-pill border px-4 py-1.5 text-xs transition ${
              style ? "border-cream/25 text-cream/70 hover:border-cream/50" : "border-gold text-gold"
            }`}
          >
            All
          </Link>
          {STYLE_ORDER.map((option) => (
            <Link
              key={option}
              href={`/courses?style=${option}`}
              className={`rounded-pill border px-4 py-1.5 text-xs transition ${
                style === option
                  ? "border-gold text-gold"
                  : "border-cream/25 text-cream/70 hover:border-cream/50"
              }`}
            >
              {STYLE_LABELS[option]}
            </Link>
          ))}
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-cream/60">Nothing published in this style yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="card-dark group flex h-full flex-col p-5 transition hover:border-gold/60"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-gold">
                      {course.style_label}
                    </span>
                    {course.is_locked && (
                      <span className="rounded-pill border border-cream/25 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-cream/60">
                        Members
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-lg transition group-hover:text-gold">
                    {course.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-cream/60">
                    {course.summary}
                  </p>

                  <div className="mt-4 text-xs text-cream/50">
                    {course.lesson_count} lessons
                    {course.completed_lessons > 0 && ` · ${course.completed_lessons} done`}
                  </div>
                  {course.progress_percent > 0 && (
                    <ProgressBar percent={course.progress_percent} className="mt-2.5" height="h-1" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
