import { cx } from "@/lib/cx";

type Tone = "cream" | "velvet";

const FIELD: Record<Tone, string> = {
  // On cream panels (auth, admin forms).
  cream: "border-ink-hairline bg-white text-ink placeholder:text-ink-faint",
  // On velvet surfaces.
  velvet: "border-hairline-strong bg-glass text-on-velvet placeholder:text-on-velvet-faint",
};

const LABEL: Record<Tone, string> = {
  cream: "text-ink-muted",
  velvet: "text-on-velvet-2",
};

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  tone?: Tone;
  error?: string | null;
  hint?: React.ReactNode;
  containerClassName?: string;
};

export function Input({
  label,
  tone = "cream",
  error,
  hint,
  id,
  className,
  containerClassName,
  ...rest
}: Props) {
  const fieldId = id ?? `field-${rest.name ?? label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cx("flex flex-col gap-2", containerClassName)}>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={fieldId}
          className={cx("text-[13px] uppercase tracking-wide", LABEL[tone])}
        >
          {label}
        </label>
        {hint}
      </div>

      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(
          "min-h-[52px] w-full rounded-input border px-4 py-4 text-base outline-none",
          "transition duration-[--dur] ease-ease",
          FIELD[tone],
          error && "border-warn",
          className,
        )}
        {...rest}
      />

      {error && (
        <p id={errorId} role="alert" className="text-[13px] text-warn-on">
          {error}
        </p>
      )}
    </div>
  );
}
