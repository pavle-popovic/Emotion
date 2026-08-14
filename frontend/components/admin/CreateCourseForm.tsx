"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button, Input } from "@/components/ui";
import { createCourse, type ActionState } from "@/lib/admin-actions";
import { STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

const initial: ActionState = { error: null };

const SELECT_CLASS =
  "min-h-[52px] w-full rounded-input border border-hairline-strong bg-glass px-4 py-4 text-base text-on-velvet outline-none";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create course"}
    </Button>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] uppercase tracking-wide text-on-velvet-2">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={SELECT_CLASS}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-moss-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CreateCourseForm() {
  const [state, action] = useFormState(createCourse, initial);

  return (
    <form
      action={action}
      className="grid gap-5 rounded-card border border-hairline bg-glass p-6 sm:grid-cols-2"
    >
      <Input label="Title" name="title" tone="velvet" required placeholder="Bachata Essentials" />
      <Input
        label="Slug"
        name="slug"
        tone="velvet"
        required
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        title="Lowercase words separated by hyphens"
        placeholder="bachata-essentials"
        error={state.error}
      />

      <Select
        label="Style"
        name="style"
        defaultValue="all_styles"
        options={[...STYLE_ORDER, "all_styles" as const].map((s) => ({
          value: s,
          label: STYLE_LABELS[s],
        }))}
      />
      <Select
        label="Access"
        name="required_tier"
        defaultValue="member"
        options={[
          { value: "member", label: "Members only" },
          { value: "free", label: "Free" },
        ]}
      />

      <Input
        label="Summary"
        name="summary"
        tone="velvet"
        placeholder="One line for the catalog card"
        containerClassName="sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
