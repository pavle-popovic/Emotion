import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/LessonPlayer";
import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser, getLesson } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const lessonId = Number(params.lessonId);
  if (!Number.isFinite(lessonId)) notFound();

  const [user, result] = await Promise.all([getCurrentUser(), getLesson(lessonId)]);
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
  const percent = Math.round((lesson.position / lesson.total_in_course) * 100);

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-3xl px-5 pb-24">
        <Link
          href={`/courses/${lesson.course_slug}`}
          className="text-xs text-cream/50 transition hover:text-gold"
        >
          &larr; {lesson.course_title}
        </Link>

        <div className="pb-5 pt-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-gold">
            {lesson.module_title} &middot; Lesson {lesson.position} of {lesson.total_in_course}
          </p>
          <h1 className="font-display text-[26px] font-normal leading-tight">{lesson.title}</h1>
        </div>

        <LessonPlayer
          lessonId={lesson.id}
          title={lesson.title}
          playbackId={lesson.mux_playback_id}
          isCompleted={lesson.is_completed}
        />

        <ProgressBar percent={percent} className="mt-6" height="h-1" />

        {lesson.body && (
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream/70">{lesson.body}</p>
        )}

        <nav className="mt-10 flex items-center justify-between gap-4 border-t border-cream/[0.14] pt-5">
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
      </main>
    </>
  );
}
