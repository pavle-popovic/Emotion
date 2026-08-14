import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { register } from "@/lib/actions";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

const PROMISES = ["Every course, all four styles", "New choreographies weekly", "No partner needed"];

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthLayout
      side="left"
      aside={
        <ul className="flex max-w-[380px] flex-col gap-5">
          {PROMISES.map((item) => (
            <li key={item} className="flex gap-3 text-base text-cream-surface">
              <span aria-hidden className="text-gold">
                &#10003;
              </span>
              {item}
            </li>
          ))}
        </ul>
      }
    >
      <h1 className="mb-2.5 mt-0 font-display text-[38px] text-moss lg:mt-11">
        Start your 7 free days.
      </h1>
      <p className="mb-10 text-base text-ink-faint">
        Then €29/month. Cancel anytime, two clicks.
      </p>

      <AuthForm
        action={register}
        submitLabel="Create account"
        pendingLabel="Creating..."
        includeName
      />

      <p className="mt-5 text-center text-[13px] leading-relaxed text-ink-faint">
        By continuing you agree to our Terms &amp; Privacy Policy.
      </p>
      <p className="mt-8 text-center text-[15px] text-ink-muted">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-gold hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
