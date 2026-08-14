import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/LessonPlayer";
import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { getCourse, getCurrentUser, getLesson } from "@/lib/api";
import { duration } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const lessonId = Number(params.lessonId);
  if (!Number.isFinite(lessonId)) notFound();

  const [user, result, course] = await Promise.all([
    getCurrentUser(),
    getLesson(lessonId),
    getCourse(params.slug),
  ]);
  if (!result) notFound();

  if ("locked" in result) {
    return (
      <>
        <SiteHeader user={user} />
        <main className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="label-caps mb-3">Members only</p>
          <h1 className="mb-3 font-display text-3xl font-normal">This one is behind the door.</h1>
          <p className="mb-7 text-sm text-cream/65">
            Seven days free, then €29/month for every course. Cancel anytime.
          </p>
          <div className="mx-auto max-w-[240px]">
            <Link href={user ? "/dashboard" : "/register"} className="btn-cta">
              Start 7 days free
            </Link>
          </div>
          <Link
            href={`/courses/${params.slug}`}
            className="mt-6 inline-block text-xs text-cream/50 transition hover:text-gold"
          >
            &larr; Back to the course
          </Link>
        </main>
      </>
    );
  }

  const lesson = result.lesson;
  const sequence = course?.modules.flatMap((m) => m.lessons) ?? [];

  return (
    <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-5 lg:grid-cols-[296px_1fr] lg:px-6">
      {/* Lesson rail */}
      <aside className="card-dark flex max-h-[80vh] flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-cream/[0.12] px-5 py-4">
          <Link
            href={`/courses/${lesson.course_slug}`}
            className="text-sm font-medium transition hover:text-gold"
          >
            &#8249; Back
          </Link>
          <Link href="/dashboard" className="text-xs text-cream/55 transition hover:text-gold">
            My practice
          </Link>
        </div>

        <div className="border-b border-cream/[0.12] px-5 py-5">
          <div className="mb-2.5 text-[10px] uppercase tracking-[0.24em] text-gold">
            Current course
          </div>
          <div className="mb-4 font-display text-[22px] leading-tight">{lesson.course_title}</div>
          {course && (
            <>
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="text-cream/65">Progress</span>
                <span className="font-semibold text-gold">{course.progress_percent}%</span>
              </div>
              <ProgressBar percent={course.progress_percent} height="h-[5px]" />
            </>
          )}
        </div>

        <ol className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3.5">
          {sequence.map((item, index) => {
            const isCurrent = item.id === lesson.id;
            const state = item.is_completed
              ? "bg-jade text-[#062B22] border-transparent"
              : isCurrent
                ? "bg-gold text-[#062B22] border-transparent"
                : "border-cream/30 text-cream/60";

            const row = (
              <>
                <span
                  className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${state}`}
                >
                  {item.is_completed ? "✓" : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm leading-snug ${isCurrent ? "text-cream" : "text-cream/85"}`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`mt-0.5 block text-[11px] ${isCurrent ? "text-gold" : "text-cream/45"}`}
                  >
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

            const shell = `flex items-center gap-3.5 rounded-2xl border p-3.5 ${
              isCurrent ? "border-gold bg-gold/20" : "border-transparent"
            }`;

            return (
              <li key={item.id}>
                {item.is_locked ? (
                  <div className={`${shell} opacity-50`}>{row}</div>
                ) : (
                  <Link
                    href={`/courses/${lesson.course_slug}/lessons/${item.id}`}
                    className={`${shell} transition hover:bg-cream/[0.09]`}
                  >
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Stage + controls */}
      <section>
        <div className="mb-4">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">
            {lesson.module_title} &middot; Lesson {lesson.position} of {lesson.total_in_course}
          </p>
          <h1 className="font-display text-[26px] font-normal leading-tight">{lesson.title}</h1>
        </div>

        <LessonPlayer
          lessonId={lesson.id}
          title={lesson.title}
          playbackId={lesson.mux_playback_id}
          isCompleted={lesson.is_completed}
          durationHint={lesson.duration_seconds}
          startAt={lesson.position_seconds}
        />

        {lesson.body && (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream/70">{lesson.body}</p>
        )}

        <nav className="mt-8 flex items-center justify-between gap-4 border-t border-cream/[0.14] pt-5">
          {lesson.previous_lesson_id ? (
            <Link
              href={`/courses/${lesson.course_slug}/lessons/${lesson.previous_lesson_id}`}
              className="text-sm text-cream/70 transition hover:text-gold"
            >
              &larr; Previous
            </Link>
          ) : (
            <span />
          )}

          {lesson.next_lesson_id ? (
            <Link
              href={`/courses/${lesson.course_slug}/lessons/${lesson.next_lesson_id}`}
              className="rounded-pill bg-cream-cta px-5 py-2.5 text-sm font-semibold text-moss transition hover:bg-cream"
            >
              Next lesson &rarr;
            </Link>
          ) : (
            <Link
              href={`/courses/${lesson.course_slug}`}
              className="rounded-pill bg-cream-cta px-5 py-2.5 text-sm font-semibold text-moss transition hover:bg-cream"
            >
              Finish course
            </Link>
          )}
        </nav>
      </section>
    </main>
  );
}
