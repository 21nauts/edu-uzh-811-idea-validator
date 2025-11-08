import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#1a1d23",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#7FE0C3",
          foreground: "#1a1d23",
        },
        secondary: {
          DEFAULT: "#23262e",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#6BA4FF",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "rgba(255, 255, 255, 0.7)",
        },
        border: "rgba(255, 255, 255, 0.1)",
        mint: {
          primary: "#7FE0C3",
          secondary: "#5DD4B4",
          muted: "#4AB89E",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.08)",
          heavy: "rgba(255, 255, 255, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Noto Sans JP", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      backdropBlur: {
        glass: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
