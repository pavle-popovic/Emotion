import { redirect } from "next/navigation";

import { PasswordForm, ProfileForm } from "@/components/AccountForms";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

const STATUS_COPY: Record<string, string> = {
  trialing: "Free trial",
  active: "Active",
  past_due: "Payment failed",
  canceled: "Canceled",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sub = user.subscription;

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <h1 className="mb-1.5 font-display text-3xl font-normal">Account</h1>
        <p className="mb-8 break-words text-sm text-cream/60">{user.email}</p>

        <div className="card-dark mb-6 p-5">
          <h2 className="mb-2 font-display text-lg">Membership</h2>
          {sub ? (
            <p className="text-sm text-cream/70">
              {STATUS_COPY[sub.status] ?? sub.status}
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
            <p className="text-sm text-cream/70">
              No membership yet. Start your free trial from{" "}
              <a href="/dashboard" className="text-gold hover:underline">
                My practice
              </a>
              .
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <ProfileForm fullName={user.full_name} preferredStyle={user.preferred_style} />
          <PasswordForm />
        </div>
      </main>
    </>
  );
}
