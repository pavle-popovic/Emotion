import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
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
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <Link href="/courses" className="text-xs text-cream/50 transition hover:text-gold">
          &larr; All courses
        </Link>

        <header className="pb-8 pt-4">
          <p className="label-caps mb-2.5">
            {course.style_label} &middot; {course.lesson_count} lessons
            {course.total_duration_seconds > 0 &&
              ` · ${duration(course.total_duration_seconds)}`}
          </p>
          <h1 className="mb-3 font-display text-[34px] font-normal leading-tight">
            {course.title}
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-cream/70">
            {course.description}
          </p>

          {course.progress_percent > 0 && (
            <div className="mt-6 max-w-sm">
              <div className="mb-2 flex justify-between text-xs text-cream/60">
                <span>
                  {course.completed_lessons} of {course.lesson_count} done
                </span>
                <span className="text-gold">{course.progress_percent}%</span>
              </div>
              <ProgressBar percent={course.progress_percent} />
            </div>
          )}

          {resumeHref && (
            <div className="mt-6 max-w-[240px]">
              <Link href={resumeHref} className="btn-cta">
                {started ? "Resume" : "Start course"}
              </Link>
            </div>
          )}

          {course.is_locked && (
            <div className="card-light mt-6 px-5 py-5">
              <p className="mb-1 text-[11px] uppercase tracking-label text-gold">Members only</p>
              <p className="mb-3.5 text-sm text-sage">
                The first lesson is free to watch. The rest come with the membership.
              </p>
              <Link href={user ? "/dashboard" : "/register"} className="btn-dark max-w-[220px]">
                Start 7 days free
              </Link>
            </div>
          )}
        </header>

        <div className="space-y-8">
          {course.modules.map((module, moduleIndex) => (
            <section key={module.id}>
              <h2 className="mb-1 font-display text-lg font-normal">
                <span className="mr-2.5 text-gold">
                  {String(moduleIndex + 1).padStart(2, "0")}
                </span>
                {module.title}
              </h2>
              {module.description && (
                <p className="mb-2.5 text-[13px] text-cream/55">{module.description}</p>
              )}

              <ul className="card-dark divide-y divide-cream/[0.12] overflow-hidden">
                {module.lessons.map((lesson) => {
                  const inner = (
                    <>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          lesson.is_completed
                            ? "border-jade bg-jade/20 text-jade"
                            : "border-cream/25 text-transparent"
                        }`}
                        aria-hidden
                      >
                        &#10003;
                      </span>
                      <span className="min-w-0 flex-1 break-words text-sm">{lesson.title}</span>
                      {lesson.is_preview && !lesson.is_completed && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-gold">
                          Free
                        </span>
                      )}
                      <span className="shrink-0 text-xs text-cream/45">
                        {lesson.is_locked ? "Members" : duration(lesson.duration_seconds)}
                      </span>
                    </>
                  );

                  return (
                    <li key={lesson.id}>
                      {lesson.is_locked ? (
                        <div className="flex items-center gap-3 px-4 py-3 opacity-50">{inner}</div>
                      ) : (
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-cream/[0.06]"
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
      </main>
    </>
  );
}
