import Image from "next/image";
import Link from "next/link";

import { cx } from "@/lib/cx";

/**
 * Split auth layout: cream form panel on one side, velvet + photo on the other.
 * Below `lg` the photo side is dropped entirely and the form gets a slim velvet
 * header, rather than shrinking a photo nobody can see into the scroll.
 */
export function AuthLayout({
  side = "right",
  aside,
  children,
}: {
  /** Which side the form sits on at desktop. */
  side?: "left" | "right";
  aside: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Slim velvet header, mobile only. */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
        <Link href="/" className="font-display text-[22px] tracking-brand text-on-velvet">
          E&#8209;MOTION
        </Link>
      </header>

      <aside
        className={cx(
          "bg-velvet relative hidden lg:block",
          side === "right" ? "lg:order-1" : "lg:order-2",
        )}
      >
        <Image
          src="/hero.jpg"
          alt=""
          aria-hidden
          fill
          sizes="50vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-moss/20 to-moss/75 p-16">
          {aside}
        </div>
      </aside>

      <div
        className={cx(
          "flex items-center justify-center bg-cream-surface px-5 py-14 sm:px-8 lg:px-16 lg:py-16",
          side === "right" ? "lg:order-2" : "lg:order-1",
        )}
      >
        <div className="w-full max-w-form">
          <Link
            href="/"
            className="hidden font-display text-2xl tracking-brand text-moss lg:inline-block"
          >
            E&#8209;MOTION
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
