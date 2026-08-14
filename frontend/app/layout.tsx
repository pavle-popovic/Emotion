import type { Metadata, Viewport } from "next";
import { Figtree, Marcellus } from "next/font/google";

import "./globals.css";

const display = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Figtree({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-motion",
  description:
    "Learn to move the way music makes you feel. Structured hip hop, kizomba, bachata and afrobeats courses. No partner needed.",
};

export const viewport: Viewport = {
  themeColor: "#092E24",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-emotion min-h-full">{children}</body>
    </html>
  );
}
