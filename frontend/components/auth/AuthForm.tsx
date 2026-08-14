"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button, Input } from "@/components/ui";
import type { FormState } from "@/lib/actions";

const initialState: FormState = { error: null };

function Submit({ label, pending }: { label: string; pending: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" variant="emerald" size="lg" fullWidth disabled={status.pending}>
      {status.pending ? pending : label}
    </Button>
  );
}

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
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {includeName && (
        <Input label="Name" name="full_name" type="text" autoComplete="name" placeholder="Your name" />
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete={includeName ? "new-password" : "current-password"}
        placeholder={includeName ? "8+ characters" : "••••••••"}
        error={state.error}
      />

      <div className="mt-2">
        <Submit label={submitLabel} pending={pendingLabel} />
      </div>
    </form>
  );
}
