import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";
import { register } from "@/lib/actions";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-7 py-16">
      <div className="mb-12 text-center">
        <Brand />
      </div>

      <h1 className="mb-1.5 font-display text-3xl font-normal">Start moving.</h1>
      <p className="mb-8 text-sm text-cream/55">Seven days free, then €29/month. Cancel anytime.</p>

      <AuthForm
        action={register}
        submitLabel="Create my account"
        pendingLabel="Creating..."
        includeName
      />

      <p className="mt-8 text-center text-[13px] text-cream/55">
        Already dancing with us?{" "}
        <Link href="/login" className="font-medium text-gold hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
