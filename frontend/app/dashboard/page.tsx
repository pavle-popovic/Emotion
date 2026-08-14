import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/PageShell";
import { StartTrialCard } from "@/components/dashboard/StartTrialCard";
import { Avatar, Button, EmptyState, ProgressBar, StatTile } from "@/components/ui";
import { cx } from "@/lib/cx";
import { getCurrentUser, getDashboard } from "@/lib/api";
import { STYLE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

function memberSince(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboard();
  const stats = data?.stats ?? { lessons_completed: 0, courses_completed: 0, day_streak: 0 };
  const cont = data?.continue_card ?? null;
  const courses = data?.courses ?? [];
  const week = data?.week ?? [];
  const practiceDays = data?.practice_days_this_week ?? 0;

  const since = memberSince(user.created_at);
  const subtitle = [
    since && `Member since ${since}`,
    user.preferred_style ? STYLE_LABELS[user.preferred_style] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageShell user={user} width="panel">
      {/* Identity + stats */}
      <header className="flex flex-wrap items-center gap-10 py-14">
        <Avatar name={user.full_name || user.email} size={112} />
        <div className="min-w-0 flex-1">
          <h1 className="mb-2 break-words font-display text-[clamp(28px,3.6vw,38px)] text-cream-surface">
            {user.full_name || "Dancer"}
          </h1>
          <p className="text-[15px] text-on-velvet-2">{subtitle || "Pick a style to begin"}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-5 sm:w-auto">
          <StatTile value={stats.day_streak} label="Day streak" className="sm:min-w-[110px]" />
          <StatTile value={stats.lessons_completed} label="Lessons done" className="sm:min-w-[110px]" />
          <StatTile value={stats.courses_completed} label="Courses finished" className="sm:min-w-[110px]" />
        </div>
      </header>

      {user.tier === "free" && user.role !== "admin" && <StartTrialCard />}

      {/* Continue */}
      {cont && (
        <section className="mb-16">
          <h2 className="mb-6 font-display text-[26px] text-on-velvet">
            Continue where you left off
          </h2>
          <div className="bg-velvet flex flex-wrap items-center gap-10 rounded-[24px] border border-hairline-strong px-8 py-9 sm:px-11">
            <div className="min-w-[240px] flex-1">
              <p className="mb-2.5 text-[12px] uppercase tracking-label text-gold">
                {cont.course_title} &middot; Lesson {cont.position} of {cont.total_in_course}
              </p>
              <p className="mb-5 font-display text-[28px] text-cream-surface">{cont.lesson_title}</p>
              <ProgressBar
                percent={cont.progress_percent}
                className="max-w-[420px]"
                label="Course progress"
              />
              <p className="mt-2 text-[13px] text-on-velvet-faint">
                {cont.progress_percent}% complete
              </p>
            </div>
            <Button href={`/courses/${cont.course_slug}/lessons/${cont.lesson_id}`} size="lg">
              Resume &rarr;
            </Button>
          </div>
        </section>
      )}

      {/* My courses */}
      <section className="mb-16">
        <h2 className="mb-6 font-display text-[26px] text-on-velvet">My courses</h2>
        {courses.length === 0 ? (
          <EmptyState
            title="You have not started a course yet."
            body="Pick any course and the first lesson is one tap away."
            action={
              <Button href="/courses" variant="ghost">
                Browse the catalog
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="grid grid-cols-1 items-center gap-4 border-t border-hairline-strong px-2 py-6 transition duration-[--dur] ease-ease hover:bg-gold/[0.06] sm:grid-cols-[1fr_auto_220px_auto]"
                >
                  <div className="min-w-0">
                    <div className="break-words font-display text-[19px] text-on-velvet">
                      {course.title}
                    </div>
                    <div className="mt-1 text-[13px] text-on-velvet-faint">
                      {course.style_label} &middot; {course.lesson_count} lessons
                    </div>
                  </div>
                  <span className="text-sm text-on-velvet-2">{course.completed_lessons} done</span>
                  <ProgressBar percent={course.progress_percent} label={`${course.title} progress`} />
                  <span className="text-sm text-gold sm:text-right">{course.progress_percent}%</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* This week + account */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-cream-blush px-9 py-9 text-ink">
          <h3 className="mb-5 font-display text-[22px] text-moss">This week</h3>
          <div className="mb-5 flex gap-2.5">
            {week.map((day, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={cx(
                    "mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                    day.practiced ? "bg-moss text-gold" : "bg-moss/[0.08] text-ink-muted",
                    day.is_today && !day.practiced && "ring-1 ring-gold",
                  )}
                >
                  {day.practiced ? "✓" : "·"}
                </div>
                <div className="text-[11px] tracking-wide text-ink-muted">{day.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-muted">
            {practiceDays === 0
              ? "No practice logged yet this week."
              : `${practiceDays} practice ${practiceDays === 1 ? "day" : "days"} this week.`}
          </p>
        </div>

        <div className="rounded-[24px] border border-ink-hairline bg-white px-9 py-9 text-ink">
          <h3 className="mb-5 font-display text-[22px] text-moss">Account</h3>
          <dl className="flex flex-col gap-3.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Plan</dt>
              <dd className="text-right">
                {user.tier === "member" ? "E-motion Membership · €29/mo" : "No membership"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Status</dt>
              <dd className="text-right capitalize">
                {user.subscription?.status.replace("_", " ") ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Email</dt>
              <dd className="min-w-0 break-all text-right">{user.email}</dd>
            </div>
          </dl>
          <div className="mt-7">
            <Button href="/account" variant="link">
              Manage account
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
