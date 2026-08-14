import { cx } from "@/lib/cx";
import type { User } from "@/lib/types";

import { Footer } from "./ui/Footer";
import { Nav } from "./ui/Nav";

/**
 * Nav + content + footer. Every full page uses this so the chrome can never
 * drift between screens. Pages that are deliberately chromeless (auth split
 * layouts, the player) opt out by not using it.
 */
export function PageShell({
  user,
  children,
  width = "page",
  footer = true,
  className,
}: {
  user: User | null;
  children: React.ReactNode;
  width?: "page" | "panel";
  footer?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav user={user} />
      <main
        className={cx(
          "mx-auto w-full flex-1 px-5 pb-24 sm:px-8 lg:px-16",
          width === "page" ? "max-w-page" : "max-w-panel",
          className,
        )}
      >
        {children}
      </main>
      {footer && <Footer />}
    </div>
  );
}
