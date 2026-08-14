import Link from "next/link";

import { cx } from "@/lib/cx";

const LEARN = [
  { href: "/courses", label: "Courses" },
  { href: "/instructor", label: "Instructor" },
  { href: "/#pricing", label: "Pricing" },
];

const ACCOUNT = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "My profile" },
];

function Column({ title, links }: { title: string; links: typeof LEARN }) {
  return (
    <div className="flex flex-col">
      <span className="text-[12px] uppercase tracking-wide text-gold">{title}</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-[44px] items-center text-sm text-on-velvet-2 transition duration-[--dur] ease-ease hover:text-gold"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cx("mt-24 border-t border-hairline bg-black/[0.28]", className)}>
      <div className="mx-auto grid max-w-page gap-10 px-5 py-18 sm:px-8 md:grid-cols-[1fr_auto] md:gap-18 lg:px-16">
        <div>
          <div className="mb-3.5 font-display text-2xl tracking-brand text-on-velvet">
            E&#8209;MOTION
          </div>
          <p className="max-w-[300px] text-sm leading-relaxed text-on-velvet-2">
            Online dance school for hip hop, kizomba, bachata and afrobeats. Move the way music
            makes you feel.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-18">
          <Column title="Learn" links={LEARN} />
          <Column title="Account" links={ACCOUNT} />
        </div>
      </div>

      <div className="mx-auto max-w-page px-5 pb-12 sm:px-8 lg:px-16">
        <div className="border-t border-hairline pt-6 text-[13px] text-on-velvet-faint">
          &copy; 2026 E&#8209;motion. Keep moving.
        </div>
      </div>
    </footer>
  );
}
