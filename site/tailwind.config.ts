import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#241a11",
            "--tw-prose-headings": "#150f08",
            "--tw-prose-lead": "#3d2e20",
            "--tw-prose-links": "#b45309",
            "--tw-prose-bold": "#150f08",
            "--tw-prose-counters": "#b45309",
            "--tw-prose-bullets": "#b45309",
            "--tw-prose-hr": "#e7d8c1",
            "--tw-prose-quotes": "#3d2e20",
            "--tw-prose-quote-borders": "#b45309",
            "--tw-prose-captions": "#8a6a4d",
            "--tw-prose-code": "#78350f",
            "--tw-prose-pre-code": "#150f08",
            "--tw-prose-pre-bg": "#f6efe2",
            "--tw-prose-th-borders": "#e7d8c1",
            "--tw-prose-td-borders": "#f3ece1",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        },
        lg: {
          css: {
            h2: {
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: "700",
              letterSpacing: "-0.015em",
              textWrap: "balance",
              borderBottom: "1px solid #e7d8c1",
              paddingBottom: "0.5rem",
            },
            h3: {
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: "600",
              letterSpacing: "-0.01em",
              textWrap: "balance",
              borderLeft: "3px solid #b45309",
              paddingLeft: "0.85rem",
            },
            "figure figcaption": {
              fontStyle: "italic",
              textAlign: "center",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
