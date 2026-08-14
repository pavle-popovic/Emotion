import Link from "next/link";

import { cx } from "@/lib/cx";

export type ButtonVariant = "cream" | "emerald" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  // Cream pill on velvet — the primary call to action.
  cream: "bg-cream-blush text-moss hover:bg-gold hover:text-white",
  // Emerald pill on cream panels, where a cream button would vanish.
  emerald: "bg-moss text-cream-surface hover:bg-gold hover:text-white",
  ghost: "border border-hairline-strong text-on-velvet hover:border-gold hover:text-gold",
  link: "text-gold underline-offset-4 hover:underline p-0 rounded-none",
};

/** Min height 44px at every size, for touch. */
const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-[44px] px-5 py-3 text-sm",
  md: "min-h-[44px] px-7 py-3.5 text-[15px]",
  lg: "min-h-[52px] px-10 py-4 text-[17px]",
};

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type Props = Common &
  ({ href: string; type?: never } & Omit<React.ComponentProps<typeof Link>, "href" | "className">
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>));

export function Button({
  variant = "cream",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: Props) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "transition duration-[--dur] ease-ease disabled:cursor-not-allowed disabled:opacity-60",
    variant === "link" ? "font-medium" : "rounded-pill",
    variant !== "link" && SIZES[size],
    VARIANTS[variant],
    fullWidth && "w-full",
    className,
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as { href: string };
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonRest.type ?? "button"} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
