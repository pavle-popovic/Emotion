import Link from "next/link";
import { listCourses } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { courses, error } = await listCourses();

  if (error) {
    return (
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
        <p className="mt-4 rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm text-neutral-400">
          The catalog is unavailable right now. {error}
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>

      {courses.length === 0 ? (
        <p className="mt-4 text-neutral-400">
          No published courses yet. Add one and set <code>is_published</code> to true.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/courses/${course.slug}`}
                className="block rounded-xl border border-ink-700 bg-ink-900 p-5 transition hover:border-accent/60"
              >
                <h2 className="font-medium">{course.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                  {course.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
