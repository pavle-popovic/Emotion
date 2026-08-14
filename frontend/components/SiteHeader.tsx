import Link from "next/link";

import { logout } from "@/lib/actions";
import type { User } from "@/lib/types";

import { Brand } from "./Brand";

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
      <Brand />
      <nav className="flex items-center gap-5 text-sm text-cream/70">
        <Link href="/courses" className="transition hover:text-cream">
          Courses
        </Link>
        {user ? (
          <>
            <Link href="/dashboard" className="transition hover:text-cream">
              My practice
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="text-gold transition hover:text-cream">
                Admin
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="text-cream/50 transition hover:text-gold">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="transition hover:text-cream">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-pill bg-cream-cta px-4 py-2 font-semibold text-moss transition hover:bg-cream"
            >
              Start free
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
