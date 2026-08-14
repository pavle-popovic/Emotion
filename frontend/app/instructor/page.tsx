import Image from "next/image";

import { PageShell } from "@/components/PageShell";
import { Button, Card, EyebrowLabel, SectionHeading } from "@/components/ui";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

const FACTS = [
  { big: "12 yrs", small: "Dancing across four styles" },
  { big: "8 yrs", small: "Teaching in studios & online" },
  { big: "2,000+", small: "Students taught across Europe & India" },
  { big: "4", small: "Styles: hip hop, kizomba, bachata, afrobeats" },
];

const APPROACHES = [
  {
    style: "Hip hop",
    title: "Groove before choreography",
    desc: "Bounce and rock until they live in your body, then vocabulary, then routines. Freestyle confidence is the goal, not memorised counts.",
  },
  {
    style: "Kizomba",
    title: "Connection you can feel",
    desc: "Posture and walking come first. Sanjay teaches the lead and follow side of every movement so you understand both halves of the dance.",
  },
  {
    style: "Bachata",
    title: "Timing that feels good",
    desc: "Basic step, turns and body movement layered gradually — with musicality drills so you dance to the song, not through it.",
  },
  {
    style: "Afrobeats",
    title: "Joy is the technique",
    desc: "Legwork and isolations broken into slow drills, then brought up to tempo with the energy the music demands.",
  },
];

export default async function InstructorPage() {
  const user = await getCurrentUser();

  return (
    <PageShell user={user}>
      <header className="mx-auto max-w-panel py-24 text-center">
        <EyebrowLabel className="mb-5">Your teacher</EyebrowLabel>
        <h1 className="mb-6 font-display text-[clamp(40px,5vw,58px)] leading-[1.1] text-on-velvet">
          Sanjay MJ
        </h1>
        <p className="mx-auto max-w-[520px] text-xl leading-relaxed text-on-velvet-2">
          Known on the floor as <em>The Indian Magic</em>. One teacher, four styles, and a way of
          explaining movement that just clicks.
        </p>
      </header>

      <section className="grid items-start gap-18 pb-24 lg:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
            <Image
              src="/hero.jpg"
              alt="Portrait of Sanjay MJ"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 right-0 rounded-[16px] bg-gold px-7 py-5 font-display text-lg text-white shadow-raised lg:-right-5">
            &ldquo;The Indian Magic&rdquo;
          </div>
        </div>

        <div>
          <SectionHeading title="Movement first. Steps second." />
          <p className="mt-6 text-[17px] leading-[1.75] text-on-velvet-2">
            Sanjay started in hip hop battles in Mumbai, fell for kizomba in Lisbon, and spent the
            last decade teaching bachata and afrobeats across Europe. What ties it together is his
            method: feel the music before you count it.
          </p>
          <p className="mt-5 text-[17px] leading-[1.75] text-on-velvet-2">
            Every E&#8209;motion lesson is filmed with mirrored and back views, broken into short
            focused drills, and taught the way he teaches in the room — warm, unhurried, and always
            with a reason behind every move.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FACTS.map((fact) => (
              <div key={fact.big} className="rounded-[18px] bg-cream-blush px-7 py-6 text-ink">
                <div className="mb-1.5 font-display text-[30px] text-moss">{fact.big}</div>
                <div className="text-sm leading-relaxed text-ink-muted">{fact.small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <SectionHeading align="center" title="How Sanjay teaches each style" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {APPROACHES.map((item) => (
            <Card key={item.style} className="px-9 py-9">
              <EyebrowLabel className="mb-3.5 text-[12px] tracking-label">{item.style}</EyebrowLabel>
              <h3 className="mb-3 font-display text-[23px] text-cream-surface">{item.title}</h3>
              <p className="text-[15px] leading-[1.7] text-on-velvet-2">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-24 text-center">
        <h2 className="mb-5 font-display text-[clamp(28px,3.4vw,38px)] text-on-velvet">
          Learn with Sanjay, from today.
        </h2>
        <p className="mb-10 text-[17px] text-on-velvet-2">
          7 days free, then €29/month. Cancel anytime.
        </p>
        <Button href={user ? "/dashboard" : "/register"} size="lg">
          {user ? "Go to my practice" : "Start 7 days free"}
        </Button>
      </section>
    </PageShell>
  );
}
