import Link from "next/link";
import { redirect } from "next/navigation";

import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { startTrial } from "@/lib/actions";
import { getCurrentUser, getDashboard } from "@/lib/api";
import { STYLE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboard();
  const stats = data?.stats ?? { lessons_completed: 0, courses_completed: 0, day_streak: 0 };
  const cont = data?.continue_card ?? null;
  const courses = data?.courses ?? [];
  const initials = (user.full_name || user.email).trim().charAt(0).toUpperCase();

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-3xl px-5 pb-24">
        {/* Identity */}
        <section className="flex items-center gap-[18px] px-1 pb-7 pt-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-cream/10 font-display text-2xl text-gold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="break-words font-display text-2xl">{user.full_name || "Dancer"}</div>
            <div className="mt-0.5 text-[13px] text-cream/60">
              {user.preferred_style ? STYLE_LABELS[user.preferred_style] : "Pick a style to begin"}
            </div>
          </div>
        </section>

        {/* Membership prompt. Admins bypass tier gating entirely, so selling
            them a membership would be nonsense. */}
        {user.tier === "free" && user.role !== "admin" && (
          <section className="card-light mb-7 px-6 py-6">
            <p className="mb-1.5 text-[11px] uppercase tracking-label text-gold">Membership</p>
            <h2 className="mb-2 font-display text-xl font-normal text-moss">
              Unlock every course.
            </h2>
            <p className="mb-4 text-sm text-sage">
              Seven days free, then €29/month. Cancel anytime.
            </p>
            <form action={startTrial} className="max-w-xs">
              <SubmitButton className="btn-dark" pendingLabel="Starting...">
                Start 7 days free
              </SubmitButton>
            </form>
          </section>
        )}

        {/* Stats */}
        <section className="mb-7 flex gap-3">
          {[
            { val: stats.day_streak, label: "Day streak" },
            { val: stats.lessons_completed, label: "Lessons" },
            { val: stats.courses_completed, label: "Finished" },
          ].map((stat) => (
            <div key={stat.label} className="card-dark flex-1 px-2 py-4 text-center">
              <div className="font-display text-[22px] text-gold">{stat.val}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-cream/60">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Continue */}
        {cont && (
          <section className="card-dark mb-7 rounded-[20px] px-[22px] pb-6 pt-[22px]">
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-gold">
              Continue &middot; Lesson {cont.position} of {cont.total_in_course}
            </div>
            <div className="mb-3.5 font-display text-[19px]">{cont.lesson_title}</div>
            <ProgressBar percent={cont.progress_percent} className="mb-4" height="h-[5px]" />
            <Link
              href={`/courses/${cont.course_slug}/lessons/${cont.lesson_id}`}
              className="btn-cta py-3.5 text-sm"
            >
              Resume &rarr;
            </Link>
          </section>
        )}

        {/* My courses */}
        <section>
          <h2 className="mb-3.5 font-display text-[19px] font-normal">My courses</h2>
          {courses.length === 0 ? (
            <div className="card-dark px-5 py-8 text-center">
              <p className="mb-4 text-sm text-cream/60">
                You have not started a course yet.
              </p>
              <Link href="/courses" className="btn-ghost mx-auto max-w-[200px]">
                Browse the catalog
              </Link>
            </div>
          ) : (
            <ul>
              {courses.map((course) => (
                <li key={course.id} className="border-t border-cream/[0.14] px-0.5 py-3.5">
                  <Link href={`/courses/${course.slug}`} className="group block">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <span className="min-w-0 break-words font-display text-[15px] transition group-hover:text-gold">
                        {course.title}
                      </span>
                      <span className="shrink-0 text-xs text-gold">
                        {course.progress_percent}%
                      </span>
                    </div>
                    <ProgressBar percent={course.progress_percent} height="h-1" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
