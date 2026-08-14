import Image from "next/image";

import { Footer } from "@/components/ui/Footer";
import { Nav } from "@/components/ui/Nav";
import {
  Button,
  Card,
  EyebrowLabel,
  ListRow,
  Panel,
  SectionHeading,
  StyleTag,
} from "@/components/ui";
import { getCurrentUser, listCourses } from "@/lib/api";
import { STYLE_HINTS, STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

export const dynamic = "force-dynamic";

const PRICE = "€29";

const PLAN_INCLUDES = [
  "All courses, all four styles",
  "New lessons & choreos weekly",
  "Mirrored view, slow-down & loop",
  "Track your progress per course",
  "Cancel anytime, two clicks",
];

const TEACHER_FACTS = [
  "12 years dancing, 8 years teaching",
  "Hip hop, kizomba, bachata & afrobeats specialist",
  "Taught 2,000+ students across Europe & India",
];

export default async function HomePage() {
  const [user, courses] = await Promise.all([getCurrentUser(), listCourses()]);
  const ctaHref = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Go to my practice" : "Start 7 days free";
  const lessonTotal = courses.reduce((sum, c) => sum + c.lesson_count, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav user={user} />

      <main className="flex-1">
        {/* Hero ------------------------------------------------------------ */}
        <header className="mx-auto grid max-w-page items-center gap-18 px-5 pb-27 pt-16 sm:px-8 lg:grid-cols-2 lg:px-16 lg:pt-24">
          <div>
            <EyebrowLabel className="mb-6">
              {STYLE_ORDER.map((s) => STYLE_LABELS[s]).join(" · ")}
            </EyebrowLabel>
            <h1 className="mb-7 max-w-[12ch] text-pretty font-display text-[clamp(40px,4.5vw,64px)] leading-[1.08] text-on-velvet">
              Learn to move the way music makes you feel.
            </h1>
            <p className="mb-10 max-w-[480px] text-[19px] leading-relaxed text-on-velvet-2">
              Structured video courses in four styles, taught with warmth and real progression. No
              partner needed. Learn at your own pace, anywhere.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Button href={ctaHref} size="lg">
                {ctaLabel}
              </Button>
              <span className="text-sm text-on-velvet-faint">
                then {PRICE}/month &middot; cancel anytime
              </span>
            </div>
          </div>

          <div className="relative pb-14 lg:pb-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
              <Image
                src="/hero.jpg"
                alt="Sanjay MJ, E-motion's instructor, mid-pose in a yellow suit"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Stat card overlapping the image's bottom-left. */}
            <div className="absolute -bottom-0 left-0 flex gap-7 rounded-[18px] bg-cream-surface px-7 py-6 text-moss shadow-raised lg:-bottom-6 lg:-left-6">
              {[
                { value: lessonTotal > 0 ? `${lessonTotal}` : "—", label: "Lessons" },
                { value: String(STYLE_ORDER.length), label: "Styles" },
                { value: "Weekly", label: "New drops" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-[26px]">{stat.value}</div>
                  <div className="text-[12px] uppercase tracking-wide text-ink-faint">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Styles ---------------------------------------------------------- */}
        <section className="mx-auto max-w-page px-5 pb-24 sm:px-8 lg:px-16">
          <SectionHeading eyebrow="Four styles, one home" title="Find the rhythm that fits you." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {STYLE_ORDER.map((style, index) => (
              <Card key={style} interactive className="overflow-hidden">
                <a href={`/courses?style=${style}`} className="block">
                  <div className="flex aspect-[4/3] items-end bg-gradient-to-br from-glass-hover to-transparent p-6">
                    <span className="font-display text-[44px] leading-none text-gold/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="px-6 pb-7 pt-6">
                    <h3 className="mb-2.5 font-display text-[22px] text-on-velvet">
                      {STYLE_LABELS[style]}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-velvet-2">{STYLE_HINTS[style]}</p>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        </section>

        {/* Courses --------------------------------------------------------- */}
        <section id="courses" className="mx-auto max-w-panel px-5 pb-27 sm:px-8 lg:px-16">
          <Panel>
            <SectionHeading
              tone="cream"
              eyebrow="The courses"
              title="Everything, from day one."
              lede="A clear list of full courses. Start anywhere, follow each one lesson by lesson. New lessons and choreographies every week."
            />
            <div className="mt-14 flex flex-col">
              {courses.map((course, index) => (
                <ListRow
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  index={index + 1}
                  title={course.title}
                  subtitle={course.summary}
                  tag={<StyleTag>{course.style_label}</StyleTag>}
                  meta={`${course.lesson_count} lessons`}
                />
              ))}
            </div>
          </Panel>
        </section>

        {/* Instructor ------------------------------------------------------ */}
        <section className="bg-cream-blush py-24">
          <div className="mx-auto grid max-w-page items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
              <Image
                src="/hero.jpg"
                alt="Portrait of Sanjay MJ"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="text-ink">
              <SectionHeading
                tone="cream"
                eyebrow="Your teacher"
                title="Sanjay MJ — The Indian Magic"
                lede="Every course on E-motion is taught by Sanjay: patient, precise, and impossible not to smile with. He breaks every move down to its feeling, not just its steps."
              />
              <ul className="mb-10 mt-8 flex flex-col gap-3.5 text-base">
                {TEACHER_FACTS.map((fact) => (
                  <li key={fact} className="flex items-baseline gap-3">
                    <span aria-hidden className="text-gold">
                      &#9670;
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>
              <Button href="/instructor" variant="link">
                Meet Sanjay &rarr;
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing --------------------------------------------------------- */}
        <section id="pricing" className="mx-auto max-w-page px-5 py-27 text-center sm:px-8 lg:px-16">
          <SectionHeading
            align="center"
            eyebrow="One plan, everything included"
            title="Simple, like it should be."
          />
          <div className="mx-auto mt-14 max-w-pricing rounded-[28px] bg-cream-surface px-8 py-14 text-ink shadow-panel sm:px-12">
            <div className="mb-5 text-[13px] uppercase tracking-label text-gold">
              E&#8209;motion Membership
            </div>
            <div className="font-display text-[64px] leading-none text-moss">
              {PRICE}
              <span className="text-[20px] text-ink-faint">/month</span>
            </div>
            <div className="my-9 h-px bg-ink-hairline" />
            <ul className="flex flex-col gap-4 text-left text-base">
              {PLAN_INCLUDES.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-gold">
                    &#10003;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button href={ctaHref} variant="emerald" size="lg" fullWidth className="mt-10">
              {ctaLabel}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
