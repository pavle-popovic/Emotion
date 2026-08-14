export function ProgressBar({
  percent,
  className = "",
  height = "h-1.5",
}: {
  percent: number;
  className?: string;
  height?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`${height} overflow-hidden rounded-pill bg-cream/[0.15] ${className}`}
    >
      <div
        className={`h-full rounded-pill transition-[width] duration-500 ${
          clamped === 100 ? "bg-gold" : "bg-jade"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
