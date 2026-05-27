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
        // Cartographic palette — parchment + ink + brass
        parchment: {
          50: "#fbf7ee",
          100: "#f4ecd6",
          200: "#e8d8ab",
          300: "#d9bd78",
          400: "#caa14a",
          500: "#b78732",
        },
        ink: {
          900: "#15110a",
          800: "#221b10",
          700: "#352a1c",
          600: "#4a3a26",
          500: "#5e4a30",
        },
        brass: {
          400: "#c79b46",
          500: "#a87d2c",
          600: "#7d5a1c",
        },
        compass: {
          rose: "#8a3324",
          needle: "#1f1a14",
          dial: "#e8d8ab",
        },
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "parchment-noise":
          "radial-gradient(at 30% 20%, rgba(199,155,70,0.10), transparent 50%), radial-gradient(at 80% 80%, rgba(138,51,36,0.08), transparent 50%)",
      },
      boxShadow: {
        compass: "0 10px 30px -10px rgba(0,0,0,0.4), inset 0 0 40px rgba(120,90,30,0.15)",
      },
      keyframes: {
        "needle-wobble": {
          "0%, 100%": { transform: "rotate(var(--needle-angle, 0deg))" },
          "50%": { transform: "rotate(calc(var(--needle-angle, 0deg) + 2deg))" },
        },
      },
      animation: {
        "needle-wobble": "needle-wobble 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
