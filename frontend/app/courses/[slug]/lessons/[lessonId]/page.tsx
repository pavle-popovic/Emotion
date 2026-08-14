import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonRail } from "@/components/player/LessonRail";
import { PlayerShell } from "@/components/player/PlayerShell";
import { Button, EyebrowLabel } from "@/components/ui";
import { Nav } from "@/components/ui/Nav";
import { getCourse, getCurrentUser, getLesson } from "@/lib/api";

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
        <Nav user={user} />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <EyebrowLabel className="mb-4">Members only</EyebrowLabel>
          <h1 className="mb-4 font-display text-[32px] text-on-velvet">
            This one is behind the door.
          </h1>
          <p className="mb-8 text-sm text-on-velvet-2">
            Seven days free, then €29/month for every course. Cancel anytime.
          </p>
          <Button href={user ? "/dashboard" : "/register"} size="lg">
            Start 7 days free
          </Button>
          <div className="mt-8">
            <Link
              href={`/courses/${params.slug}`}
              className="text-[13px] text-on-velvet-faint hover:text-gold"
            >
              &larr; Back to the course
            </Link>
          </div>
        </main>
      </>
    );
  }

  const lesson = result.lesson;
  const lessons = course?.modules.flatMap((m) => m.lessons) ?? [];

  return (
    <>
      <Nav user={user} />

      {/* Rails are independently scrollable; the page itself never scrolls
          horizontally and the stage keeps its aspect ratio at every width. */}
      <main className="mx-auto grid min-h-0 max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[296px_minmax(0,1fr)]">
        <LessonRail
          course={course}
          lessons={lessons}
          currentId={lesson.id}
          courseSlug={lesson.course_slug}
          courseTitle={lesson.course_title}
        />

        <section className="min-w-0">
          <div className="mb-5">
            <p className="mb-2 text-[11px] uppercase tracking-label text-gold">
              {lesson.module_title} &middot; Lesson {lesson.position} of {lesson.total_in_course}
            </p>
            <h1 className="font-display text-[clamp(22px,2.6vw,28px)] leading-tight text-on-velvet">
              {lesson.title}
            </h1>
          </div>

          <PlayerShell
            lessonId={lesson.id}
            title={lesson.title}
            playbackId={lesson.mux_playback_id}
            isCompleted={lesson.is_completed}
            durationHint={lesson.duration_seconds}
            startAt={lesson.position_seconds}
          />

          {lesson.body && (
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-on-velvet-2">
              {lesson.body}
            </p>
          )}

          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-hairline-strong pt-6">
            {lesson.previous_lesson_id ? (
              <Link
                href={`/courses/${lesson.course_slug}/lessons/${lesson.previous_lesson_id}`}
                className="min-h-[44px] text-sm text-on-velvet-2 transition duration-[--dur] ease-ease hover:text-gold"
              >
                &larr; Previous
              </Link>
            ) : (
              <span />
            )}

            <Button
              href={
                lesson.next_lesson_id
                  ? `/courses/${lesson.course_slug}/lessons/${lesson.next_lesson_id}`
                  : `/courses/${lesson.course_slug}`
              }
              size="sm"
            >
              {lesson.next_lesson_id ? "Next lesson →" : "Finish course"}
            </Button>
          </nav>
        </section>
      </main>
    </>
  );
}
