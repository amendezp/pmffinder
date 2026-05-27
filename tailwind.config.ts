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
        // Cyber/radar palette
        cyber: {
          bg: "#050814",
          fg: "#00f0ff",
          pink: "#ff0055",
          green: "#00ff88",
          deep: "#0a0f24",
          panel: "#0c1530",
        },
        "neon-cyan": "#00f0ff",
        "neon-pink": "#ff0055",
        "neon-green": "#00ff88",
        "deep-blue": "#050814",

        // Aliases (mapped to the cyber palette so existing components inherit
        // the new look). The "zen-text" used to be dark; now it's white, etc.
        zen: {
          bg: "#050814",
          text: "#ffffff",
          light: "rgba(0,240,255,0.6)",
          line: "rgba(0,240,255,0.2)",
          accent: "#00f0ff",
          deep: "#0a0f24",
        },
        parchment: {
          50: "#050814",
          100: "#0a0f24",
          200: "#14213a",
          300: "rgba(0,240,255,0.4)",
          400: "rgba(0,240,255,0.6)",
          500: "#00f0ff",
        },
        ink: {
          500: "rgba(0,240,255,0.5)",
          600: "rgba(0,240,255,0.7)",
          700: "rgba(0,240,255,0.85)",
          800: "#00f0ff",
          900: "#ffffff",
        },
        brass: {
          400: "rgba(0,240,255,0.6)",
          500: "#00f0ff",
          600: "#00f0ff",
        },
        compass: {
          rose: "#00f0ff",
          needle: "#ffffff",
          dial: "rgba(0,240,255,0.2)",
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        sans: ['"Space Mono"', "ui-monospace", "monospace"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      boxShadow: {
        compass: "0 0 12px rgba(0,240,255,0.45), 0 0 0 1px rgba(0,240,255,0.3)",
        "cyber-glow": "0 0 20px rgba(0,240,255,0.5)",
        "cyber-pink-glow": "0 0 20px rgba(255,0,85,0.5)",
        "cyber-green-glow": "0 0 14px rgba(0,255,136,0.55)",
        "cyber-inner": "inset 0 0 30px rgba(0,240,255,0.1)",
      },
      dropShadow: {
        glow: "0 0 8px rgba(0,240,255,0.6)",
        "glow-pink": "0 0 8px rgba(255,0,85,0.6)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        scan: "scan 4s ease-in-out infinite alternate",
        "scan-line": "scan-line 3s linear infinite",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 30s linear infinite",
        "spin-medium": "spin 18s linear infinite",
        "spin-fast": "spin 12s linear infinite",
        "spin-reverse-slow": "spin 25s linear infinite reverse",
        "fade-up": "fade-up 0.6s ease-out both",
        flicker: "flicker 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
