import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        canvas: "var(--color-bg)",
        "canvas-muted": "var(--color-bg-muted)",
        surface: "var(--color-surface)",
        "surface-strong": "var(--color-surface-strong)",
        ink: "var(--color-text)",
        "ink-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        "accent-soft": "var(--color-accent-soft)",
        brand: {
          50: "#f7f2ea",
          100: "#f0e3d0",
          200: "#e4c8a2",
          300: "#d3a873",
          400: "#bf8646",
          500: "#a66a30",
          600: "#865125",
          700: "#683d1b",
          800: "#4d2c13",
          900: "#37200d"
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        elevated: "var(--shadow-elevated)",
      },
    }
  },
  plugins: []
};

export default config;
