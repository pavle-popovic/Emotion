import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { login } from "@/lib/actions";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthLayout
      side="right"
      aside={
        <>
          <p className="max-w-[400px] font-display text-[34px] leading-snug text-cream-surface">
            &ldquo;Dance is the feeling. We just teach the words.&rdquo;
          </p>
          <p className="mt-4 text-sm uppercase tracking-label text-gold">Sanjay MJ</p>
        </>
      }
    >
      <h1 className="mb-2.5 mt-0 font-display text-[38px] text-moss lg:mt-11">Welcome back.</h1>
      <p className="mb-10 text-base text-ink-muted">The floor missed you.</p>

      <AuthForm action={login} submitLabel="Log in" pendingLabel="Logging in..." />

      <p className="mt-9 text-center text-[15px] text-ink-muted">
        New to E&#8209;motion?{" "}
        <Link href="/register" className="font-medium text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
