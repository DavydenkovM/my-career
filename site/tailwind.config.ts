import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          50: "#faf7f2",
          100: "#f3ece1",
          200: "#e7d8c1",
          300: "#d2b894",
          400: "#b89271",
          500: "#8a6a4d",
          600: "#5d4732",
          700: "#3d2e20",
          800: "#241a11",
          900: "#150f08",
        },
        paper: {
          DEFAULT: "#fdfaf4",
          deep: "#f6efe2",
        },
        accent: {
          DEFAULT: "#b45309", // amber-700
          soft: "#fde68a", // amber-200
          deep: "#78350f", // amber-900
        },
      },
      maxWidth: {
        prose: "70ch",
      },
    },
  },
  plugins: [],
};

export default config;
