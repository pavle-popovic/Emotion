"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";
import { startTrial } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="emerald" disabled={pending}>
      {pending ? "Starting..." : "Start 7 days free"}
    </Button>
  );
}

export function StartTrialCard() {
  return (
    <section className="mb-16 rounded-[24px] bg-cream-surface px-8 py-8 text-ink shadow-raised sm:px-10">
      <p className="mb-2 text-[13px] uppercase tracking-label text-gold">Membership</p>
      <h2 className="mb-3 font-display text-[22px] text-moss">Unlock every course.</h2>
      <p className="mb-6 max-w-md text-sm text-ink-muted">
        Seven days free, then €29/month. Cancel anytime, two clicks.
      </p>
      <form action={startTrial}>
        <Submit />
      </form>
    </section>
  );
}
