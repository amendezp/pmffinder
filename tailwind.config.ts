import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zen palette — minimal observatory feel.
        zen: {
          bg: "#F8F9FA",
          text: "#2C3E50",
          light: "#95A5A6",
          line: "#E0E0E0",
          accent: "#7F8C8D",
          deep: "#1B2735",
        },
        // Legacy aliases — remapped to the zen palette so older components
        // pick up the new look without churn. Same hue family, monochrome.
        parchment: {
          50: "#F8F9FA",
          100: "#F1F3F5",
          200: "#E8EAED",
          300: "#D6DBDF",
          400: "#B4BCC2",
          500: "#95A5A6",
        },
        ink: {
          500: "#5D6D7E",
          600: "#4A5C6E",
          700: "#34495E",
          800: "#2C3E50",
          900: "#1B2735",
        },
        brass: {
          400: "#B4BCC2",
          500: "#95A5A6",
          600: "#7F8C8D",
        },
        compass: {
          rose: "#2C3E50",
          needle: "#2C3E50",
          dial: "#E0E0E0",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      boxShadow: {
        // Subtle flat shadow that fits the zen aesthetic. Re-used by older
        // components that referenced shadow-compass.
        compass: "0 1px 0 rgba(44,62,80,0.04), 0 4px 16px -8px rgba(44,62,80,0.10)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scan: "scan 4s ease-in-out infinite alternate",
        "spin-slow": "spin 30s linear infinite",
        "spin-medium": "spin 18s linear infinite",
        "spin-fast": "spin 12s linear infinite",
        "spin-reverse-slow": "spin 25s linear infinite reverse",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
