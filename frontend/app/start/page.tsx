import { redirect } from "next/navigation";

import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { chooseStyle } from "@/lib/actions";
import { getCurrentUser } from "@/lib/api";
import { STYLE_HINTS, STYLE_LABELS, STYLE_ORDER } from "@/lib/types";

export const dynamic = "force-dynamic";

const NUMERALS = ["I", "II", "III", "IV"];

export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <Brand />
      </div>

      <h1 className="mb-8 text-center font-display text-[30px] font-normal leading-tight">
        Which style calls you first?
      </h1>

      <div className="flex flex-col gap-3.5">
        {STYLE_ORDER.map((style, index) => (
          <form key={style} action={chooseStyle.bind(null, style)}>
            <SubmitButton
              className="flex w-full items-center gap-[18px] rounded-2xl border border-cream/[0.15] bg-cream/[0.05] px-[22px] py-5 text-left transition hover:border-gold/60 hover:bg-cream/[0.08] disabled:opacity-60"
              pendingLabel="Setting up..."
            >
              <span className="w-7 shrink-0 font-display text-xl text-gold">{NUMERALS[index]}</span>
              <span>
                <span className="block font-display text-lg">{STYLE_LABELS[style]}</span>
                <span className="mt-0.5 block text-[13px] text-cream/60">{STYLE_HINTS[style]}</span>
              </span>
            </SubmitButton>
          </form>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px] text-cream/50">
        You can switch or add styles anytime.
      </p>
    </main>
  );
}
