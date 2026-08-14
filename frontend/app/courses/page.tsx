import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Badge, Card, EmptyState, ProgressBar, SectionHeading } from "@/components/ui";
import { cx } from "@/lib/cx";
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

  const chip = (active: boolean) =>
    cx(
      "inline-flex min-h-[44px] items-center rounded-pill border px-5 text-sm transition duration-[--dur] ease-ease",
      active ? "border-gold text-gold" : "border-hairline-strong text-on-velvet-2 hover:border-gold",
    );

  return (
    <PageShell user={user}>
      <div className="py-14">
        <SectionHeading
          title="Courses"
          lede="Four styles, plus the musicality work that makes all of them land."
        />
      </div>

      <nav aria-label="Filter by style" className="mb-10 flex flex-wrap gap-3">
        <Link href="/courses" className={chip(!style)}>
          All
        </Link>
        {STYLE_ORDER.map((option) => (
          <Link key={option} href={`/courses?style=${option}`} className={chip(style === option)}>
            {STYLE_LABELS[option]}
          </Link>
        ))}
      </nav>

      {courses.length === 0 ? (
        <EmptyState
          title="Nothing published in this style yet."
          body="New courses land every week. Try another style in the meantime."
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <li key={course.id}>
              <Card interactive className="h-full">
                <Link href={`/courses/${course.slug}`} className="flex h-full flex-col p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase tracking-wide text-gold">
                      {course.style_label}
                    </span>
                    {course.is_locked && <Badge tone="draft">Members</Badge>}
                  </div>

                  <h2 className="font-display text-xl text-on-velvet">{course.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-on-velvet-2">
                    {course.summary}
                  </p>

                  <div className="mt-5 text-[13px] text-on-velvet-faint">
                    {course.lesson_count} lessons
                    {course.completed_lessons > 0 && ` · ${course.completed_lessons} done`}
                  </div>
                  {course.progress_percent > 0 && (
                    <ProgressBar
                      percent={course.progress_percent}
                      size="sm"
                      className="mt-3"
                      label={`${course.title} progress`}
                    />
                  )}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
