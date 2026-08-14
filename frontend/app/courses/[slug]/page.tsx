import { notFound } from "next/navigation";
import { getCourse } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);
  if (!course) notFound();

  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mt-3 max-w-2xl text-neutral-400">{course.description}</p>

      <div className="mt-10 space-y-8">
        {course.modules.map((module) => (
          <section key={module.id}>
            <h2 className="text-lg font-medium">{module.title}</h2>
            {module.description && (
              <p className="mt-1 text-sm text-neutral-400">{module.description}</p>
            )}
            <ul className="mt-3 divide-y divide-ink-700/60 rounded-xl border border-ink-700 bg-ink-900">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="px-5 py-3 text-sm">
                  {lesson.title}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
