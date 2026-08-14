"use client";

import { useFormState } from "react-dom";

import { SubmitButton } from "@/components/SubmitButton";
import { createCourse, type ActionState } from "@/lib/admin-actions";
import { STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

const initial: ActionState = { error: null };

export function CreateCourseForm() {
  const [state, action] = useFormState(createCourse, initial);

  return (
    <form action={action} className="card-dark grid gap-3 p-5 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Title
        </span>
        <input name="title" required className="field" placeholder="Bachata Essentials" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Slug
        </span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase words separated by hyphens"
          className="field"
          placeholder="bachata-essentials"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Style
        </span>
        <select name="style" className="field" defaultValue="all_styles">
          {[...STYLE_ORDER, "all_styles" as const].map((style) => (
            <option key={style} value={style} className="bg-moss-900">
              {STYLE_LABELS[style]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Access
        </span>
        <select name="required_tier" className="field" defaultValue="member">
          <option value="member" className="bg-moss-900">
            Members only
          </option>
          <option value="free" className="bg-moss-900">
            Free
          </option>
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Summary
        </span>
        <input name="summary" className="field" placeholder="One line for the catalog card" />
      </label>

      {state.error && (
        <p role="alert" className="sm:col-span-2 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2 sm:max-w-[220px]">
        <SubmitButton pendingLabel="Creating...">Create course</SubmitButton>
      </div>
    </form>
  );
}
