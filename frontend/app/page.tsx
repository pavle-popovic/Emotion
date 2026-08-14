import Link from "next/link";

export default function HomePage() {
  return (
    <section className="py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">E-motion</h1>
      <p className="mt-4 max-w-xl text-neutral-400">
        A learning management system. The scaffold is live: Next.js on Vercel, FastAPI
        on Railway, Postgres on Supabase.
      </p>
      <Link
        href="/courses"
        className="mt-8 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft"
      >
        Browse courses
      </Link>
    </section>
  );
}
