"use client";

import { useFormState } from "react-dom";

import { changePassword, updateProfile, type FormState } from "@/lib/actions";
import { STYLE_LABELS, STYLE_ORDER, type DanceStyle } from "@/lib/types";

import { SubmitButton } from "./SubmitButton";

const initial: FormState = { error: null };

function Notice({ state, okText }: { state: FormState; okText: string }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="rounded-xl bg-jade/15 px-4 py-3 text-sm text-[#9FE3C6]">
        {okText}
      </p>
    );
  }
  return null;
}

export function ProfileForm({
  fullName,
  preferredStyle,
}: {
  fullName: string;
  preferredStyle: DanceStyle | null;
}) {
  const [state, action] = useFormState(updateProfile, initial);

  return (
    <form action={action} className="card-dark flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg">Your details</h2>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Name
        </span>
        <input name="full_name" defaultValue={fullName} className="field" placeholder="Maya" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Main style
        </span>
        <select name="preferred_style" defaultValue={preferredStyle ?? ""} className="field">
          <option value="" className="bg-moss-900">
            No preference
          </option>
          {STYLE_ORDER.map((style) => (
            <option key={style} value={style} className="bg-moss-900">
              {STYLE_LABELS[style]}
            </option>
          ))}
        </select>
      </label>

      <Notice state={state} okText="Saved." />

      <div className="sm:max-w-[180px]">
        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, initial);

  return (
    <form action={action} className="card-dark flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg">Password</h2>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Current password
        </span>
        <input
          name="current_password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          New password
        </span>
        <input
          name="new_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          placeholder="At least 8 characters"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Confirm new password
        </span>
        <input
          name="confirm_password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
        />
      </label>

      <Notice state={state} okText="Password changed." />

      <div className="sm:max-w-[220px]">
        <SubmitButton pendingLabel="Changing...">Change password</SubmitButton>
      </div>
    </form>
  );
}
