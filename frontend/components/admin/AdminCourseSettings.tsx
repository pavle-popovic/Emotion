"use client";

import { useFormStatus } from "react-dom";

import { Button, Input } from "@/components/ui";
import { updateCourse } from "@/lib/admin-actions";
import type { AdminCourseDetail } from "@/lib/admin-types";
import { STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

const SELECT_CLASS =
  "min-h-[52px] w-full rounded-input border border-hairline-strong bg-glass px-4 py-4 text-base text-on-velvet outline-none";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function AdminCourseSettings({ course }: { course: AdminCourseDetail }) {
  return (
    <form
      action={updateCourse.bind(null, course.id)}
      className="mb-14 grid gap-5 rounded-card border border-hairline bg-glass p-6 sm:grid-cols-2"
    >
      <Input label="Title" name="title" tone="velvet" defaultValue={course.title} />

      <div className="flex flex-col gap-2">
        <label htmlFor="style" className="text-[13px] uppercase tracking-wide text-on-velvet-2">
          Style
        </label>
        <select id="style" name="style" defaultValue={course.style} className={SELECT_CLASS}>
          {[...STYLE_ORDER, "all_styles" as const].map((s) => (
            <option key={s} value={s} className="bg-moss-900">
              {STYLE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Summary"
        name="summary"
        tone="velvet"
        defaultValue={course.summary}
        containerClassName="sm:col-span-2"
      />

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label htmlFor="description" className="text-[13px] uppercase tracking-wide text-on-velvet-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={course.description}
          className="w-full rounded-input border border-hairline-strong bg-glass px-4 py-4 text-base text-on-velvet outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="required_tier" className="text-[13px] uppercase tracking-wide text-on-velvet-2">
          Access
        </label>
        <select
          id="required_tier"
          name="required_tier"
          defaultValue={course.required_tier}
          className={SELECT_CLASS}
        >
          <option value="member" className="bg-moss-900">
            Members only
          </option>
          <option value="free" className="bg-moss-900">
            Free
          </option>
        </select>
      </div>

      {/* The box is 24px; the touch target is the 44px label wrapping it, which
          toggles the same control. */}
      <label className="flex min-h-[44px] items-center gap-3 self-end pb-3">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={course.is_published}
          className="h-6 w-6 accent-gold"
        />
        <span className="text-sm text-on-velvet-2">Published (visible in the catalog)</span>
      </label>

      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
