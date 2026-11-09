import type { Config } from "tailwindcss";
import { PALETA } from "./src/lib/contraste";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: PALETA.fundo,
          raised: PALETA.card,
          deep: PALETA.trilho,
          border: PALETA.borda,
        },
        wine: {
          DEFAULT: "#fde4e0",
          light: "#f9cfc8",
        },
        nude: {
          DEFAULT: PALETA.verm2,
          light: PALETA.verm,
          warm: PALETA.texto,
        },
        verm: {
          DEFAULT: PALETA.verm,
          2: PALETA.verm2,
          3: PALETA.verm3,
        },
        feito: PALETA.feito,
        vital: PALETA.vital,
        muted: PALETA.texto2,
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
