import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser, listCourses } from "@/lib/api";
import { STYLE_HINTS, STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

export const dynamic = "force-dynamic";

const PRICE = "€29";

export default async function HomePage() {
  const [user, courses] = await Promise.all([getCurrentUser(), listCourses()]);
  const ctaHref = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Go to my practice" : "Start 7 days free";

  return (
    <>
      <SiteHeader user={user} />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-6 md:grid-cols-2 md:gap-14 md:pt-10">
          <div>
            <p className="label-caps mb-3.5">
              {STYLE_ORDER.map((s) => STYLE_LABELS[s]).join(" · ")}
            </p>
            <h1 className="mb-4 font-display text-[36px] font-normal leading-[1.12] md:text-5xl">
              Learn to move the way music makes you feel.
            </h1>
            <p className="mb-6 max-w-md text-[15px] leading-relaxed text-cream/70">
              Structured courses in four styles. No partner needed.
            </p>
            <div className="max-w-xs">
              <Link href={ctaHref} className="btn-cta">
                {ctaLabel}
              </Link>
              <p className="mt-3 text-center text-xs text-cream/50">
                then {PRICE}/month &middot; cancel anytime
              </p>
            </div>
          </div>

          <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] md:aspect-[4/5]">
            <Image
              src="/hero.jpg"
              alt="A dancer in a yellow suit, arms crossed, mid-pose"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* Styles */}
        <section className="pt-20">
          <p className="label-caps mb-2.5">Four styles, one home</p>
          <h2 className="mb-5 font-display text-2xl font-normal">Find your rhythm.</h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {STYLE_ORDER.map((style, index) => (
              <Link
                key={style}
                href={`/courses?style=${style}`}
                className="card-dark group overflow-hidden transition hover:border-gold/60"
              >
                <div className="flex h-24 items-end bg-gradient-to-br from-cream/[0.09] to-transparent p-4">
                  <span className="font-display text-3xl text-gold/70 transition group-hover:text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="px-3.5 pb-3.5 pt-3">
                  <div className="font-display text-base">{STYLE_LABELS[style]}</div>
                  <div className="mt-0.5 text-xs text-cream/55">{STYLE_HINTS[style]}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Courses */}
        <section className="pt-16">
          <div className="card-light px-6 py-7 md:px-9 md:py-9">
            <p className="mb-1.5 text-[11px] uppercase tracking-label text-gold">The courses</p>
            <h2 className="mb-4 font-display text-[22px] font-normal text-moss md:text-2xl">
              Everything, from day one.
            </h2>

            {courses.length === 0 ? (
              <p className="py-4 text-sm text-sage">
                The catalog is loading. Refresh in a moment.
              </p>
            ) : (
              <ul>
                {courses.map((course, index) => (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="group flex items-center gap-3.5 border-t border-moss/[0.12] py-3.5"
                    >
                      <span className="font-display text-[13px] text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-[15px] text-moss">
                          {course.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-sage-light">
                          {course.style_label} &middot; {course.lesson_count} lessons
                        </span>
                      </span>
                      <span className="text-base text-gold transition group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Pricing */}
        <section className="pt-6">
          <div className="card-light px-6 py-8 text-center md:py-10">
            <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-gold">
              E&#8209;motion Membership
            </div>
            <div className="font-display text-[44px] leading-none text-moss">
              {PRICE}
              <span className="text-[15px] text-sage-light">/month</span>
            </div>
            <p className="mb-5 mt-2.5 text-[13px] text-sage">
              All courses &middot; weekly drops &middot; cancel anytime
            </p>
            <div className="mx-auto max-w-xs">
              <Link href={ctaHref} className="btn-dark">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cream/10 py-8 text-center text-xs text-cream/40">
        E&#8209;motion &middot; Learn to move the way music makes you feel.
      </footer>
    </>
  );
}
