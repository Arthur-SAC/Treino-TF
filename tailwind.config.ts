import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#1a0a0e",
          raised: "#2a1419",
          deep: "#0a0506",
          border: "#4a2935",
        },
        wine: {
          DEFAULT: "#5c1a2b",
          light: "#8b3a4a",
        },
        nude: {
          DEFAULT: "#d4a373",
          light: "#e8b9a6",
          warm: "#f4e4d6",
        },
        muted: "#a87a6a",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
