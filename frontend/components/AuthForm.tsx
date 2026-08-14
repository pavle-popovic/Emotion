"use client";

import { useFormState } from "react-dom";

import type { FormState } from "@/lib/actions";

import { SubmitButton } from "./SubmitButton";

const initialState: FormState = { error: null };

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  includeName = false,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  includeName?: boolean;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {includeName && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
            Your name
          </span>
          <input name="full_name" type="text" autoComplete="name" className="field" placeholder="Maya" />
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.08em] text-cream/60">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={includeName ? "new-password" : "current-password"}
          className="field"
          placeholder="At least 8 characters"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <div className="mt-1.5">
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
