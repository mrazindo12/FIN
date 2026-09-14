import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fin: {
          navy: "#0A1F44",
          "navy-deep": "#071426",
          "navy-light": "#1E3A8A",
          gold: "#F5B927",
          "gold-dark": "#E6AE06",
          "gold-accent": "#FFC72C",
          paper: "#F7F4EB",
          paper2: "#EFE9DC",
          ink: "#0B1C36",
          ink2: "#54607A",
          muted: "#64748B",
          border: "#E2E8F0",
          bg: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-poppins)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
