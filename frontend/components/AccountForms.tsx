"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button, Input, Toast } from "@/components/ui";
import { changePassword, updateProfile, type FormState } from "@/lib/actions";
import { STYLE_LABELS, STYLE_ORDER, type DanceStyle } from "@/lib/types";

const initial: FormState = { error: null };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="emerald" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

const SELECT_CLASS =
  "min-h-[52px] w-full rounded-input border border-ink-hairline bg-white px-4 py-4 text-base text-ink outline-none";

export function ProfileForm({
  fullName,
  preferredStyle,
}: {
  fullName: string;
  preferredStyle: DanceStyle | null;
}) {
  const [state, action] = useFormState(updateProfile, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <h2 className="font-display text-[22px] text-moss">Your details</h2>

      <Input label="Name" name="full_name" defaultValue={fullName} tone="cream" placeholder="Your name" />

      <div className="flex flex-col gap-2">
        <label htmlFor="preferred_style" className="text-[13px] uppercase tracking-wide text-ink-muted">
          Main style
        </label>
        <select
          id="preferred_style"
          name="preferred_style"
          defaultValue={preferredStyle ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">No preference</option>
          {STYLE_ORDER.map((style) => (
            <option key={style} value={style}>
              {STYLE_LABELS[style]}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p role="alert" className="text-[13px] text-warn">
          {state.error}
        </p>
      )}

      <div>
        <Submit label="Save" />
      </div>
      <Toast message={state.ok ? "Details saved." : null} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <h2 className="font-display text-[22px] text-moss">Password</h2>

      <Input
        label="Current password"
        name="current_password"
        type="password"
        required
        autoComplete="current-password"
        tone="cream"
      />
      <Input
        label="New password"
        name="new_password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="8+ characters"
        tone="cream"
      />
      <Input
        label="Confirm new password"
        name="confirm_password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        tone="cream"
        error={state.error}
      />

      <div>
        <Submit label="Change password" />
      </div>
      <Toast message={state.ok ? "Password changed." : null} />
    </form>
  );
}
