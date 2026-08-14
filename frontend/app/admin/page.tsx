import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { SiteHeader } from "@/components/SiteHeader";
import { listCourses } from "@/lib/admin-actions";
import { getCurrentUser } from "@/lib/api";
import { STYLE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const courses = await listCourses();

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-4xl px-6 pb-24">
        <h1 className="mb-1.5 font-display text-3xl font-normal">Catalog</h1>
        <p className="mb-8 text-sm text-cream/60">
          {courses.length} courses &middot;{" "}
          {courses.filter((c) => c.is_published).length} published
        </p>

        <ul className="mb-10 flex flex-col gap-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/admin/courses/${course.id}`}
                className="card-dark flex items-center gap-4 p-4 transition hover:border-gold/60"
              >
                <span className="flex-1">
                  <span className="block font-display text-base">{course.title}</span>
                  <span className="mt-0.5 block text-xs text-cream/50">
                    {STYLE_LABELS[course.style]} &middot; {course.lesson_count} lessons &middot;{" "}
                    {course.required_tier === "free" ? "Free" : "Members"}
                  </span>
                </span>
                <span
                  className={`rounded-pill border px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${
                    course.is_published
                      ? "border-jade text-jade"
                      : "border-cream/25 text-cream/50"
                  }`}
                >
                  {course.is_published ? "Live" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mb-3 font-display text-xl font-normal">New course</h2>
        <CreateCourseForm />
      </main>
    </>
  );
}
