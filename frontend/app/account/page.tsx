import { redirect } from "next/navigation";

import { PasswordForm, ProfileForm } from "@/components/AccountForms";
import { PageShell } from "@/components/PageShell";
import { Badge, Button, SectionHeading } from "@/components/ui";
import { getCurrentUser } from "@/lib/api";
import type { BadgeTone } from "@/components/ui";
import type { SubscriptionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  trialing: { label: "Free trial", tone: "trial" },
  active: { label: "Active", tone: "live" },
  past_due: { label: "Payment failed", tone: "failed" },
  canceled: { label: "Canceled", tone: "draft" },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sub = user.subscription;
  const status = sub ? STATUS[sub.status] : null;

  return (
    <PageShell user={user} width="panel">
      <div className="py-14">
        <SectionHeading title="Account" lede={user.email} />
      </div>

      <section className="mb-6 rounded-card border border-hairline bg-glass px-8 py-8">
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <h2 className="font-display text-[22px] text-on-velvet">Membership</h2>
          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>
        {sub ? (
          <p className="text-sm text-on-velvet-2">
            E&#8209;motion Membership &middot; €29/month
            {sub.current_period_end && (
              <>
                {" "}
                &middot; renews{" "}
                {new Date(sub.current_period_end).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        ) : (
          <div>
            <p className="mb-5 text-sm text-on-velvet-2">
              No membership yet. Seven days free, then €29/month.
            </p>
            <Button href="/dashboard">Start 7 days free</Button>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card bg-cream-surface px-8 py-8 text-ink shadow-raised">
          <ProfileForm fullName={user.full_name} preferredStyle={user.preferred_style} />
        </div>
        <div className="rounded-card bg-cream-surface px-8 py-8 text-ink shadow-raised">
          <PasswordForm />
        </div>
      </div>
    </PageShell>
  );
}
