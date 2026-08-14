import type { Config } from "tailwindcss";

// Tailwind v3 on purpose: v4 ignores this file and moves the palette into CSS.
// Palette is lifted verbatim from the E-motion design canvas.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#21302A",
        moss: {
          DEFAULT: "#0F3D33",
          600: "#104836",
          700: "#145643",
          800: "#0E4033",
          900: "#092E24",
        },
        cream: {
          DEFAULT: "#F3E9E1",
          page: "#E9E2DA",
          card: "#F6EDE8",
          cta: "#F0DCD3",
        },
        gold: "#B08D57",
        sage: {
          DEFAULT: "#54655D",
          light: "#8A968E",
        },
        jade: "#3D9B7C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.26em",
        brand: "0.12em",
      },
      borderRadius: {
        pill: "100px",
      },
    },
  },
  plugins: [],
};

export default config;
