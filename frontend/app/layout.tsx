import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-motion",
  description: "A learning management system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full">
        <header className="border-b border-ink-700/60">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              E-motion
            </Link>
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/courses" className="transition hover:text-neutral-100">
                Courses
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
