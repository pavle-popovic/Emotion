import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/PageShell";
import { Badge, Button, EyebrowLabel, ProgressBar } from "@/components/ui";
import { cx } from "@/lib/cx";
import { getCourse, getCurrentUser } from "@/lib/api";
import { duration } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const [user, course] = await Promise.all([getCurrentUser(), getCourse(params.slug)]);
  if (!course) notFound();

  const started = course.completed_lessons > 0;
  const resumeHref = course.resume_lesson_id
    ? `/courses/${course.slug}/lessons/${course.resume_lesson_id}`
    : null;

  return (
    <PageShell user={user} width="panel">
      <Link
        href="/courses"
        className="inline-flex min-h-[44px] items-center text-[13px] text-on-velvet-faint transition duration-[--dur] ease-ease hover:text-gold"
      >
        &larr; All courses
      </Link>

      <header className="pb-10">
        <EyebrowLabel className="mb-4">
          {course.style_label} &middot; {course.lesson_count} lessons
          {course.total_duration_seconds > 0 && ` · ${duration(course.total_duration_seconds)}`}
        </EyebrowLabel>
        <h1 className="mb-5 font-display text-[clamp(32px,4vw,44px)] leading-tight text-on-velvet">
          {course.title}
        </h1>
        <p className="max-w-[560px] text-[17px] leading-relaxed text-on-velvet-2">
          {course.description}
        </p>

        {course.progress_percent > 0 && (
          <div className="mt-8 max-w-sm">
            <div className="mb-2 flex justify-between text-[13px] text-on-velvet-2">
              <span>
                {course.completed_lessons} of {course.lesson_count} done
              </span>
              <span className="text-gold">{course.progress_percent}%</span>
            </div>
            <ProgressBar percent={course.progress_percent} label={`${course.title} progress`} />
          </div>
        )}

        {resumeHref && (
          <div className="mt-8">
            <Button href={resumeHref} size="lg">
              {started ? "Resume" : "Start course"}
            </Button>
          </div>
        )}

        {course.is_locked && (
          <div className="mt-8 max-w-md rounded-card bg-cream-surface px-7 py-7 text-ink shadow-raised">
            <p className="mb-2 text-[13px] uppercase tracking-label text-gold">Members only</p>
            <p className="mb-5 text-sm text-ink-muted">
              The first lesson is free to watch. The rest come with the membership.
            </p>
            <Button href={user ? "/dashboard" : "/register"} variant="emerald">
              Start 7 days free
            </Button>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-10">
        {course.modules.map((module, moduleIndex) => (
          <section key={module.id}>
            <h2 className="mb-3 font-display text-xl text-on-velvet">
              <span className="mr-3 text-gold">{String(moduleIndex + 1).padStart(2, "0")}</span>
              {module.title}
            </h2>
            {module.description && (
              <p className="mb-3 text-sm text-on-velvet-2">{module.description}</p>
            )}

            <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-glass">
              {module.lessons.map((lesson) => {
                const inner = (
                  <>
                    <span
                      className={cx(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        lesson.is_completed
                          ? "border-jade bg-jade/20 text-jade-on"
                          : "border-hairline-strong text-transparent",
                      )}
                      aria-hidden
                    >
                      &#10003;
                    </span>
                    <span className="min-w-0 flex-1 break-words text-sm">{lesson.title}</span>
                    {lesson.is_preview && !lesson.is_completed && (
                      <Badge tone="trial" className="shrink-0">
                        Free
                      </Badge>
                    )}
                    <span className="shrink-0 text-[13px] text-on-velvet-faint">
                      {lesson.is_locked ? "Members" : duration(lesson.duration_seconds)}
                    </span>
                  </>
                );

                return (
                  <li key={lesson.id}>
                    {lesson.is_locked ? (
                      <div className="flex min-h-[44px] items-center gap-3 px-5 py-4 opacity-60">
                        {inner}
                      </div>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.id}`}
                        className="flex min-h-[44px] items-center gap-3 px-5 py-4 transition duration-[--dur] ease-ease hover:bg-glass-hover"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
