import Link from "next/link";

/** The wordmark. Non-breaking hyphen so "E-motion" never wraps mid-word. */
export function Brand({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`font-display text-xl tracking-brand text-cream transition hover:text-gold ${className}`}
    >
      E&#8209;MOTION
    </Link>
  );
}
