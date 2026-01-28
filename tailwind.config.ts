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
        }
      }
    }
  },
  plugins: []
};

export default config;
