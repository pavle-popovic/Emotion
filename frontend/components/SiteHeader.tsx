import Link from "next/link";

import { logout } from "@/lib/actions";
import type { User } from "@/lib/types";

import { Brand } from "./Brand";

/**
 * Wraps rather than overflows. The nav can carry five items for an admin, which
 * does not fit on a phone in one row, so the row is allowed to break and each
 * item is kept whole with whitespace-nowrap.
 */
export function SiteHeader({ user }: { user: User | null }) {
  const link = "whitespace-nowrap transition hover:text-cream";

  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-5 sm:px-6">
      <Brand />
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cream/70 sm:gap-x-5">
        <Link href="/courses" className={link}>
          Courses
        </Link>
        {user ? (
          <>
            <Link href="/dashboard" className={link}>
              My practice
            </Link>
            <Link href="/account" className={link}>
              Account
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className={`${link} text-gold`}>
                Admin
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="whitespace-nowrap text-cream/50 transition hover:text-gold"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className={link}>
              Log in
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-pill bg-cream-cta px-4 py-2 font-semibold text-moss transition hover:bg-cream"
            >
              Start free
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
