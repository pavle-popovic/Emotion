import Link from "next/link";
import { redirect } from "next/navigation";

import { StyleStep } from "@/components/onboarding/StyleStep";
import { EyebrowLabel } from "@/components/ui";
import { getCurrentUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-16">
        <Link href="/" className="font-display text-2xl tracking-brand text-cream-surface">
          E&#8209;MOTION
        </Link>
        <Link href="/dashboard" className="text-sm text-on-velvet-faint hover:text-gold">
          Skip for now
        </Link>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-24 pt-10 sm:px-8">
        {/* One step today. The bar shows one of one rather than implying two
            more that do not exist. */}
        <div className="mb-12 flex gap-2.5">
          <div className="h-1 w-11 rounded-pill bg-gold" />
        </div>

        <div className="w-full max-w-[840px] text-center">
          <EyebrowLabel className="mb-4">Step 1 of 1</EyebrowLabel>
          <h1 className="mb-12 font-display text-[clamp(30px,4.4vw,44px)] leading-tight text-cream-surface">
            Which style calls you first?
          </h1>

          <StyleStep />

          <p className="mt-7 text-sm text-on-velvet-faint">
            You can switch or add styles anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
