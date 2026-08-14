import type { Config } from "tailwindcss";

// Tailwind v3 on purpose: v4 ignores this file and moves the palette into CSS.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0b",
          900: "#121214",
          800: "#1c1c20",
          700: "#2a2a30",
        },
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#a892ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
