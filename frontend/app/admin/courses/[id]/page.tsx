import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { VideoUploader } from "@/components/admin/VideoUploader";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getCourse,
  updateCourse,
} from "@/lib/admin-actions";
import { getCurrentUser } from "@/lib/api";
import { STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCoursePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const courseId = Number(params.id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await getCourse(courseId);
  if (!course) notFound();

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-4xl px-6 pb-24">
        <Link href="/admin" className="text-xs text-cream/50 transition hover:text-gold">
          &larr; Catalog
        </Link>

        <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-normal">{course.title}</h1>
          <Link
            href={`/courses/${course.slug}`}
            className="text-xs text-cream/50 transition hover:text-gold"
          >
            View public page &rarr;
          </Link>
        </div>

        {/* Settings */}
        <form action={updateCourse.bind(null, course.id)} className="card-dark mb-10 grid gap-3 p-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
              Title
            </span>
            <input name="title" defaultValue={course.title} className="field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
              Style
            </span>
            <select name="style" defaultValue={course.style} className="field">
              {[...STYLE_ORDER, "all_styles" as const].map((style) => (
                <option key={style} value={style} className="bg-moss-900">
                  {STYLE_LABELS[style]}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
              Summary
            </span>
            <input name="summary" defaultValue={course.summary} className="field" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
              Description
            </span>
            <textarea name="description" defaultValue={course.description} rows={4} className="field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
              Access
            </span>
            <select name="required_tier" defaultValue={course.required_tier} className="field">
              <option value="member" className="bg-moss-900">Members only</option>
              <option value="free" className="bg-moss-900">Free</option>
            </select>
          </label>

          <label className="flex items-center gap-3 self-end pb-3">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={course.is_published}
              className="h-4 w-4 accent-[#B08D57]"
            />
            <span className="text-sm text-cream/80">Published (visible in the catalog)</span>
          </label>

          <div className="sm:col-span-2 sm:max-w-[200px]">
            <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
          </div>
        </form>

        {/* Structure */}
        <h2 className="mb-3 font-display text-xl font-normal">Modules</h2>
        <div className="mb-6 flex flex-col gap-5">
          {course.modules.map((module) => (
            <section key={module.id} className="card-dark p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-display text-lg">{module.title}</h3>
                <form action={deleteModule.bind(null, module.id, course.id)}>
                  <button
                    type="submit"
                    className="text-xs text-cream/40 transition hover:text-red-300"
                  >
                    Delete module
                  </button>
                </form>
              </div>

              <ul className="mb-4 flex flex-col divide-y divide-cream/10">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="py-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm">
                        {lesson.title}
                        {lesson.is_preview && (
                          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-gold">
                            Free preview
                          </span>
                        )}
                      </span>
                      <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                        <button
                          type="submit"
                          className="text-xs text-cream/40 transition hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                    <VideoUploader lesson={lesson} courseId={course.id} />
                  </li>
                ))}
                {module.lessons.length === 0 && (
                  <li className="py-3 text-xs text-cream/40">No lessons yet.</li>
                )}
              </ul>

              <form
                action={createLesson.bind(null, module.id, course.id)}
                className="flex flex-wrap gap-2"
              >
                <input
                  name="title"
                  required
                  placeholder="New lesson title"
                  className="field flex-1 !py-2.5 text-sm"
                />
                <SubmitButton
                  className="rounded-pill border border-cream/25 px-4 py-2 text-xs transition hover:border-gold hover:text-gold"
                  pendingLabel="Adding..."
                >
                  Add lesson
                </SubmitButton>
              </form>
            </section>
          ))}
        </div>

        <form action={createModule.bind(null, course.id)} className="mb-14 flex flex-wrap gap-2">
          <input
            name="title"
            required
            placeholder="New module title"
            className="field flex-1 !py-2.5 text-sm"
          />
          <SubmitButton
            className="rounded-pill border border-cream/25 px-4 py-2 text-xs transition hover:border-gold hover:text-gold"
            pendingLabel="Adding..."
          >
            Add module
          </SubmitButton>
        </form>

        <form action={deleteCourse.bind(null, course.id)} className="border-t border-cream/10 pt-6">
          <button type="submit" className="text-xs text-red-300/70 transition hover:text-red-300">
            Delete this course and everything in it
          </button>
        </form>
      </main>
    </>
  );
}
