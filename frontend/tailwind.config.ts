import type { Config } from "tailwindcss";

/**
 * Mirrors the custom properties in app/globals.css. Tailwind v3 on purpose: v4
 * ignores this file and moves the palette into CSS.
 *
 * Every value here points at a token. If a component needs a colour, spacing
 * step or shadow that is not in this file, the answer is to use an existing
 * token, not to add a one-off.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
          hairline: "var(--ink-hairline)",
        },
        moss: {
          DEFAULT: "var(--moss)",
          600: "var(--moss-600)",
          700: "var(--moss-700)",
          800: "var(--moss-800)",
          900: "var(--moss-900)",
        },
        video: "var(--video)",
        cream: {
          DEFAULT: "var(--cream)",
          surface: "var(--cream-surface)",
          blush: "var(--cream-blush)",
        },
        gold: "var(--gold)",
        warn: {
          DEFAULT: "var(--warn)",
          on: "var(--warn-on)",
        },
        jade: {
          DEFAULT: "var(--jade)",
          on: "var(--jade-on)",
        },
        "on-velvet": {
          DEFAULT: "var(--on-velvet)",
          2: "var(--on-velvet-2)",
          faint: "var(--on-velvet-faint)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          strong: "var(--hairline-strong)",
        },
        glass: {
          DEFAULT: "var(--glass)",
          hover: "var(--glass-hover)",
          strong: "var(--glass-strong)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
        label: "0.24em",
        brand: "0.12em",
        wide: "0.1em",
      },
      borderRadius: {
        pill: "100px",
        input: "12px",
        card: "20px",
        panel: "32px",
      },
      boxShadow: {
        raised: "var(--shadow-raised)",
        panel: "var(--shadow-panel)",
      },
      spacing: {
        // The scale: 4 8 12 16 20 24 32 40 56 72 96 110. Tailwind covers the
        // first eight as 1-10; these are the four it lacks.
        14: "56px",
        18: "72px",
        24: "96px",
        27: "110px",
      },
      maxWidth: {
        panel: "1080px",
        page: "1280px",
        pricing: "460px",
        form: "400px",
      },
      transitionTimingFunction: {
        ease: "var(--ease)",
      },
      transitionDuration: {
        DEFAULT: "170ms",
      },
    },
  },
  plugins: [],
};

export default config;
