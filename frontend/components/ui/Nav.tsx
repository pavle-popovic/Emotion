"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/actions";
import { cx } from "@/lib/cx";
import type { User } from "@/lib/types";

import { Avatar } from "./Data";

const PUBLIC_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/instructor", label: "Instructor" },
  { href: "/#pricing", label: "Pricing" },
];

const AUTHED_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/instructor", label: "Instructor" },
  { href: "/dashboard", label: "My profile" },
];

export function Nav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = user ? AUTHED_LINKS : PUBLIC_LINKS;

  // Close the sheet on navigation, and lock scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Every nav item is a 44px touch target, not just a line of text.
  const linkClass =
    "inline-flex min-h-[44px] items-center text-[15px] text-on-velvet-2 transition duration-[--dur] ease-ease hover:text-gold";

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-moss-900/[0.92] backdrop-blur-[10px]">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-page items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-16"
      >
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center font-display text-[22px] tracking-brand text-on-velvet transition duration-[--dur] ease-ease hover:text-gold sm:text-[26px]"
        >
          E&#8209;MOTION
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-10 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex min-h-[44px] items-center text-[15px] text-gold hover:underline"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                aria-label="Account"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <Avatar name={user.full_name || user.email} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[44px] items-center text-[15px] text-on-velvet hover:text-gold"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-pill bg-cream-blush px-7 py-3.5 text-[15px] font-medium text-moss transition duration-[--dur] ease-ease hover:bg-gold hover:text-white"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={cx(
              "h-0.5 w-6 bg-on-velvet transition duration-[--dur] ease-ease",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cx(
              "h-0.5 w-6 bg-on-velvet transition duration-[--dur] ease-ease",
              open && "opacity-0",
            )}
          />
          <span
            className={cx(
              "h-0.5 w-6 bg-on-velvet transition duration-[--dur] ease-ease",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </button>
      </nav>

      {/* Full-screen velvet sheet, not a squashed row. */}
      {open && (
        <div
          id="mobile-nav"
          className="bg-velvet fixed inset-x-0 bottom-0 top-[73px] z-40 overflow-y-auto lg:hidden"
        >
          <div className="flex flex-col gap-1 px-5 py-8 sm:px-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-hairline py-5 font-display text-2xl text-on-velvet"
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" className="border-b border-hairline py-5 font-display text-2xl text-gold">
                Admin
              </Link>
            )}
            <Link
              href={user ? "/account" : "/login"}
              className="border-b border-hairline py-5 font-display text-2xl text-on-velvet"
            >
              {user ? "Account" : "Log in"}
            </Link>

            <div className="pt-8">
              {user ? (
                <form action={logout}>
                  <button
                    type="submit"
                    className="min-h-[44px] text-[15px] text-on-velvet-faint hover:text-gold"
                  >
                    Log out
                  </button>
                </form>
              ) : (
                <Link
                  href="/register"
                  className="block rounded-pill bg-cream-blush px-7 py-4 text-center text-[15px] font-semibold text-moss"
                >
                  Start 7 days free
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
