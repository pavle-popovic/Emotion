import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminCourseSettings } from "@/components/admin/AdminCourseSettings";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { PageShell } from "@/components/PageShell";
import { Badge, Button } from "@/components/ui";
import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getCourse,
  moveLesson,
  moveModule,
} from "@/lib/admin-actions";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Single-button form. Ordering is a server round trip, so it cannot be a link. */
function IconForm({
  action,
  label,
  glyph,
  danger = false,
}: {
  action: () => Promise<void>;
  label: string;
  glyph: string;
  danger?: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        aria-label={label}
        title={label}
        className={
          danger
            ? "min-h-[44px] px-3 text-[13px] text-on-velvet-faint transition duration-[--dur] ease-ease hover:text-warn-on"
            : "flex h-11 w-11 items-center justify-center rounded-input border border-hairline-strong text-[13px] text-on-velvet-2 transition duration-[--dur] ease-ease hover:border-gold hover:text-gold"
        }
      >
        {glyph}
      </button>
    </form>
  );
}

export default async function AdminCoursePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const courseId = Number(params.id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await getCourse(courseId);
  if (!course) notFound();

  return (
    <PageShell user={user} width="panel">
      <Link
        href="/admin"
        className="inline-flex min-h-[44px] items-center text-[13px] text-on-velvet-faint hover:text-gold"
      >
        &larr; Catalog
      </Link>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(28px,3.6vw,38px)] text-on-velvet">
          {course.title}
        </h1>
        <div className="flex items-center gap-4">
          <Badge tone={course.is_published ? "live" : "draft"}>
            {course.is_published ? "Live" : "Draft"}
          </Badge>
          <Button href={`/courses/${course.slug}`} variant="link">
            View public page &rarr;
          </Button>
        </div>
      </div>

      <AdminCourseSettings course={course} />

      <h2 className="mb-5 font-display text-[22px] text-on-velvet">Modules</h2>
      <div className="mb-8 flex flex-col gap-6">
        {course.modules.map((module) => (
          <section key={module.id} className="rounded-card border border-hairline bg-glass p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="min-w-0 flex-1 font-display text-lg text-on-velvet">{module.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                <IconForm
                  action={moveModule.bind(null, course.id, module.id, -1)}
                  label="Move module up"
                  glyph="↑"
                />
                <IconForm
                  action={moveModule.bind(null, course.id, module.id, 1)}
                  label="Move module down"
                  glyph="↓"
                />
                <IconForm
                  action={deleteModule.bind(null, module.id, course.id)}
                  label="Delete module"
                  glyph="Delete"
                  danger
                />
              </div>
            </div>

            <ul className="mb-5 flex flex-col divide-y divide-hairline">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 break-words text-sm text-on-velvet">
                      {lesson.title}
                      {lesson.is_preview && (
                        <Badge tone="trial" className="ml-3">
                          Free preview
                        </Badge>
                      )}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <IconForm
                        action={moveLesson.bind(null, course.id, module.id, lesson.id, -1)}
                        label="Move lesson up"
                        glyph="↑"
                      />
                      <IconForm
                        action={moveLesson.bind(null, course.id, module.id, lesson.id, 1)}
                        label="Move lesson down"
                        glyph="↓"
                      />
                      <IconForm
                        action={deleteLesson.bind(null, lesson.id, course.id)}
                        label="Delete lesson"
                        glyph="Delete"
                        danger
                      />
                    </div>
                  </div>
                  <VideoUploader lesson={lesson} courseId={course.id} />
                </li>
              ))}
              {module.lessons.length === 0 && (
                <li className="py-4 text-[13px] text-on-velvet-faint">No lessons yet.</li>
              )}
            </ul>

            <form
              action={createLesson.bind(null, module.id, course.id)}
              className="flex flex-wrap items-end gap-3"
            >
              <input
                name="title"
                required
                aria-label="New lesson title"
                placeholder="New lesson title"
                className="min-h-[44px] flex-1 rounded-input border border-hairline-strong bg-glass px-4 text-sm text-on-velvet outline-none placeholder:text-on-velvet-faint"
              />
              <Button type="submit" variant="ghost" size="sm">
                Add lesson
              </Button>
            </form>
          </section>
        ))}
      </div>

      <form action={createModule.bind(null, course.id)} className="mb-14 flex flex-wrap items-end gap-3">
        <input
          name="title"
          required
          aria-label="New module title"
          placeholder="New module title"
          className="min-h-[44px] flex-1 rounded-input border border-hairline-strong bg-glass px-4 text-sm text-on-velvet outline-none placeholder:text-on-velvet-faint"
        />
        <Button type="submit" variant="ghost" size="sm">
          Add module
        </Button>
      </form>

      <form action={deleteCourse.bind(null, course.id)} className="border-t border-hairline pt-8">
        <button
          type="submit"
          className="min-h-[44px] text-[13px] text-warn-on/70 transition duration-[--dur] ease-ease hover:text-warn-on"
        >
          Delete this course and everything in it
        </button>
      </form>
    </PageShell>
  );
}
