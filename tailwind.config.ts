import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ShieldProp DA (from validated maquette v5) — Attio/Vercel light, warm off-white
        paper: "#fbfbfa",       // warm off-white background
        card: "#ffffff",        // pure white cards
        line: "#eceae4",        // fine 1px borders
        ink: "#131722",         // near-black text (TradingView ink)
        muted: "#6b6a63",       // muted labels
        // Functional colors ONLY (never decorative)
        danger: "#c4362f",      // red — do not trade
        caution: "#b9791f",     // amber — caution
        ok: "#2f7d4f",          // green — allowed
        accent: "#131722",      // single functional accent
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl2: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(19,23,34,0.04), 0 1px 1px rgba(19,23,34,0.03)",
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
