import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { Brand } from "@/components/Brand";
import { login } from "@/lib/actions";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-7 py-16">
      <div className="mb-12 text-center">
        <Brand />
      </div>

      <h1 className="mb-1.5 font-display text-3xl font-normal">Welcome back.</h1>
      <p className="mb-8 text-sm text-cream/55">The floor missed you.</p>

      <AuthForm action={login} submitLabel="Log in" pendingLabel="Logging in..." />

      <p className="mt-8 text-center text-[13px] text-cream/55">
        New here?{" "}
        <Link href="/register" className="font-medium text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
