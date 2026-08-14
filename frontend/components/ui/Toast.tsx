"use client";

import { useEffect, useState } from "react";

import { cx } from "@/lib/cx";

/**
 * Transient confirmation. Rendered declaratively from form state rather than
 * pushed through a global queue — there is one producer (account settings) and
 * a queue would be more machinery than the app needs.
 */
export function Toast({
  message,
  tone = "success",
  duration = 4000,
}: {
  message: string | null;
  tone?: "success" | "error";
  duration?: number;
}) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-pill border px-6 py-3.5",
        "text-sm shadow-raised backdrop-blur-[10px]",
        tone === "success"
          ? "border-jade/60 bg-jade/20 text-jade-on"
          : "border-warn/70 bg-warn/20 text-warn-on",
      )}
    >
      {message}
    </div>
  );
}
