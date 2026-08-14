import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { PageShell } from "@/components/PageShell";
import { Badge, EmptyState, SectionHeading, StatTile } from "@/components/ui";
import { listCourses } from "@/lib/admin-actions";
import { getCurrentUser } from "@/lib/api";
import { STYLE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const courses = await listCourses();
  const published = courses.filter((c) => c.is_published);
  const lessons = courses.reduce((sum, c) => sum + c.lesson_count, 0);

  return (
    <PageShell user={user} width="panel">
      <div className="py-14">
        <SectionHeading
          eyebrow="Admin"
          title={`Good to see you, ${user.full_name || "Sanjay"}.`}
          lede="Everything in the catalog, published or not."
        />
      </div>

      <div className="mb-14 grid grid-cols-2 gap-5 sm:grid-cols-3">
        <StatTile value={courses.length} label="Courses" />
        <StatTile value={published.length} label="Published" />
        <StatTile value={lessons} label="Lessons" />
      </div>

      <h2 className="mb-5 font-display text-[22px] text-on-velvet">Catalog</h2>
      {courses.length === 0 ? (
        <EmptyState title="No courses yet." body="Create the first one below." />
      ) : (
        <ul className="mb-14 flex flex-col gap-3">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/admin/courses/${course.id}`}
                className="flex min-h-[44px] flex-wrap items-center gap-4 rounded-card border border-hairline bg-glass px-5 py-4 transition duration-[--dur] ease-ease hover:border-gold/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base text-on-velvet">
                    {course.title}
                  </span>
                  <span className="mt-1 block text-[13px] text-on-velvet-faint">
                    {STYLE_LABELS[course.style]} &middot; {course.lesson_count} lessons &middot;{" "}
                    {course.required_tier === "free" ? "Free" : "Members"}
                  </span>
                </span>
                <Badge tone={course.is_published ? "live" : "draft"}>
                  {course.is_published ? "Live" : "Draft"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-5 font-display text-[22px] text-on-velvet">New course</h2>
      <CreateCourseForm />
    </PageShell>
  );
}
